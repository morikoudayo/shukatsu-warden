import type { Task } from "../../../types/task.js";

export type TaskCandidate = Pick<Task, "id" | "title" | "companyName">;
