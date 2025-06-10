from rest_framework.test import APIClient, APITestCase
from rest_framework import status
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from ai_module.models import Course, UserCourse, Group, AIUsageStats, Student, StudentCourse, AIReport, AIGroupReport, Grade, Topic
from django.utils import timezone
from datetime import datetime, timedelta
import pytz

User = get_user_model()
MOSCOW_TZ = pytz.timezone("Europe/Moscow")

class BaseAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@mail.ru',
            full_name='admin',
            role=User.Role.ADMIN,
            password='pass'
        )
        self.curator = User.objects.create_user(
            email='curator@mail.ru',
            full_name='curator',
            role=User.Role.CURATOR,
            password='pass'
        )
        self.student = Student.objects.create(
            full_name='Test Student',
            email='student@mail.ru'
        )
        self.course = Course.objects.create(
            title='Test Course',
            description='Test Description'
        )
        UserCourse.objects.create(user=self.curator, course=self.course)
        StudentCourse.objects.create(student=self.student, course=self.course, group=None)
        self.group = Group.objects.create(
            name='Test Group',
            course=self.course
        )
        StudentCourse.objects.create(student=self.student, course=self.course, group=self.group)
        self.ai_stats = AIUsageStats.objects.create(
            id=1,
            request_count=100,
            last_24h_requests=10,
            total_response_time=50.0,
            success_count=95
        )

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

class LoginViewTests(BaseAPITestCase):
    def test_successful_login(self):
        url = reverse('login')
        data = {'email': 'admin@mail.ru', 'password': 'pass'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], 'admin@mail.ru')

    def test_invalid_data(self):
        url = reverse('login')
        data = {'email': 'admin@mail.ru', 'password': 'wrongpass'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data['error'], 'Неверный email или пароль')

    def test_missing_fields(self):
        url = reverse('login')
        data = {'email': 'admin@mail.ru'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Email и пароль обязательны')

class CourseListViewTests(BaseAPITestCase):
    def test_admin_get_all_courses(self):
        url = reverse('course_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Course')

    def test_curator_get_own_courses(self):
        url = reverse('course_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.curator)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Test Course')

    def test_no_courses(self):
        Course.objects.all().delete()
        url = reverse('course_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], 'Курсы не найдены')

    def test_unauthenticated(self):
        url = reverse('course_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class CourseDetailViewTests(BaseAPITestCase):
    def test_get_course(self):
        url = reverse('course_detail', args=[self.course.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Course')

    def test_course_not_found(self):
        url = reverse('course_detail', args=[999])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Курс не найден')

class UserListViewTests(BaseAPITestCase):
    def test_get_users(self):
        url = reverse('user_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        self.assertEqual(response.data[0]['email'], 'admin@mail.ru')

    def test_no_users(self):
        User.objects.exclude(id=self.admin.id).delete()
        url = reverse('user_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_create_user(self):
        url = reverse('user_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        data = {
            'email': 'newcurator@mail.ru',
            'password': 'pass',
            'role': User.Role.CURATOR,
            'full_name': 'New Curator'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'newcurator@mail.ru')

    def test_create_user_invalid_data(self):
        url = reverse('user_list')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        data = {'email': 'invalid'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

class UserDetailViewTests(BaseAPITestCase):
    def test_update_user(self):
        url = reverse('user_detail', args=[self.curator.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        data = {'email': 'curatornew@mail.ru'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'curatornew@mail.ru')

    def test_update_user_invalid_data(self):
        url = reverse('user_detail', args=[self.curator.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        data = {'email': 'invalid'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_update_non_user(self):
        url = reverse('user_detail', args=[999])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        data = {'email': 'test@mail.ru'}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Пользователь не найден')

    def test_delete_user(self):
        url = reverse('user_detail', args=[self.curator.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=self.curator.id).exists())

    def test_delete_admin_user(self):
        url = reverse('user_detail', args=[self.admin.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['error'], 'Невозможно удалить администратора')

class AIStatsViewTests(BaseAPITestCase):
    def test_get_stats(self):
        url = reverse('ai-stats')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['model'], 'DeepSeek-R1')
        self.assertEqual(response.data['stats']['total_requests'], 100)
        self.assertAlmostEqual(response.data['stats']['avg_response_time'], 0.53, places=2)

    def test_no_stats(self):
        AIUsageStats.objects.all().delete()
        url = reverse('ai-stats')
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['detail'], 'Статистика AI не найдена')

class ReportHistoryViewTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.topic = Topic.objects.create(name="Test Topic")
        self.ai_report = AIReport.objects.create(
            student=self.student,
            course=self.course,
            report="Test Student Report",
            is_latest=True,
            created_at=timezone.now()
        )
        self.ai_group_report = AIGroupReport.objects.create(
            group=self.group,
            course=self.course,
            report="Test Group Report",
            is_latest=True,
            created_at=timezone.now()
        )
        self.url = reverse('report-history')

    def test_get_report_history_student_and_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {'student_id': self.student.id, 'course_id': self.course.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'student')
        self.assertEqual(response.data[0]['entity_id'], str(self.student.id))
        self.assertEqual(response.data[0]['course_id'], str(self.course.id))
        self.assertEqual(response.data[0]['name'], self.student.full_name)

    def test_get_report_history_group_and_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {'group_id': self.group.id, 'course_id': self.course.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['type'], 'group')
        self.assertEqual(response.data[0]['entity_id'], str(self.group.id))
        self.assertEqual(response.data[0]['course_id'], str(self.course.id))
        self.assertEqual(response.data[0]['name'], self.group.name)

    def test_get_report_history_with_date_filters(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        date_from = (timezone.now() - timedelta(days=1)).strftime("%Y-%m-%d")
        date_to = timezone.now().strftime("%Y-%m-%d")
        response = self.client.get(self.url, {
            'student_id': self.student.id,
            'course_id': self.course.id,
            'date_from': date_from,
            'date_to': date_to
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 0)

    def test_get_report_history_invalid_student(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {'student_id': 999, 'course_id': self.course.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Студент не найден')

    def test_get_report_history_invalid_course(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {'student_id': self.student.id, 'course_id': 999})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Курс не найден')

    def test_get_report_history_invalid_group(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {'group_id': 999, 'course_id': self.course.id})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Группа не найдена')

    def test_get_report_history_invalid_date_format(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(self.url, {
            'student_id': self.student.id,
            'course_id': self.course.id,
            'date_from': 'invalid-date'
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Неверный формат date_from', response.data['error'])

class ReportDetailViewTests(BaseAPITestCase):
    def setUp(self):
        super().setUp()
        self.topic = Topic.objects.create(name="Test Topic")
        self.ai_group_report = AIGroupReport.objects.create(
            group=self.group,
            course=self.course,
            report="Test Group Report",
            is_latest=True,
            created_at=timezone.now()
        )
        self.ai_report = AIReport.objects.create(
            student=self.student,
            course=self.course,
            report="Test Student Report",
            is_latest=True,
            created_at=timezone.now()
        )
        self.grade = Grade.objects.create(
            student=self.student,
            course=self.course,
            topic=self.topic,
            grade=85,
            comment="Круто! Супер!)"
        )

    def test_get_student_report_detail(self):
        url = reverse('report-detail', args=[self.ai_report.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['report_id'], self.ai_report.id)
        self.assertEqual(response.data['student']['id'], str(self.student.id))
        self.assertEqual(response.data['course']['title'], self.course.title)
        self.assertEqual(response.data['analysis'], self.ai_report.report)
        self.assertEqual(len(response.data['grades']), 1)
        self.assertEqual(response.data['grades'][0]['topic'], self.topic.name)
        self.assertEqual(response.data['grades'][0]['grade'], self.grade.grade)

    def test_get_group_report_detail(self):
        AIReport.objects.filter(id=self.ai_group_report.id).delete()
        student_courses = StudentCourse.objects.filter(group=self.group, course=self.course)
        self.assertGreaterEqual(student_courses.count(), 1, "Группа должна содержать хотя бы одного студента")
        url = reverse('report-detail', args=[self.ai_group_report.id])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK, f"Ожидался статус 200, получен {response.status_code}")
        self.assertIn('group', response.data, "Ключ 'group' отсутствует в ответе")
        self.assertEqual(response.data['report_id'], self.ai_group_report.id)
        self.assertEqual(response.data['group']['id'], str(self.group.id))
        self.assertEqual(response.data['course']['title'], self.course.title)
        self.assertEqual(response.data['analysis'], self.ai_group_report.report)
        self.assertEqual(len(response.data['grades']), 1)
        self.assertEqual(response.data['grades'][0]['topic'], self.topic.name)
        self.assertEqual(response.data['grades'][0]['grade'], self.grade.grade)

    def test_get_report_detail_not_found(self):
        url = reverse('report-detail', args=[999])
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.get_token(self.admin)}')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['error'], 'Отчет не найден')