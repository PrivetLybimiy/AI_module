"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, LogOut, Moon, Search, Sun } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/components/theme-provider";
import { Course, Student, Group, AIReport, ReportHistoryItem } from "./types";
import { fetchCourse, fetchReportHistory, fetchReportById, generateAiReport, generateGroupReport } from "./api";
import { ReportContent } from "./ReportContent";
import { HistoryPanel } from "./HistoryPanel";

export default function CoursePage({ params }: { params: Promise<{ courseId: string }> }) {
  const [courseId, setCourseId] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [aiReport, setAiReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setCourseId(resolvedParams.courseId);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!courseId) return;

    document.body.removeAttribute("cz-shortcut-listen");

    const loadCourse = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      await fetchCourse(courseId, user, setCourse, setError, router);
      setIsLoading(false);
    };

    loadCourse();
  }, [courseId, user, router]);

useEffect(() => {
  if (!courseId || !user || (!selectedStudent && !selectedGroup)) return;

  const fetchHistory = async () => {
    await fetchReportHistory(courseId, user, selectedStudent, selectedGroup, dateFrom, dateTo, setReportHistory, setError);
    setIsHistoryLoaded(true);
  };

  if (!isHistoryLoaded || isHistoryVisible || isGenerating) {
    fetchHistory();
  }
}, [courseId, user, isHistoryVisible, selectedStudent, selectedGroup, dateFrom, dateTo, isGenerating, isHistoryLoaded]);

useEffect(() => {
  if (selectedStudent || selectedGroup) {
    handleFetchReportHistory();
  }
}, [selectedStudent, selectedGroup]);

  const toggleGroup = (groupId: string) => {
    if (isGenerating) return;

    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const filteredStudents =
    course?.students?.filter((student) => student.full_name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const filteredGroups =
    course?.groups
      ?.map((group) => ({
        ...group,
        students: group.students.filter((student) =>
          student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()) || group.students.length > 0) ||
    [];

  const handleStudentClick = (student: Student) => {
    if (isGenerating) return;

    setSelectedStudent(student);
    setSelectedGroup(null);
    setAiReport(null);
    setActiveReportId(null);
  };

  const handleGroupClick = (group: Group) => {
    if (isGenerating) return;

    setSelectedGroup(group);
    setSelectedStudent(null);
    setAiReport(null);
    setActiveReportId(null);
  };

  const handleGenerateAiReport = async () => {
    if (!selectedStudent || !courseId) return;

    setIsGenerating(true);
    setIsGeneratingReport(true);
    setError(null);

    await generateAiReport(
      selectedStudent,
      courseId,
      setAiReport,
      setReportHistory,
      setActiveReportId,
      setError,
      handleFetchReportById,
      handleFetchReportHistory
    );

    setIsGenerating(false);
    setIsGeneratingReport(false);
  };

  const handleGenerateGroupReport = async () => {
    if (!selectedGroup || !courseId) return;

    setIsGenerating(true);
    setIsGeneratingReport(true);
    setError(null);

    setAiReport(null);

    await generateGroupReport(
      selectedGroup,
      courseId,
      setAiReport,
      setReportHistory,
      setActiveReportId,
      setError,
      handleFetchReportById,
      handleFetchReportHistory
    );

    setIsGenerating(false);
    setIsGeneratingReport(false);
  };

  const handleFetchReportById = async (reportId: string) => {
    setIsGenerating(true);
    setError(null);
    setActiveReportId(reportId);
    await fetchReportById(reportId, setAiReport, setError);
    setIsGenerating(false);
  };

  const handleFetchReportHistory = async () => {
    if (!courseId || !user || (!selectedStudent && !selectedGroup)) return;
    await fetchReportHistory(courseId, user, selectedStudent, selectedGroup, dateFrom, dateTo, setReportHistory, setError);
  };

  if (!user) return null;

  if (isLoading || !courseId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Загрузка...</div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/courses">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Назад</span>
              </Link>
            </Button>
            <h1 className="ml-4 text-xl font-medium">{course.title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">{user.fullName}</span>
            <span className="text-sm font-medium text-muted-foreground">
              ({user.role === "CURATOR" ? "Куратор" : user.role === "ADMIN" ? "Админ" : user.role})
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="sr-only">Переключить тему</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={logout} className="rounded-full">
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Выйти</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-64 bg-card border-r border-border flex flex-col"
        >
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Поиск студентов..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isGenerating}
              />
            </div>
          </div>
          <ScrollArea className="-character-1">
            <div className="divide-y divide-border">
              {searchQuery && filteredStudents.length > 0 && (
                <div className="p-2 text-xs font-medium text-muted-foreground">Результаты поиска</div>
              )}
              {searchQuery &&
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    className={`w-full text-left p-4 hover:bg-muted transition-colors ${
                      selectedStudent?.id === student.id ? "bg-muted" : ""
                    } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleStudentClick(student)}
                    disabled={isGenerating}
                  >
                    <p className="font-normal">{student.full_name}</p>
                  </button>
                ))}
              {!searchQuery &&
                filteredGroups.map((group) => (
                  <div key={group.id} className="divide-y divide-border/50">
                    <button
                      className={`w-full text-left p-4 hover:bg-muted transition-colors flex justify-between items-center ${
                        selectedGroup?.id === group.id ? "bg-muted" : ""
                      } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                      onClick={() => handleGroupClick(group)}
                      disabled={isGenerating}
                    >
                      <p className="font-medium">{group.name}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs text-muted-foreground p-1 ${
                            isGenerating ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleGroup(group.id);
                          }}
                        >
                          {expandedGroups[group.id] ? "▼" : "►"}
                        </span>
                      </div>
                    </button>
                    {expandedGroups[group.id] && group.students.length > 0 && (
                      <div className="pl-4 bg-muted/30">
                        {group.students.map((student) => (
                          <button
                            key={student.id}
                            className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                              selectedStudent?.id === student.id ? "bg-muted" : ""
                            } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => handleStudentClick(student)}
                            disabled={isGenerating}
                          >
                            <p className="font-normal text-sm">{student.full_name}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              {searchQuery && filteredStudents.length === 0 && (
                <div className="p-4 text-center text-sm text-muted-foreground">Ничего не найдено</div>
              )}
            </div>
          </ScrollArea>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-auto p-6"
        >
          {!selectedStudent && !selectedGroup ? (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              <p>Выберите студента или группу для генерации отчета</p>
            </div>
          ) : (
            <div className="w-full mx-auto">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-medium">{selectedStudent?.full_name || selectedGroup?.name}</h2>
                {(selectedStudent || selectedGroup) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      handleFetchReportHistory();
                      setIsHistoryVisible(!isHistoryVisible);
                    }}
                  >
                    {isHistoryVisible ? "Скрыть историю" : "Показать историю"}
                  </Button>
                )}
              </div>

              <Card className="w-full">
                <CardHeader className="text-center border-b border-border">
                  <CardTitle>
                    {selectedGroup ? "AI Отчет об успеваемости группы" : "AI Отчет об успеваемости студента"}
                  </CardTitle>
                  <CardDescription>Сгенерировать отчет о успеваемости</CardDescription>
                </CardHeader>
                <ReportContent
                  aiReport={aiReport}
                  isGenerating={isGenerating}
                  selectedStudent={selectedStudent}
                  selectedGroup={selectedGroup}
                  generateAiReport={handleGenerateAiReport}
                  generateGroupReport={handleGenerateGroupReport}
                  error={error}
                  setError={setError}
                />
              </Card>
            </div>
          )}
        </motion.div>

        <HistoryPanel
          isHistoryVisible={isHistoryVisible}
          reportHistory={reportHistory}
          activeReportId={activeReportId}
          isGenerating={isGenerating}
          dateFrom={dateFrom}
          dateTo={dateTo}
          selectedStudent={selectedStudent}
          selectedGroup={selectedGroup}
          setDateFrom={setDateFrom}
          setDateTo={setDateTo}
          setReportHistory={setReportHistory}
          fetchReportById={handleFetchReportById}
          fetchReportHistory={handleFetchReportHistory}
        />
      </div>
    </div>
  );
}