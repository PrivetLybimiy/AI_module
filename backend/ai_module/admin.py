from django.contrib import admin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from . import models

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = models.User
        fields = ('email', 'full_name', 'role', 'is_active', 'is_staff')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = models.User
        fields = ('email', 'full_name', 'role', 'is_active', 'is_staff')

class UserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = models.User
    list_display = ('email', 'full_name', 'role', 'is_staff', 'is_active')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('full_name', 'role')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'full_name', 'role', 'password1', 'password2', 'is_active', 'is_staff')}
        ),
    )
    search_fields = ('email', 'full_name')
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)

@admin.register(models.Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_at')
    search_fields = ('title', 'description')

@admin.register(models.UserCourse)
class UserCourseAdmin(admin.ModelAdmin):
    list_display = ('user', 'course')
    list_filter = ('user', 'course')
    search_fields = ('user__email', 'course__title')

admin.site.register(models.User, UserAdmin)
admin.site.register(models.Group)
admin.site.register(models.Student)
admin.site.register(models.StudentCourse)
admin.site.register(models.Topic)
admin.site.register(models.Grade)
admin.site.register(models.AIReport)
admin.site.register(models.AIGroupReport)
admin.site.register(models.AIUsageStats)
