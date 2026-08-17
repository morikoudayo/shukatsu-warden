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

export type CreateTasksFromMessageInput = {
  parsed: ParsedTasks;

  slackChannelId: string;
  slackMessageTs: string;
  slackUserId: string;
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