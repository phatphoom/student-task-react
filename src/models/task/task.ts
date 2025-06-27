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
    last_updated_by?: string;
}