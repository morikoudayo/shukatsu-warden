export type ParsedTask = {
  title: string;
  companyName: string | null;
};

export type ParsedTasks = {
  tasks: ParsedTask[];
};

type TaskStatus = "open" | "done" | "cancelled";

export type Task = {
  id: string;

  title: string;
  companyName: string | null;

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
