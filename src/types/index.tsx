export interface Task {
  sid: number;
  task_id: number;
  due_date: string;
  subject: string;
  teacher: string;
  wtf: string;
  work_type: string;
  created_by: string;
  created_by_name?: string; // เพิ่ม field นี้
}

export interface GroupedTasks {
  [key: string]: Task[];
}

export interface Subject {
  teacher: string;
  subject: string;
}

export interface EditData {
  due_date: string;
  subject: string;
  teacher: string;
  wtf: string;
  work_type: string;
  created_by?: string; // 👈 เพิ่มตรงนี้
  last_updated_by?: string; // 👈 เพิ่มตรงนี้
}

export interface UserAdmin {
  id: number;
  hintword: string;
  username: string;
}

export interface Note {
  task_id: string;
  note_id: number;
  note: string;
  note_by: string;
  note_date: string;
}
