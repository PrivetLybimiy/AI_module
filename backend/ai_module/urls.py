from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, CourseListView, CourseDetailView, UserListView, UserDetailView, GenerateAIReportView, GenerateAIGroupReportView, AIStatsView, ReportHistoryView, ReportDetailView

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/courses/', CourseListView.as_view(), name='course_list'),
    path('api/courses/<int:course_id>/', CourseDetailView.as_view(), name='course_detail'),
    path('api/users/', UserListView.as_view(), name='user_list'),
    path('api/users/<int:user_id>/', UserDetailView.as_view(), name='user_detail'),
    path('api/generate-ai-report/', GenerateAIReportView.as_view(), name='generate_ai_report'),
    path('api/generate-group-report/', GenerateAIGroupReportView.as_view(), name='generate_group_report'),
    path('api/ai-stats/', AIStatsView.as_view(), name='ai-stats'),
    path('api/report-history/', ReportHistoryView.as_view(), name='report-history'),
    path('api/reports/<int:report_id>/', ReportDetailView.as_view(), name='report-detail'),
]