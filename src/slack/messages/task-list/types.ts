import type { Task } from "../../../types/task.js";

export type TaskListItem = Pick<Task, "title" | "status">;
