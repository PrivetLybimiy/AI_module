from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, full_name, role, password=None, **extra_fields):
        if not email:
            raise ValueError('Пользователь должен иметь email')
        if not role:
            raise ValueError('Пользователь должен иметь роль')

        email = self.normalize_email(email)
        user = self.model(email=email, full_name=full_name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, full_name, role='ADMIN', password=password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        ADMIN = 'ADMIN', 'Администратор'
        CURATOR = 'CURATOR', 'Куратор'

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=Role.choices)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    def __str__(self):
        return f"{self.full_name} ({self.get_role_display()})"

class Course(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

class UserCourse(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': User.Role.CURATOR}, related_name='courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='curators')

    def __str__(self):
        return f"{self.user.full_name} - {self.course.title}"

class Group(models.Model):
    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='groups')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.course.title})"

class Student(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name

class StudentCourse(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='courses')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='students')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')

    def __str__(self):
        return f"{self.student.full_name} - {self.course.title}"

class Topic(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='grades')
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='grades', null=True, blank=True)
    grade = models.FloatField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Grade {self.grade} for {self.student.full_name} in {self.course.title}"

class AIReport(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='ai_reports')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ai_reports')
    report = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=False)

    def __str__(self):
        return f"AI Report for {self.student.full_name} in {self.course.title}"

class AIGroupReport(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='ai_reports')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='ai_group_reports')
    report = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_latest = models.BooleanField(default=False)

    def __str__(self):
        return f"AI Group Report for {self.group.name} in {self.course.title}"

class AIUsageStats(models.Model):
    request_count = models.IntegerField(default=0)
    success_count = models.IntegerField(default=0)
    total_response_time = models.FloatField(default=0.0)
    last_24h_requests = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Статистика AI: {self.request_count} запросов"