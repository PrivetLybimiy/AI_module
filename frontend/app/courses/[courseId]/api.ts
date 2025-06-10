import { Course, ReportHistoryItem, AIReport, Student, Group } from "./types";
import { format } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const fetchWithTokenRefresh = async (url: string, options: RequestInit): Promise<Response> => {
  let token = localStorage.getItem("access_token");
  if (!token) throw new Error("Токен отсутствует");

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  let response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    const refreshResponse = await fetch(`${API_URL}/api/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: localStorage.getItem("refresh_token") }),
    });

    if (refreshResponse.ok) {
      const { access } = await refreshResponse.json();
      localStorage.setItem("access_token", access);
      headers.Authorization = `Bearer ${access}`;
      response = await fetch(url, { ...options, headers });
    } else {
      throw new Error("Не удалось обновить токен");
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || `Ошибка HTTP: ${response.status} - ${errorText}`);
    } catch {
      throw new Error(`Ошибка сервера: ${response.status} - ${errorText}`);
    }
  }

  return response;
};

export const fetchCourse = async (
  courseId: string,
  user: any,
  setCourse: (course: Course) => void,
  setError: (error: string | null) => void,
  router: any
) => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    setError("Токен отсутствует. Пожалуйста, войдите снова.");
    router.push("/login");
    return;
  }

  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/api/courses/${courseId}/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    setCourse(data);
  } catch (err: any) {
    setError(err.message || "Не удалось загрузить курс. Попробуйте снова.");
    router.push("/courses");
  }
};

export const fetchReportHistory = async (
  courseId: string,
  user: any,
  selectedStudent: Student | null,
  selectedGroup: Group | null,
  dateFrom: Date | undefined,
  dateTo: Date | undefined,
  setReportHistory: (history: ReportHistoryItem[]) => void,
  setError: (error: string | null) => void
) => {
  if (!courseId || !user || (!selectedStudent && !selectedGroup)) return;

  try {
    const params = new URLSearchParams();
    params.append("course_id", courseId);

    if (selectedStudent?.id) {
      params.append("student_id", String(selectedStudent.id));
    } else if (selectedGroup?.id && !isNaN(Number(selectedGroup.id))) {
      params.append("group_id", String(selectedGroup.id));
    } else {
      return;
    }

    const formatDate = (date: Date) => format(date, "yyyy-MM-dd"); // Формат YYYY-MM-DD

    // Если выбрана только одна дата, устанавливаем date_from и date_to равными этой дате
    if (dateFrom && !dateTo) {
      params.append("date_from", formatDate(dateFrom));
      params.append("date_to", formatDate(dateFrom));
    } else if (dateTo && !dateFrom) {
      params.append("date_from", formatDate(dateTo));
      params.append("date_to", formatDate(dateTo));
    } else if (dateFrom && dateTo) {
      // Если выбраны обе даты, устанавливаем диапазон
      params.append("date_from", formatDate(dateFrom));
      params.append("date_to", formatDate(dateTo));
    }

    const response = await fetchWithTokenRefresh(`${API_URL}/api/report-history/?${params.toString()}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();

    if (!Array.isArray(data)) {
      setError("История отчетов временно недоступна.");
      setReportHistory([]);
      return;
    }

    const validReports = data.filter(
      (item): item is ReportHistoryItem =>
        item &&
        typeof item === "object" &&
        typeof item.report_id === "string" &&
        typeof item.date === "string" &&
        typeof item.type === "string" &&
        typeof item.name === "string" &&
        typeof item.entity_id === "string" &&
        typeof item.course_id === "string" &&
        (item.is_latest === undefined || typeof item.is_latest === "boolean")
    );

    setReportHistory(
      validReports.sort((a, b) => new Date(b.raw_date || b.date).getTime() - new Date(a.raw_date || a.date).getTime())
    );
  } catch (err: any) {
    setError(err.message || "Не удалось загрузить историю отчетов. Попробуйте позже.");
  }
};

export const fetchReportById = async (
  reportId: string,
  setAiReport: (report: AIReport | null) => void,
  setError: (error: string | null) => void
) => {
  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/api/reports/${reportId}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    setAiReport(data);
  } catch (err: any) {
    setError(err.message || "Не удалось загрузить отчет. Попробуйте снова.");
  }
};

export const generateAiReport = async (
  selectedStudent: Student,
  courseId: string,
  setAiReport: (report: AIReport | null) => void,
  setReportHistory: (history: (prev: ReportHistoryItem[]) => ReportHistoryItem[]) => void,
  setActiveReportId: (id: string | null) => void,
  setError: (error: string | null) => void,
  fetchReportById: (reportId: string) => Promise<void>,
  fetchReportHistory: () => Promise<void>
) => {
  const tempReportId = `temp-${Date.now()}`;
  const currentDate = new Date();
  const tempReport: ReportHistoryItem = {
    id: tempReportId,
    report_id: tempReportId,
    date: format(currentDate, "dd.MM.yyyy"),
    raw_date: currentDate.toISOString(),
    type: "student",
    name: selectedStudent.full_name,
    entity_id: selectedStudent.id,
    course_id: courseId,
    is_latest: false,
  };

  setReportHistory((prev) => {
    const updatedHistory = [...prev, tempReport];
    return updatedHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
  });
  setActiveReportId(tempReportId);

  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/api/generate-ai-report/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_id: selectedStudent.id,
        course_id: courseId,
      }),
    });

    const data = await response.json();

    if (!data || typeof data !== "object") throw new Error("Неверный формат ответа от сервера");
    if (!data.success) throw new Error(data.error || "Не удалось сгенерировать отчет по студенту");
    if (!data.report_id || !data.student || !data.student.id) throw new Error("Отсутствуют необходимые данные в ответе сервера");

    await fetchReportById(data.report_id);
    if (selectedStudent.id === String(data.student.id)) {
      const newReport: ReportHistoryItem = {
        id: data.report_id,
        report_id: data.report_id,
        date: format(currentDate, "dd.MM.yyyy"),
        raw_date: new Date(currentDate).toISOString(),
        type: "student",
        name: data.student?.full_name || selectedStudent.full_name,
        entity_id: selectedStudent.id,
        course_id: courseId,
        is_latest: data.is_latest || false,
      };

      setReportHistory((prev) => {
        const filteredHistory = prev.filter((r) => r.report_id !== tempReportId);
        const updatedHistory = [...filteredHistory, newReport];
        return updatedHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
      });
      setActiveReportId(data.report_id);
      await fetchReportHistory();
    }
  } catch (err: any) {
    setError(err.message || "Не удалось сгенерировать отчет по студенту. Попробуйте снова.");
    setReportHistory((prev) => {
      const filteredHistory = prev.filter((r) => r.report_id !== tempReportId);
      return filteredHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
    });
    setActiveReportId(null);
  }
};

export const generateGroupReport = async (
  selectedGroup: Group,
  courseId: string,
  setAiReport: (report: AIReport | null) => void,
  setReportHistory: (history: (prev: ReportHistoryItem[]) => ReportHistoryItem[]) => void,
  setActiveReportId: (id: string | null) => void,
  setError: (error: string | null) => void,
  fetchReportById: (reportId: string) => Promise<void>,
  fetchReportHistory: () => Promise<void>
) => {
  const tempReportId = `temp-${Date.now()}`;
  const currentDate = new Date();
  const tempReport: ReportHistoryItem = {
    id: tempReportId,
    report_id: tempReportId,
    date: format(currentDate, "dd.MM.yyyy"),
    raw_date: currentDate.toISOString(),
    type: "group",
    name: selectedGroup.name,
    entity_id: selectedGroup.id,
    course_id: courseId,
    is_latest: false,
  };

  setReportHistory((prev) => {
    const updatedHistory = [...prev, tempReport];
    return updatedHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
  });
  setActiveReportId(tempReportId);

  try {
    const response = await fetchWithTokenRefresh(`${API_URL}/api/generate-group-report/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: selectedGroup.id,
        course_id: courseId,
      }),
    });

    const data = await response.json();

    if (!data || typeof data !== "object") throw new Error("Неверный формат ответа от сервера");
    if (!data.success) throw new Error(data.error || "Не удалось сгенерировать отчет по группе");
    if (!data.report_id || !data.group || !data.group.id) throw new Error("Отсутствуют необходимые данные в ответе сервера");

    await fetchReportById(data.report_id);
    if (selectedGroup.id === String(data.group.id)) {
      const newReport: ReportHistoryItem = {
        id: data.report_id,
        report_id: data.report_id,
        date: format(currentDate, "dd.MM.yyyy"),
        raw_date: new Date(currentDate).toISOString(),
        type: "group",
        name: data.group?.name || selectedGroup.name,
        entity_id: selectedGroup.id,
        course_id: courseId,
        is_latest: data.is_latest || false,
      };

      setReportHistory((prev) => {
        const filteredHistory = prev.filter((r) => r.report_id !== tempReportId);
        const updatedHistory = [...filteredHistory, newReport];
        return updatedHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
      });
      setActiveReportId(data.report_id);
      await fetchReportHistory();
    }
  } catch (err: any) {
    setError(err.message || "Не удалось сгенерировать отчет по группе. Попробуйте снова.");
    setReportHistory((prev) => {
      const filteredHistory = prev.filter((r) => r.report_id !== tempReportId);
      return filteredHistory.sort((a, b) => new Date(b.raw_date).getTime() - new Date(a.raw_date).getTime());
    });
    setActiveReportId(null);
  }
};