export type ParsedTask = {
  position: number;
  parentPosition: number | null;

  title: string;
  companyName: string | null;
  annotation: string;
};

export type ParsedTasks = {
  tasks: ParsedTask[];
};

type TaskStatus = "open" | "done" | "cancelled";

export type Task = {
  id: string;
  parentTaskId: string | null;

  position: number;
  title: string;
  companyName: string | null;
  annotation: string;

  status: TaskStatus;
  completedAt: string | null;

  slackChannelId: string;
  slackMessageTs: string;
  slackUserId: string;

  createdAt: string;
  updatedAt: string;
};

export type TaskInsert = Omit<
  Task,
  "status" | "completedAt" | "createdAt" | "updatedAt"
>;