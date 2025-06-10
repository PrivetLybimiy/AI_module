from rest_framework import serializers
from . import models

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Student
        fields = ['id', 'full_name', 'email', 'created_at']

class GroupSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()

    class Meta:
        model = models.Group
        fields = ['id', 'name', 'students', 'created_at']

    def get_students(self, obj):
        student_courses = obj.students.all()
        students = [sc.student for sc in student_courses]
        return StudentSerializer(students, many=True).data

class CourseSerializer(serializers.ModelSerializer):
    students = serializers.SerializerMethodField()
    groups = GroupSerializer(many=True, read_only=True)

    class Meta:
        model = models.Course
        fields = ['id', 'title', 'groups', 'students', 'description', 'created_at']

    def get_students(self, obj):
        student_courses = obj.students.all()
        students = [sc.student for sc in student_courses]
        return StudentSerializer(students, many=True).data

class GradeSerializer(serializers.ModelSerializer):
    topic = serializers.CharField(source='topic.name', allow_null=True)

    class Meta:
        model = models.Grade
        fields = ['topic', 'grade', 'comment', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=models.User.Role.choices)

    class Meta:
        model = models.User
        fields = ['id', 'full_name', 'email', 'role', 'created_at', 'last_login']
        read_only_fields = ['id', 'created_at', 'last_login']

class UserCreateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=models.User.Role.choices)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = models.User
        fields = ['full_name', 'email', 'role', 'password']

    def create(self, validated_data):
        user = models.User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            role=validated_data['role'],
            password=validated_data['password']
        )
        return user

class AIReportSerializer(serializers.ModelSerializer):
    student = StudentSerializer()
    course = serializers.CharField(source='course.title')
    grades = serializers.SerializerMethodField()
    analysis = serializers.CharField(source='report')
    success = serializers.BooleanField(default=True)

    class Meta:
        model = models.AIReport
        fields = ['id', 'student', 'course', 'grades', 'analysis', 'success']

    def get_grades(self, obj):
        grades = models.Grade.objects.filter(student=obj.student, course=obj.course)
        return GradeSerializer(grades, many=True).data

class AIGroupReportSerializer(serializers.ModelSerializer):
    group = GroupSerializer()
    course = serializers.CharField(source='course.title')
    analysis = serializers.CharField(source='report')
    success = serializers.BooleanField(default=True)

    class Meta:
        model = models.AIGroupReport
        fields = ['id', 'group', 'course', 'analysis', 'success']