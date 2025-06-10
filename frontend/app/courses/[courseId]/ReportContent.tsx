import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText, RotateCw } from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { RobotoRegular, RobotoBold } from "@/src/fonts/roboto";
import { AIReport, Student, Group, Grade } from "./types";

interface ReportContentProps {
  aiReport: AIReport | null;
  isGenerating: boolean;
  selectedStudent: Student | null;
  selectedGroup: Group | null;
  generateAiReport: () => void;
  generateGroupReport: () => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const ReportContent = ({
  aiReport,
  isGenerating,
  selectedStudent,
  selectedGroup,
  generateAiReport,
  generateGroupReport,
  error,
  setError,
}: ReportContentProps) => {
  const reportDate = format(new Date(), "dd.MM.yyyy");

  const exportToPdf = () => {
    if (!aiReport || !selectedStudent) return;

    const doc = new jsPDF();
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFileToVFS("Roboto-Bold.ttf", RobotoBold);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);

    let yOffset = 10;
    const pageHeight = 290;
    const lineHeight = 5;

    doc.setFontSize(16);
    doc.setFont("Roboto", "bold");
    doc.text("Аналитический отчет по успеваемости", 105, yOffset, { align: "center" });
    yOffset += 10;

    doc.setLineWidth(0.5);
    doc.line(10, yOffset, 200, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.setFont("Roboto", "normal");
    doc.text(`Студент: ${aiReport.student!.full_name}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Email: ${aiReport.student!.email || "Нет данных"}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Курс: ${aiReport.course.title}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Дата формирования отчета: ${reportDate}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.setFont("Roboto", "bold");
    doc.text("Оценки:", 10, yOffset);
    yOffset += 7;

    if (yOffset > pageHeight - 50) {
      doc.addPage();
      yOffset = 20;
    }

    autoTable(doc, {
      startY: yOffset,
      head: [["Тема", "Оценка", "Комментарий", "Дата"]],
      body: aiReport.grades.map((grade) => [grade.topic, grade.grade, grade.comment, formatDate(grade.created_at)]),
      styles: { font: "Roboto", fontStyle: "normal", fontSize: 10, textColor: [0, 0, 0] },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      margin: { top: 10 },
    });

    yOffset = (doc as any).lastAutoTable.finalY + 10;

    if (yOffset > pageHeight - 20) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(14);
    doc.setFont("Roboto", "bold");
    doc.text("Анализ:", 10, yOffset);
    yOffset += 7;

    doc.setFontSize(12);
    doc.setFont("Roboto", "normal");

    const paragraphs = aiReport.analysis.split("\n\n").filter((p) => p.trim());
    paragraphs.forEach((paragraph: string, paraIndex: number) => {
      const paragraphLines = doc.splitTextToSize(paragraph, 190);
      paragraphLines.forEach((line: string) => {
        if (yOffset + lineHeight > pageHeight - 10) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(line, 10, yOffset);
        yOffset += lineHeight;
      });
      if (paraIndex < paragraphs.length - 1) yOffset += 3;
    });

    doc.save(`отчет_${aiReport.student!.full_name.replace(/\s+/g, "_")}.pdf`);
  };

  const exportGroupToPdf = () => {
    if (!aiReport || !selectedGroup) return;

    const doc = new jsPDF();
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoRegular);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.addFileToVFS("Roboto-Bold.ttf", RobotoBold);
    doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

    doc.setFont("Roboto", "normal");
    doc.setFontSize(12);

    let yOffset = 10;
    const pageHeight = 290;
    const lineHeight = 5;

    doc.setFontSize(16);
    doc.setFont("Roboto", "bold");
    doc.text("Аналитический отчет по успеваемости группы", 105, yOffset, { align: "center" });
    yOffset += 10;

    doc.setLineWidth(0.5);
    doc.line(10, yOffset, 200, yOffset);
    yOffset += 10;

    doc.setFontSize(12);
    doc.setFont("Roboto", "normal");
    doc.text(`Группа: ${aiReport.group!.name}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Количество студентов: ${aiReport.group!.students.length}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Курс: ${aiReport.course.title}`, 10, yOffset);
    yOffset += 7;
    doc.text(`Дата формирования отчета: ${reportDate}`, 10, yOffset);
    yOffset += 10;

    doc.setFontSize(14);
    doc.setFont("Roboto", "bold");
    doc.text("Средние баллы студентов:", 10, yOffset);
    yOffset += 7;

    if (yOffset > pageHeight - 50) {
      doc.addPage();
      yOffset = 20;
    }

    const studentAverages = calculateStudentAverages(aiReport.grades, aiReport.group!.students);
    autoTable(doc, {
      startY: yOffset,
      head: [["Студент", "Средний балл"]],
      body: studentAverages.map((student) => [student.full_name, student.averageGrade.toFixed(2)]),
      styles: { font: "Roboto", fontStyle: "normal", fontSize: 10, textColor: [0, 0, 0] },
      headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0], fontStyle: "bold" },
      margin: { top: 10 },
    });

    yOffset = (doc as any).lastAutoTable.finalY + 10;

    if (yOffset > pageHeight - 20) {
      doc.addPage();
      yOffset = 20;
    }

    doc.setFontSize(14);
    doc.setFont("Roboto", "bold");
    doc.text("Анализ:", 10, yOffset);
    yOffset += 7;

    doc.setFontSize(12);
    doc.setFont("Roboto", "normal");

    const paragraphs = aiReport.analysis.split("\n\n").filter((p) => p.trim());
    paragraphs.forEach((paragraph: string, paraIndex: number) => {
      const paragraphLines = doc.splitTextToSize(paragraph, 190);
      paragraphLines.forEach((line: string) => {
        if (yOffset + lineHeight > pageHeight - 10) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(line, 10, yOffset);
        yOffset += lineHeight;
      });
      if (paraIndex < paragraphs.length - 1) yOffset += 3;
    });

    if (doc.getNumberOfPages() > 0) {
      doc.save(`отчет_группа_${aiReport.group!.name.replace(/\s+/g, "_")}.pdf`);
    }
  };

  const calculateStudentAverages = (grades: Grade[], students: Student[]) => {
    const studentAverages: { full_name: string; averageGrade: number }[] = [];
    students.forEach((student) => {
      const studentGrades = grades.filter((grade) => String(grade.student_id) === String(student.id));
      const averageGrade =
        studentGrades.length > 0
          ? studentGrades.reduce((sum, grade) => sum + grade.grade, 0) / studentGrades.length
          : 0;
      studentAverages.push({ full_name: student.full_name, averageGrade });
    });
    return studentAverages;
  };

  return (
    <CardContent className="p-0">
      {error ? (
        <div className="flex flex-col items-center justify-center py-24 text-center text-red-500">
          <p>{error}</p>
          <Button
            onClick={() => {
              setError(null);
              selectedGroup ? generateGroupReport() : generateAiReport();
            }}
            disabled={isGenerating}
            className="mt-4"
            size="lg"
          >
            <RotateCw className="mr-2 h-4 w-4" /> Попробовать снова
          </Button>
        </div>
      ) : !aiReport && !isGenerating ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-lg font-medium">Отчет еще не сгенерирован</h3>
          <p className="mb-4 text-muted-foreground">
            Нажмите кнопку "Сгенерировать отчет", чтобы создать AI-анализ успеваемости
          </p>
          <Button
            onClick={selectedGroup ? generateGroupReport : generateAiReport}
            disabled={isGenerating}
            className="mt-4"
            size="lg"
          >
            <FileText className="mr-2 h-4 w-4" />
            {selectedGroup ? "Сгенерировать отчет по группе" : "Сгенерировать отчет по студенту"}
          </Button>
        </div>
      ) : isGenerating ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <RotateCw className="mb-4 h-16 w-16 animate-spin text-primary" />
          <h3 className="text-lg font-medium">Генерация отчета...</h3>
          <p className="text-muted-foreground">
            Пожалуйста, подождите. Искусственный интеллект анализирует данные {selectedGroup ? "группы" : "студента"}.
          </p>
        </div>
      ) : aiReport && aiReport.success ? (
        <div className="p-8">
          <div className="report-container">
            <h2 className="text-2xl font-bold text-center mb-4">Аналитический отчет по успеваемости</h2>
            <div className="w-full h-px bg-gray-300 mb-6"></div>

            <div className="student-info mb-6">
              {selectedGroup ? (
                <>
                  <p className="text-base">
                    Группа: <span className="font-medium">{aiReport.group?.name || "Не указана"}</span>
                  </p>
                  <p className="text-base">
                    Количество студентов: <span className="font-medium">{aiReport.group?.students.length || 0}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base">
                    Студент: <span className="font-medium">{aiReport.student?.full_name || "Не указан"}</span>
                  </p>
                  <p className="text-base">
                    Email: <span className="font-medium">{aiReport.student?.email || "Нет данных"}</span>
                  </p>
                </>
              )}
              <p className="text-base">
                Курс: <span className="font-medium">{aiReport.course.title}</span>
              </p>
              <p className="text-base">
                Дата формирования отчета: <span className="font-medium">{reportDate}</span>
              </p>
            </div>

            {selectedStudent && (
              <div className="report-section mb-6">
                <h3 className="text-xl font-bold mb-3">Оценки</h3>
                {aiReport.grades.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Тема</TableHead>
                        <TableHead>Оценка</TableHead>
                        <TableHead>Комментарий</TableHead>
                        <TableHead>Дата</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {aiReport.grades.map((grade, index) => (
                        <TableRow key={index}>
                          <TableCell>{grade.topic}</TableCell>
                          <TableCell>{grade.grade}</TableCell>
                          <TableCell>{grade.comment}</TableCell>
                          <TableCell>{formatDate(grade.created_at)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">Оценки отсутствуют</p>
                )}
              </div>
            )}

            {selectedGroup && aiReport.group && (
              <div className="report-section mb-6">
                <h3 className="text-xl font-bold mb-3">Средние баллы студентов</h3>
                {aiReport.group.students.length > 0 ? (
                  aiReport.grades && aiReport.grades.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Студент</TableHead>
                          <TableHead>Средний балл</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {calculateStudentAverages(aiReport.grades, aiReport.group.students).map((student, index) => (
                          <TableRow key={index}>
                            <TableCell>{student.full_name}</TableCell>
                            <TableCell>{student.averageGrade.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-muted-foreground">Оценки для группы отсутствуют</p>
                  )
                ) : (
                  <p className="text-muted-foreground">Студенты отсутствуют</p>
                )}
              </div>
            )}

            <div className="report-section">
              <h3 className="text-xl font-bold mb-3">Анализ</h3>
              {aiReport.analysis
                .split("\n\n")
                .filter((p) => p.trim())
                .map((paragraph, index) => (
                  <p key={index} className="text-base leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <Button variant="outline" onClick={selectedGroup ? exportGroupToPdf : exportToPdf} size="lg">
              <Download className="mr-2 h-4 w-4" /> Скачать PDF
            </Button>
            <Button onClick={selectedGroup ? generateGroupReport : generateAiReport} disabled={isGenerating} size="lg">
              <FileText className="mr-2 h-4 w-4" /> Обновить отчет
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center text-red-500">
          <p>{aiReport?.error || "Не удалось сгенерировать отчет. Попробуйте снова."}</p>
          <Button
            onClick={() => {
              setError(null);
              selectedGroup ? generateGroupReport() : generateAiReport();
            }}
            disabled={isGenerating}
            className="mt-4"
            size="lg"
          >
            <RotateCw className="mr-2 h-4 w-4" /> Попробовать снова
          </Button>
        </div>
      )}
    </CardContent>
  );
};

const formatDate = (dateString: string) => {
  if (!dateString) return "Нет данных";
  try {
    return format(new Date(dateString), "dd.MM.yyyy");
  } catch {
    return "Некорректная дата";
  }
};