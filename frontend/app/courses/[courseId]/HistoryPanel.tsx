"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Star } from "lucide-react";
import { ReportHistoryItem, Student, Group } from "./types";

interface HistoryPanelProps {
  isHistoryVisible: boolean;
  reportHistory: ReportHistoryItem[];
  activeReportId: string | null;
  isGenerating: boolean;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  selectedStudent: Student | null;
  selectedGroup: Group | null;
  setDateFrom: (date: Date | undefined) => void;
  setDateTo: (date: Date | undefined) => void;
  setReportHistory: (history: ReportHistoryItem[]) => void;
  fetchReportById: (reportId: string) => void;
  fetchReportHistory: () => Promise<void>; 
}

export const HistoryPanel = ({
  isHistoryVisible,
  reportHistory,
  activeReportId,
  isGenerating,
  dateFrom,
  dateTo,
  selectedStudent,
  selectedGroup,
  setDateFrom,
  setDateTo,
  setReportHistory,
  fetchReportById,
  fetchReportHistory,
}: HistoryPanelProps) => {
  const MAX_HISTORY_ITEMS = 15;
  const [visibleItems, setVisibleItems] = useState(MAX_HISTORY_ITEMS);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const loadMore = () => {
    setVisibleItems((prev) => Math.min(prev + MAX_HISTORY_ITEMS, reportHistory.length));
  };

const handleReset = () => {
  if (isGenerating) return;
  setDateFrom(undefined);
  setDateTo(undefined);
  setReportHistory([]);
  setIsHistoryLoading(true);
  fetchReportHistory().finally(() => setIsHistoryLoading(false));
};

  return (
    <motion.div
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: isHistoryVisible ? 288 : 0, opacity: isHistoryVisible ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card border-l border-border flex flex-col overflow-hidden ${isHistoryVisible ? "w-72" : "w-0"}`}
    >
      <div className="p-4 border-b border-border">
        <h3 className="font-medium mb-3">История отчетов</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">С даты:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateFrom ? format(dateFrom, "dd.MM.yyyy") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} locale={ru} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium">По дату:</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 px-2 text-xs">
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {dateTo ? format(dateTo, "dd.MM.yyyy") : "Выберите дату"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dateTo} onSelect={setDateTo} locale={ru} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2 text-xs"
            onClick={handleReset}
            disabled={isGenerating}
          >
            Сбросить
          </Button>
        </div>
      </div>
     <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {isHistoryLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Загрузка истории...
            </div>
          ) : reportHistory.length > 0 ? (
            <>
              {reportHistory.slice(0, visibleItems).map((item) => (
                <button
                  key={item.report_id} // Ошибки с key нет, так как report_id уникален
                  className={`w-full text-left p-3 hover:bg-muted transition-colors ${
                    activeReportId === item.report_id ? "bg-muted" : ""
                  } ${isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => !isGenerating && fetchReportById(item.report_id)}
                  disabled={isGenerating}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium">
                      {item.is_latest && !item.report_id.startsWith("temp-") && (
                        <Star className="inline-block h-3 w-3 text-yellow-500 mr-1" />
                      )}
                      {item.type === "student" ? "Студент" : "Группа"}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(item.raw_date)}</span>
                  </div>
                  <p className="font-normal text-sm truncate">{item.name}</p>
                  {item.report_id.startsWith("temp-") && (
                    <span className="text-xs text-muted-foreground">Генерируется...</span>
                  )}
                </button>
              ))}
              {visibleItems < reportHistory.length && (
                <Button variant="outline" size="sm" className="w-full mt-2 text-xs" onClick={loadMore}>
                  Показать больше
                </Button>
              )}
            </>
          ) : !selectedStudent && !selectedGroup ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Выберите студента или группу для просмотра истории
            </div>
          ) : dateFrom || dateTo ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Нет отчетов за выбранный период. Попробуйте изменить даты.
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">История отчетов пуста</div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
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