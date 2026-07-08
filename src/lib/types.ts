export type Category = "agenda" | "issue" | "task";
export type Status = "todo" | "in_progress" | "done";

export type ItemDTO = {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  status: Status;
  assignee: string | null;
  dueDate: string | null;
  meetingWeek: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { comments: number };
};

export type CommentDTO = {
  id: string;
  itemId: string;
  author: string;
  body: string;
  createdAt: string;
};

export type MemberDTO = {
  id: string;
  name: string;
  createdAt: string;
};

export const CATEGORY_LABEL: Record<Category, string> = {
  agenda: "議題",
  issue: "課題・共有",
  task: "個人タスク",
};

export const STATUS_LABEL: Record<Status, string> = {
  todo: "未着手",
  in_progress: "対応中",
  done: "完了",
};
