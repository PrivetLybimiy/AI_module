from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils import timezone
from django.contrib.auth import authenticate
from datetime import timedelta, datetime
from rest_framework_simplejwt.tokens import RefreshToken
import pytz
from .ai import generate_ai_report, generate_ai_group_report
from .serializers import UserSerializer, CourseSerializer, UserCreateSerializer
from .models import User, Course, UserCourse, AIUsageStats, Group, Student, AIReport, AIGroupReport, Grade

MOSCOW_TZ = pytz.timezone("Europe/Moscow")
DEFAULT_ERROR = "Произошла ошибка: {str(e)}"
ADMIN_ONLY = "Доступ разрешен только администраторам"
NOT_FOUND = "Не найден"
INVALID_PARAMS = "Неверные параметры"

def get_user_courses(user):
    if user.role == User.Role.ADMIN:
        return Course.objects.prefetch_related("students__student", "groups__students__student")
    user_courses = UserCourse.objects.filter(user=user).select_related("course")
    return Course.objects.filter(id__in=[uc.course.id for uc in user_courses]).prefetch_related(
        "students__student", "groups__students__student"
    )

def validate_dates(date_from, date_to):
    start_datetime = None
    end_datetime = None

    if date_from:
        try:
            date_from_dt = datetime.strptime(date_from, "%Y-%m-%d")
            start_datetime = MOSCOW_TZ.localize(datetime.combine(date_from_dt, datetime.min.time()))
        except ValueError:
            raise ValueError("Неверный формат date_from. Используйте YYYY-MM-DD")

    if date_to:
        try:
            date_to_dt = datetime.strptime(date_to, "%Y-%m-%d")
            end_datetime = MOSCOW_TZ.localize(datetime.combine(date_to_dt, datetime.max.time()))
        except ValueError:
            raise ValueError("Неверный формат date_to. Используйте YYYY-MM-DD")

    if date_from and date_to and date_from == date_to:
        end_datetime = start_datetime + timedelta(days=1) - timedelta(seconds=1)

    return start_datetime, end_datetime

def handle_exception(e, default_message=DEFAULT_ERROR):
    return Response({"error": default_message.format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            email = request.data.get("email")
            password = request.data.get("password")
            if not email or not password:
                return Response(
                    {"error": "Email и пароль обязательны"}, status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(request, email=email, password=password)
            if user:
                user.last_login = timezone.now()
                user.save()
                refresh = RefreshToken.for_user(user)
                return Response(
                    {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                        "user": UserSerializer(user).data,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"error": "Неверный email или пароль"}, status=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return handle_exception(e)

class CourseListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            courses = get_user_courses(request.user)
            if not courses.exists():
                return Response({"detail": "Курсы не найдены"}, status=status.HTTP_404_NOT_FOUND)
            return Response(CourseSerializer(courses, many=True).data, status=status.HTTP_200_OK)
        except Exception as e:
            return handle_exception(e)

class CourseDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        try:
            user = request.user
            course = (
                Course.objects.prefetch_related("students__student", "groups__students__student")
                .get(id=course_id)
                if user.role == User.Role.ADMIN
                else Course.objects.filter(id=course_id, curators__user=user)
                .prefetch_related("students__student", "groups__students__student")
                .first()
            )
            if not course:
                return Response({"error": "Курс не найден или у вас нет доступа"}, status=status.HTTP_404_NOT_FOUND)
            return Response(CourseSerializer(course).data, status=status.HTTP_200_OK)
        except Course.DoesNotExist:
            return Response({"error": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return handle_exception(e)

class UserListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            if request.user.role != User.Role.ADMIN:
                return Response({"error": ADMIN_ONLY}, status=status.HTTP_403_FORBIDDEN)
            users = User.objects.filter(role__in=[User.Role.ADMIN, User.Role.CURATOR]).order_by("created_at")
            if not users.exists():
                return Response({"detail": "Пользователи не найдены"}, status=status.HTTP_404_NOT_FOUND)
            return Response(UserSerializer(users, many=True).data, status=status.HTTP_200_OK)
        except Exception as e:
            return handle_exception(e)

    def post(self, request):
        try:
            if request.user.role != User.Role.ADMIN:
                return Response({"error": ADMIN_ONLY}, status=status.HTTP_403_FORBIDDEN)
            serializer = UserCreateSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return handle_exception(e)

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, user_id):
        try:
            if request.user.role != User.Role.ADMIN:
                return Response({"error": ADMIN_ONLY}, status=status.HTTP_403_FORBIDDEN)
            target_user = User.objects.get(id=user_id)
            serializer = UserSerializer(target_user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return handle_exception(e)

    def delete(self, request, user_id):
        try:
            if request.user.role != User.Role.ADMIN:
                return Response({"error": ADMIN_ONLY}, status=status.HTTP_403_FORBIDDEN)
            target_user = User.objects.get(id=user_id)
            if target_user.role == User.Role.ADMIN:
                return Response({"error": "Невозможно удалить администратора"}, status=status.HTTP_403_FORBIDDEN)
            target_user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response({"error": "Пользователь не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return handle_exception(e)

class GenerateAIReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            student_id = request.data.get("student_id")
            course_id = request.data.get("course_id")
            if not student_id or not course_id:
                return Response({"error": "Не указан student_id или course_id"}, status=status.HTTP_400_BAD_REQUEST)

            if not Student.objects.filter(id=student_id).exists():
                return Response({"error": "Студент не найден"}, status=status.HTTP_404_NOT_FOUND)
            if not Course.objects.filter(id=course_id).exists():
                return Response({"error": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)

            AIReport.objects.filter(student_id=student_id, course_id=course_id).update(is_latest=False)
            result = generate_ai_report(student_id, course_id)

            if not result.get("success"):
                status_code = (
                    status.HTTP_400_BAD_REQUEST
                    if "not found" in result.get("error", "").lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                return Response({"error": result.get("error", "Ошибка при генерации отчета")}, status=status_code)

            new_report = AIReport.objects.get(id=int(result["report_id"]))
            if not new_report.is_latest:
                new_report.is_latest = True
                new_report.save()
            return Response(result, status=status.HTTP_201_CREATED)
        except Exception as e:
            return handle_exception(e)

class GenerateAIGroupReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            group_id = request.data.get("group_id")
            course_id = request.data.get("course_id")
            if not group_id or not course_id:
                return Response({"error": "Не указан group_id или course_id"}, status=status.HTTP_400_BAD_REQUEST)

            if not Group.objects.filter(id=group_id).exists():
                return Response({"error": "Группа не найдена"}, status=status.HTTP_404_NOT_FOUND)
            if not Course.objects.filter(id=course_id).exists():
                return Response({"error": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)

            AIGroupReport.objects.filter(group_id=group_id, course_id=course_id).update(is_latest=False)
            result = generate_ai_group_report(group_id, course_id)

            if not result.get("success"):
                status_code = (
                    status.HTTP_400_BAD_REQUEST
                    if "not found" in result.get("error", "").lower()
                    else status.HTTP_500_INTERNAL_SERVER_ERROR
                )
                return Response({"error": result.get("error", "Ошибка при генерации отчета")}, status=status_code)

            if "report_id" not in result:
                return Response(
                    {"error": "Отчет успешно сгенерирован, но отсутствует report_id"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            new_report = AIGroupReport.objects.get(id=int(result["report_id"]))
            if not new_report.is_latest:
                new_report.is_latest = True
                new_report.save()
            return Response(result, status=status.HTTP_200_OK)
        except Exception as e:
            return handle_exception(e)

class AIStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            if request.user.role != User.Role.ADMIN:
                return Response({"error": ADMIN_ONLY}, status=status.HTTP_403_FORBIDDEN)

            stats_data = {
                "request_count": 0,
                "last_24h_requests": 0,
                "total_response_time": 0,
                "success_count": 0,
            }
            try:
                stats = AIUsageStats.objects.get(id=1)
                stats_data.update(
                    {
                        "request_count": stats.request_count,
                        "last_24h_requests": stats.last_24h_requests,
                        "total_response_time": stats.total_response_time,
                        "success_count": stats.success_count,
                    }
                )
            except AIUsageStats.DoesNotExist:
                return Response({"detail": "Статистика AI не найдена"}, status=status.HTTP_404_NOT_FOUND)

            avg_response_time = stats_data["total_response_time"] / stats_data["success_count"] if stats_data["success_count"] > 0 else 0
            success_rate = (stats_data["success_count"] / stats_data["request_count"] * 100) if stats_data["request_count"] > 0 else 0

            data = {
                "model": "DeepSeek-R1",
                "version": "1.0.3",
                "status": "Активна",
                "last_updated": "2025-04-29",
                "stats": {
                    "total_requests": stats_data["request_count"],
                    "last_24h_requests": stats_data["last_24h_requests"],
                    "avg_response_time": round(avg_response_time, 2),
                    "success_rate": round(success_rate, 1),
                },
            }
            return Response(data, status=status.HTTP_200_OK)
        except Exception as e:
            return handle_exception(e)

class ReportHistoryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            student_id = request.query_params.get("student_id")
            group_id = request.query_params.get("group_id")
            course_id = request.query_params.get("course_id")
            date_from = request.query_params.get("date_from")
            date_to = request.query_params.get("date_to")

            course_id = int(course_id)
            student_id = int(student_id) if student_id else None
            group_id = int(group_id) if group_id else None

            start_datetime, end_datetime = validate_dates(date_from, date_to)

            reports = []
            if student_id and course_id:
                if not Student.objects.filter(id=student_id).exists():
                    return Response({"error": "Студент не найден"}, status=status.HTTP_404_NOT_FOUND)
                if not Course.objects.filter(id=course_id).exists():
                    return Response({"error": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)

                student_reports = AIReport.objects.filter(student_id=student_id, course_id=course_id).select_related(
                    "student", "course"
                )
                if start_datetime:
                    student_reports = student_reports.filter(created_at__gte=start_datetime)
                    if end_datetime:
                        student_reports = student_reports.filter(created_at__lte=end_datetime)

                reports.extend(
                    {
                        "id": str(report.id),
                        "report_id": str(report.id),
                        "date": report.created_at.astimezone(MOSCOW_TZ).strftime("%Y-%m-%d %H:%M:%S"),
                        "raw_date": report.created_at.isoformat(),
                        "type": "student",
                        "name": report.student.full_name or "Без имени",
                        "entity_id": str(report.student.id),
                        "course_id": str(report.course.id),
                        "is_latest": report.is_latest,
                    }
                    for report in student_reports
                )

            if group_id and course_id:
                if not Group.objects.filter(id=group_id).exists():
                    return Response({"error": "Группа не найдена"}, status=status.HTTP_404_NOT_FOUND)
                if not Course.objects.filter(id=course_id).exists():
                    return Response({"error": "Курс не найден"}, status=status.HTTP_404_NOT_FOUND)

                group_reports = AIGroupReport.objects.filter(group_id=group_id, course_id=course_id).select_related(
                    "group", "course"
                )
                if start_datetime:
                    group_reports = group_reports.filter(created_at__gte=start_datetime)
                    if end_datetime:
                        group_reports = group_reports.filter(created_at__lte=end_datetime)

                reports.extend(
                    {
                        "id": str(report.id),
                        "report_id": str(report.id),
                        "date": report.created_at.astimezone(MOSCOW_TZ).strftime("%Y-%m-%d %H:%M:%S"),
                        "raw_date": report.created_at.isoformat(),
                        "type": "group",
                        "name": report.group.name or "Без названия",
                        "entity_id": str(report.group.id),
                        "course_id": str(report.course.id),
                        "is_latest": report.is_latest,
                    }
                    for report in group_reports
                )

            reports.sort(key=lambda x: x["raw_date"], reverse=True)
            return Response(reports, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return handle_exception(e)

class ReportDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, report_id):
        try:
            if AIReport.objects.filter(id=report_id).exists():
                report = AIReport.objects.get(id=report_id)
                student, course = report.student, report.course
                grades = Grade.objects.filter(student=student, course=course)
                grades_list = [
                    {
                        "topic": grade.topic.name if grade.topic else "Общая оценка",
                        "grade": grade.grade,
                        "comment": grade.comment or "Нет комментария",
                        "created_at": grade.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                        "student_id": str(grade.student.id),
                    }
                    for grade in grades
                ]
                return Response(
                    {
                        "report_id": report.id,
                        "student": {
                            "id": str(student.id),
                            "full_name": student.full_name,
                            "email": student.email or "Нет данных",
                            "created_at": student.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                        },
                        "course": {"title": course.title},
                        "grades": grades_list,
                        "analysis": report.report,
                        "success": True,
                        "is_latest": report.is_latest,
                    },
                    status=status.HTTP_200_OK,
                )

            if AIGroupReport.objects.filter(id=report_id).exists():
                report = AIGroupReport.objects.get(id=report_id)
                group, course = report.group, report.course
                students = [sc.student for sc in group.students.filter(course=course).select_related("student").distinct()]
                grades = Grade.objects.filter(student__in=students, course=course)
                grades_list = [
                    {
                        "topic": grade.topic.name if grade.topic else "Общая оценка",
                        "grade": grade.grade,
                        "comment": grade.comment or "Нет комментария",
                        "created_at": grade.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                        "student_id": str(grade.student.id),
                    }
                    for grade in grades
                ]
                return Response(
                    {
                        "report_id": report.id,
                        "group": {
                            "id": str(group.id),
                            "name": group.name,
                            "students": [
                                {"id": str(student.id), "full_name": student.full_name, "email": student.email or "Нет данных"}
                                for student in students
                            ],
                        },
                        "course": {"title": course.title},
                        "grades": grades_list,
                        "analysis": report.report,
                        "success": True,
                        "is_latest": report.is_latest,
                    },
                    status=status.HTTP_200_OK,
                )

            return Response({"error": "Отчет не найден"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return handle_exception(e)