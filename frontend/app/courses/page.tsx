"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  GraduationCap,
  LogOut,
  Moon,
  Sun,
  Settings,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/components/theme-provider";
import { refreshAccessToken } from "@/components/auth-utils"; 

interface Course {
  id: string;
  title: string;
  description: string;
}

interface AuthUser {
  fullName: string;
  role: string;
}

interface AuthContext {
  user: AuthUser | null;
  logout: () => void;
  loading: boolean;
}

export default function CoursesPage() {
  const { user, logout, loading } = useAuth() as AuthContext;
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    if (loading || !user) {
      if (!user) {
        router.push("/login");
        router.refresh();
      }
      return;
    }

    const fetchCourses = async () => {
      if (typeof window === "undefined") return;

      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          router.refresh();
          return;
        }

        const response = await fetch(`${API_URL}/api/courses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setDisplayedCourses(data);
        } else if (response.status === 401) {
          const newToken = await refreshAccessToken(); 
          if (newToken) {
            const retryResponse = await fetch(`${API_URL}/api/courses/`, {
              headers: {
                Authorization: `Bearer ${newToken}`,
                "Content-Type": "application/json",
              },
            });
            if (retryResponse.ok) {
              const data = await retryResponse.json();
              setDisplayedCourses(data);
            } else {
              setError(`Ошибка авторизации: ${retryResponse.status}`);
              router.push("/login");
              router.refresh();
            }
          } else {
            setError("Не удалось обновить токен");
            router.push("/login");
            router.refresh();
          }
        } else if (response.status === 403) {
          setError("Доступ запрещен: недостаточно прав");
        } else {
          setError(`Ошибка сервера: ${response.status}`);
        }
      } catch (err) {
        setError("Не удалось подключиться к серверу");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [router, user, loading]);

  const filteredCourses = displayedCourses.filter((course) =>
    !searchQuery
      ? true
      : course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-medium">Система генерации отчетов</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{user.fullName}</span>
            <span className="text-sm font-medium text-muted-foreground">
              ({user.role === "CURATOR" ? "Куратор" : user.role === "ADMIN" ? "Админ" : user.role})
            </span>
            {user.role === "ADMIN" && (
              <Link href="/admin" passHref>
                <Button variant="ghost" size="icon" className="hover:bg-muted">
                  <Settings className="h-4 w-4" />
                  <span className="sr-only">Админ-панель</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full hover:bg-muted"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Переключить тему</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="rounded-full hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h2 className="text-2xl font-medium">Ваши курсы</h2>
          <div className="w-full md:w-64">
            <Input
              type="search"
              placeholder="Поиск курсов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 font-medium">{error}</p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                setIsLoading(true);
              }}
              className="mt-4"
            >
              Повторить попытку
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }, (_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-full mb-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredCourses.map((course) => (
              <motion.div key={course.id} variants={itemVariants}>
                <Link href={`/courses/${course.id}`} passHref>
                  <Card className="h-full border hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg font-medium line-clamp-2">
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}

            {filteredCourses.length === 0 && (
              <div className="text-center py-12 col-span-full">
                <h3 className="text-lg font-medium text-foreground">
                  Курсы не найдены
                </h3>
                <p className="text-muted-foreground">Попробуйте изменить параметры поиска</p>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}