export interface Student {
  id: string;
  full_name: string;
  email: string | null;
  created_at: string;
}

export interface Group {
  id: string;
  name: string;
  students: Student[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  students: Student[];
  groups: Group[];
}

export interface Grade {
  topic: string;
  grade: number;
  comment: string;
  created_at: string;
  student_id: string; 
}

export interface AIReport {
  report_id: string;
  student?: Student; 
  group?: Group;  
  course: Course;   
  grades: Grade[];
  analysis: string;
  success: boolean;
  error?: string;
  is_latest: boolean; 
}

export interface ReportHistoryItem {
  id: string;
  report_id: string;
  date: string;
  raw_date: string;
  type: "student" | "group";
  name: string;
  entity_id: string;
  course_id: string;
  is_latest: boolean; 
}