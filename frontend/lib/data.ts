// Mock data for the application

export interface Assignment {
  name: string;
  status: "Завершено" | "В процессе";
  score: number;
  dueDate?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  progress: number;
  lastActive: string;
  group: string;
  assignments: Assignment[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  totalStudents: number;
  completionRate: number;
  students: Student[];
  category: string;
  modules: number;
}

export const courses: Course[] = [
  {
    id: "course-1",
    title: "Основы веб-разработки",
    description: "Изучение HTML, CSS и JavaScript для создания современных веб-сайтов",
    image: "/placeholder.svg?height=400&width=600",
    totalStudents: 24,
    completionRate: 68,
    category: "Программирование",
    modules: 8,
    students: [
      {
        id: "student-1",
        name: "Алексей Смирнов",
        email: "alexey@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 75,
        lastActive: "2023-04-15",
        group: "Группа 101",
        assignments: [
          {
            name: "Создание первой веб-страницы",
            status: "Завершено",
            score: 92,
            dueDate: "2023-03-10"
          },
          {
            name: "CSS стилизация",
            status: "Завершено",
            score: 85,
            dueDate: "2023-03-20"
          },
          {
            name: "JavaScript основы",
            status: "В процессе",
            score: 0,
            dueDate: "2023-04-25"
          }
        ]
      },
      {
        id: "student-2",
        name: "Мария Иванова",
        email: "maria@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 92,
        lastActive: "2023-04-18",
        group: "Группа 101",
        assignments: [
          {
            name: "Создание первой веб-страницы",
            status: "Завершено",
            score: 98,
            dueDate: "2023-03-10"
          },
          {
            name: "CSS стилизация",
            status: "Завершено",
            score: 95,
            dueDate: "2023-03-20"
          },
          {
            name: "JavaScript основы",
            status: "Завершено",
            score: 90,
            dueDate: "2023-04-25"
          }
        ]
      },
      {
        id: "student-3",
        name: "Дмитрий Козлов",
        email: "dmitry@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 45,
        lastActive: "2023-04-10",
        group: "Группа 102",
        assignments: [
          {
            name: "Создание первой веб-страницы",
            status: "Завершено",
            score: 75,
            dueDate: "2023-03-10"
          },
          {
            name: "CSS стилизация",
            status: "В процессе",
            score: 0,
            dueDate: "2023-03-20"
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    title: "UX/UI дизайн",
    description: "Создание привлекательных и удобных интерфейсов для цифровых продуктов",
    image: "/placeholder.svg?height=400&width=600",
    totalStudents: 32,
    completionRate: 72,
    category: "Дизайн",
    modules: 6,
    students: [
      {
        id: "student-4",
        name: "Анна Морозова",
        email: "anna@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 88,
        lastActive: "2023-04-17",
        group: "Группа 201",
        assignments: [
          {
            name: "Анализ пользовательского опыта",
            status: "Завершено",
            score: 90,
            dueDate: "2023-03-15"
          },
          {
            name: "Прототипирование интерфейса",
            status: "Завершено",
            score: 88,
            dueDate: "2023-04-01"
          }
        ]
      },
      {
        id: "student-5",
        name: "Сергей Волков",
        email: "sergey@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 65,
        lastActive: "2023-04-16",
        group: "Группа 201",
        assignments: [
          {
            name: "Анализ пользовательского опыта",
            status: "Завершено",
            score: 78,
            dueDate: "2023-03-15"
          },
          {
            name: "Прототипирование интерфейса",
            status: "В процессе",
            score: 0,
            dueDate: "2023-04-01"
          }
        ]
      }
    ]
  },
  {
    id: "course-3",
    title: "Машинное обучение",
    description: "Основы машинного обучения и искусственного интеллекта",
    image: "/placeholder.svg?height=400&width=600",
    totalStudents: 18,
    completionRate: 58,
    category: "Программирование",
    modules: 10,
    students: [
      {
        id: "student-6",
        name: "Павел Новиков",
        email: "pavel@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 70,
        lastActive: "2023-04-14",
        group: "Группа 301",
        assignments: [
          {
            name: "Введение в Python для ML",
            status: "Завершено",
            score: 85,
            dueDate: "2023-03-05"
          },
          {
            name: "Линейная регрессия",
            status: "Завершено",
            score: 72,
            dueDate: "2023-03-25"
          },
          {
            name: "Нейронные сети",
            status: "В процессе",
            score: 0,
            dueDate: "2023-04-20"
          }
        ]
      }
    ]
  },
  {
    id: "course-4",
    title: "Цифровой маркетинг",
    description: "Стратегии продвижения в цифровой среде",
    image: "/placeholder.svg?height=400&width=600",
    totalStudents: 26,
    completionRate: 62,
    category: "Маркетинг",
    modules: 5,
    students: [
      {
        id: "student-7",
        name: "Екатерина Соколова",
        email: "ekaterina@example.com",
        avatar: "/placeholder.svg?height=40&width=40",
        progress: 85,
        lastActive: "2023-04-16",
        group: "Группа 401",
        assignments: [
          {
            name: "Анализ целевой аудитории",
            status: "Завершено",
            score: 92,
            dueDate: "2023-03-12"
          },
          {
            name: "SMM стратегия",
            status: "Завершено",
            score: 88,
            dueDate: "2023-04-02"
          }
        ]
      }
    ]
  }
];

export function generateStudentReport(student: Student): string {
  // In a real application, this would be an AI-generated report
  // For demo purposes, we'll generate a simple report based on the student's progress

  let performanceLevel = ""
  let recommendations = ""
  let strengths = []
  let weaknesses = []

  if (student.progress >= 90) {
    performanceLevel = "отличный"
    recommendations =
      "Студент демонстрирует высокий уровень понимания материала. Рекомендуется предложить дополнительные задания повышенной сложности для поддержания интереса и дальнейшего развития навыков."
    strengths = [
      "Глубокое понимание материала",
      "Высокая вовлеченность в учебный процесс",
      "Качественное выполнение практических заданий",
    ]
    weaknesses = ["Возможная потеря интереса из-за недостаточной сложности материала"]
  } else if (student.progress >= 70) {
    performanceLevel = "хороший"
    recommendations =
      "Студент хорошо усваивает материал курса. Рекомендуется обратить внимание на закрепление практических навыков и предложить дополнительные задания для углубления знаний."
    strengths = ["Стабильное освоение материала", "Регулярное выполнение заданий"]
    weaknesses = ["Некоторые трудности с более сложными концепциями", "Недостаточная глубина понимания отдельных тем"]
  } else if (student.progress >= 50) {
    performanceLevel = "средний"
    recommendations =
      "Студент демонстрирует среднюю успеваемость. Рекомендуется провести дополнительные консультации по сложным темам и предложить дополнительные материалы для самостоятельного изучения."
    strengths = ["Базовое понимание основных концепций", "Стремление к улучшению результатов"]
    weaknesses = [
      "Пробелы в понимании ключевых тем",
      "Нерегулярное выполнение заданий",
      "Трудности с практическим применением знаний",
    ]
  } else {
    performanceLevel = "низкий"
    recommendations =
      "Студент испытывает трудности в освоении материала. Рекомендуется провести индивидуальную консультацию для выявления проблемных областей и разработки плана по улучшению успеваемости."
    strengths = ["Наличие потенциала для улучшения", "Отдельные успешные выполнения заданий"]
    weaknesses = [
      "Значительные пробелы в понимании базовых концепций",
      "Низкая вовлеченность в учебный процесс",
      "Пропуски занятий и невыполнение заданий",
    ]
  }

  const lastActiveDate = new Date(student.lastActive)
  const currentDate = new Date()
  const daysSinceLastActive = Math.floor((currentDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24))

  let activityComment = ""
  if (daysSinceLastActive <= 3) {
    activityComment = "Студент активно участвует в курсе и регулярно выполняет задания."
  } else if (daysSinceLastActive <= 7) {
    activityComment = "Студент был активен на прошлой неделе, но в последние дни активность снизилась."
  } else {
    activityComment = `Студент не проявлял активности в течение ${daysSinceLastActive} дней. Рекомендуется связаться со студентом для выяснения причин отсутствия активности.`
  }

  // Генерация прогноза
  let prediction = ""
  if (student.progress > 70 && daysSinceLastActive < 5) {
    prediction = "Высокая вероятность успешного завершения курса с отличными результатами."
  } else if (student.progress > 50 && daysSinceLastActive < 10) {
    prediction =
      "Средняя вероятность успешного завершения курса. Потребуется дополнительная поддержка по отдельным темам."
  } else {
    prediction =
      "Существует риск неуспешного завершения курса. Необходимо срочное вмешательство и разработка плана поддержки."
  }

  return {
    summary: `Студент демонстрирует ${performanceLevel} уровень успеваемости. Прогресс по курсу составляет ${student.progress}%.`,
    activity: activityComment,
    strengths: strengths,
    weaknesses: weaknesses,
    recommendations: recommendations,
    prediction: prediction,
  }
}
