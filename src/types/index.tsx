export interface Task {
  sid: number;
  due_date: string;
  subject: string;
  teacher: string;
  wtf: string;
  work_type: string;
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
}

export interface UserAdmin {
  id: number;
  hintword: string;
  username: string;
}
