from rest_framework.test import APITestCase
from django.urls import reverse
from rest_framework import status
from unittest.mock import patch
from django.contrib.auth import get_user_model
from ai_module.models import Group, AIReport, Student, Course, AIGroupReport
from unittest.mock import MagicMock

User = get_user_model()

class ReportGenerationIntegrationTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            email='admin@mail.com', 
            full_name='Админ',
            password='pass', 
            role=User.Role.ADMIN
        )
        self.student = Student.objects.create(full_name='Тестовый студент', email='student@mail.com')
        self.course = Course.objects.create(title='Тестовый курс')
        self.group = Group.objects.create(name='Тестовая группа', course=self.course)
        self.report = AIReport.objects.create(
            student=self.student,
            course=self.course,
            report="report for student",
            is_latest=True
        )
        self.group_report = AIGroupReport.objects.create(
            group=self.group,
            course=self.course,
            report="report for group",
            is_latest=True
        )
        self.client.force_authenticate(user=self.admin)


    @patch('ai_module.ai.client.chat.completions.create')
    def test_generate_ai_report_for_student(self, mock_openai):
        mock_openai.return_value.choices = [
            MagicMock(message=MagicMock(content="Аналитический отчёт"))
        ]

        with patch('ai_module.views.generate_ai_report') as mock_generate:
            mock_generate.return_value = {
                "success": True,
                "report_id": self.report.id,
                "analysis": "Аналитический отчёт"
            }

            url = reverse('generate_ai_report')
            data = {'student_id': self.student.id, 'course_id': self.course.id}
            response = self.client.post(url, data, format='json')

            self.assertEqual(response.status_code, status.HTTP_201_CREATED)
            self.assertIn('analysis', response.data)
            self.assertTrue(AIReport.objects.filter(student=self.student, course=self.course).exists())

    @patch('ai_module.ai.client.chat.completions.create')
    def test_generate_ai_report_for_group(self, mock_openai):
        mock_openai.return_value.choices = [
            MagicMock(message=MagicMock(content="Групповой аналитический отчёт"))
        ]

        with patch('ai_module.views.generate_ai_group_report') as mock_generate:
            mock_generate.return_value = {
                "success": True,
                "report_id": self.report.id,
                "analysis": "Групповой аналитический отчёт"
            }

            url = reverse('generate_group_report')
            data = {'group_id': self.group.id, 'course_id': self.course.id}
            response = self.client.post(url, data, format='json')

            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('analysis', response.data)
            self.assertTrue(AIGroupReport.objects.filter(group=self.group, course=self.course).exists())

