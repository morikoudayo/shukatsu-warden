import type { Task } from "../../../types/task.js";

export type ParsedTask = Pick<Task, "title" | "companyName">;

export type NewTask = Pick<
  Task,
  "id" | "title" | "companyName" | "slackChannelId" | "slackMessageTs" | "slackUserId"
>;
