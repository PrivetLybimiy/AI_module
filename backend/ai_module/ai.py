from datetime import timedelta
from typing import Dict, Any
from django.utils import timezone
from openai import OpenAI
import time
from .models import Student, Course, Grade, AIReport, AIUsageStats, Group, AIGroupReport
from .prompts import STUDENT_REPORT_PROMPT, GROUP_REPORT_PROMPT

AI_TOKEN = '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'

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=AI_TOKEN,
)

def update_ai_usage_stats(start_time: float) -> AIUsageStats:
    stats, _ = AIUsageStats.objects.get_or_create(id=1)
    stats.request_count += 1
    last_24h = timezone.now() - timedelta(hours=24)
    if stats.last_updated < last_24h:
        stats.last_24h_requests = 0
    stats.last_24h_requests += 1
    response_time = time.time() - start_time
    stats.total_response_time += response_time
    stats.updated_at = timezone.now()
    stats.save()
    return stats

def get_grade_info(grade: Grade) -> Dict[str, Any]:
    topic_name = grade.topic.name if hasattr(grade, 'topic') and grade.topic else "Общая оценка"
    return {
        "topic": topic_name,
        "grade": grade.grade,
        "comment": grade.comment or "Нет комментария",
        "created_at": grade.created_at.strftime("%Y-%m-%d %H:%M:%S")
    }

def generate_student_report_data(student: Student, course: Course, grades: Grade) -> tuple[str, list]:
    report_data = f"Отчет о студенте {student.full_name} по курсе {course.title}:\n\nОценки:\n"
    grades_list = []
    for grade in grades:
        grade_info = get_grade_info(grade)
        grades_list.append(grade_info)
        report_data += f"- Тема: {grade_info['topic']}, Оценка: {grade_info['grade']}, Комментарий: {grade_info['comment']}\n"
    return report_data, grades_list

def generate_group_report_data(group: Group, course: Course, students: list) -> tuple[str, list]:
    report_data = f"Отчет о группе {group.name} по курсу {course.title}:\n\n"
    grades_list = []
    student_summaries = []
    for student in students:
        student_grades = Grade.objects.filter(student=student, course=course)
        if student_grades.exists():
            avg_grade = sum(g.grade for g in student_grades) / student_grades.count()
            student_summary = f"Студент: {student.full_name}, Средняя оценка: {avg_grade:.2f}\n"
            for grade in student_grades:
                grade_info = get_grade_info(grade)
                grade_info["student"] = student.full_name
                grades_list.append(grade_info)
                student_summary += f"- Тема: {grade_info['topic']}, Оценка: {grade_info['grade']}, Комментарий: {grade_info['comment']}\n"
            student_summaries.append(student_summary)
    
    report_data += "\n".join(student_summaries)
    total_grades = Grade.objects.filter(student__in=students, course=course)
    avg_group_grade = sum(g.grade for g in total_grades) / total_grades.count() if total_grades else 0
    report_data += f"\nСредняя оценка по группе: {avg_group_grade:.2f}\nКоличество студентов: {students.count()}"
    return report_data, grades_list

def call_openai_api(prompt: str) -> str:
    completion = client.chat.completions.create(
        model="deepseek/deepseek-chat",
        messages=[{"role": "user", "content": prompt}]
    )
    if not completion.choices or not completion.choices[0].message or not completion.choices[0].message.content:
        raise ValueError("Нет данных от OpenAI для анализа")
    report_text = completion.choices[0].message.content.strip()
    paragraphs = [p.strip() for p in report_text.split('\n\n') if p.strip()]
    return '\n\n'.join(paragraphs)

def generate_ai_report(student_id: int, course_id: int) -> Dict[str, Any]:
    start_time = time.time()
    try:
        student = Student.objects.get(id=student_id)
        course = Course.objects.get(id=course_id)
        student_grades = Grade.objects.filter(student=student, course=course)

        if not student_grades.exists():
            update_ai_usage_stats(start_time)
            return {
                "error": f"Нет оценок для {student.full_name} на курсе {course.title}.",
                "success": False
            }

        report_data, grades_list = generate_student_report_data(student, course, student_grades)
        prompt = STUDENT_REPORT_PROMPT.format(report_data=report_data)
        report_text = call_openai_api(prompt)

        stats = update_ai_usage_stats(start_time)
        stats.success_count += 1
        stats.save()

        ai_report = AIReport.objects.create(
            student=student,
            course=course,
            report=report_text,
            is_latest=True
        )

        return {
            "report_id": str(ai_report.id),
            "student": {
                "full_name": student.full_name,
                "email": student.email or "Нет данных",
                "id": str(student.id),
                "created_at": student.created_at.strftime("%Y-%m-%d %H:%M:%S")
            },
            "course": {
                "title": course.title
            },
            "grades": grades_list,
            "analysis": report_text,
            "success": True,
            "is_latest": True
        }

    except (Student.DoesNotExist, Course.DoesNotExist) as e:
        update_ai_usage_stats(start_time)
        return {"error": str(e) or "Студент или курс не найдены", "success": False}
    except Exception as e:
        update_ai_usage_stats(start_time)
        return {"error": f"Ошибка при генерации отчета: {str(e)}", "success": False}

def generate_ai_group_report(group_id: int, course_id: int) -> Dict[str, Any]:
    start_time = time.time()
    try:
        group = Group.objects.get(id=group_id)
        course = Course.objects.get(id=course_id)
        students = Student.objects.filter(courses__course=course, courses__group=group).distinct()

        if not students.exists():
            update_ai_usage_stats(start_time)
            return {"success": False, "error": "В группе нет студентов для этого курса"}

        report_data, grades_list = generate_group_report_data(group, course, students)
        if not grades_list:
            update_ai_usage_stats(start_time)
            return {"success": False, "error": "Оценки для группы отсутствуют"}

        prompt = GROUP_REPORT_PROMPT.format(report_data=report_data)
        report_text = call_openai_api(prompt)

        stats = update_ai_usage_stats(start_time)
        stats.success_count += 1
        stats.save()

        ai_group_report = AIGroupReport.objects.create(
            group=group,
            course=course,
            report=report_text,
            is_latest=True
        )

        return {
            "report_id": str(ai_group_report.id),
            "group": {
                "id": str(group.id),
                "name": group.name,
                "students": [
                    {
                        "id": str(student.id),
                        "full_name": student.full_name,
                        "email": student.email or "Нет данных"
                    }
                    for student in students
                ]
            },
            "course": {
                "title": course.title
            },
            "grades": grades_list,
            "analysis": report_text,
            "success": True,
            "is_latest": True
        }

    except (Group.DoesNotExist, Course.DoesNotExist) as e:
        update_ai_usage_stats(start_time)
        return {"success": False, "error": str(e) or "Группа или курс не найдены"}
    except Exception as e:
        update_ai_usage_stats(start_time)
        return {"success": False, "error": f"Ошибка при генерации отчета: {str(e)}"}