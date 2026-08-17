import { supabase } from "../../libs/supabase.js";
import type {
  CreateTasksFromMessageInput,
  ParsedTask,
  Task,
} from "./task.types.js";

type InsertedTask = {
  id: string;
  position: number;
};

function validateParsedTasks(tasks: ParsedTask[]): void {
  const positions = new Set<number>();

  for (const task of tasks) {
    if (!Number.isInteger(task.position) || task.position < 0) {
      throw new Error(`Invalid task position: ${task.position}`);
    }

    if (positions.has(task.position)) {
      throw new Error(`Duplicate task position: ${task.position}`);
    }

    positions.add(task.position);

    if (!task.title.trim()) {
      throw new Error(`Task title is required: position=${task.position}`);
    }

    if (
      task.parentPosition !== null &&
      (!Number.isInteger(task.parentPosition) || task.parentPosition < 0)
    ) {
      throw new Error(
        `Invalid parentPosition: position=${task.position}`,
      );
    }
  }

  for (const task of tasks) {
    if (task.parentPosition === null) continue;

    if (!positions.has(task.parentPosition)) {
      throw new Error(
        `Parent task not found: position=${task.position}, parentPosition=${task.parentPosition}`,
      );
    }

    if (task.parentPosition === task.position) {
      throw new Error(
        `A task cannot be its own parent: position=${task.position}`,
      );
    }
  }
}

function toTask(row: {
  id: string;
  parent_task_id: string | null;
  position: number;
  title: string;
  company_name: string | null;
  annotation: string;
  status: "open" | "done" | "cancelled";
  completed_at: string | null;
  slack_channel_id: string;
  slack_message_ts: string;
  slack_user_id: string;
  created_at: string;
  updated_at: string;
}): Task {
  return {
    id: row.id,
    parentTaskId: row.parent_task_id,

    position: row.position,
    title: row.title,
    companyName: row.company_name,
    annotation: row.annotation,

    status: row.status,
    completedAt: row.completed_at,

    slackChannelId: row.slack_channel_id,
    slackMessageTs: row.slack_message_ts,
    slackUserId: row.slack_user_id,

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createTasksFromMessage(
  input: CreateTasksFromMessageInput,
): Promise<Task[]> {
  const { parsed, slackChannelId, slackMessageTs, slackUserId } = input;

  validateParsedTasks(parsed.tasks);

  if (parsed.tasks.length === 0) {
    return [];
  }

  // 親子の深さに関係なく保存できるよう、まず全行を親なしで作成する。
  const { data: insertedRows, error: insertError } = await supabase
    .from("tasks")
    .insert(
      parsed.tasks.map((task) => ({
        parent_task_id: null,
        title: task.title.trim(),
        company_name: task.companyName,
        annotation: task.annotation.trim(),
        status: "open" as const,
        slack_channel_id: slackChannelId,
        slack_message_ts: slackMessageTs,
        position: task.position,
        slack_user_id: slackUserId,
      })),
    )
    .select("id, position");

  if (insertError) {
    throw new Error(`Failed to insert tasks: ${insertError.message}`);
  }

  const positionToId = new Map(
    (insertedRows as InsertedTask[]).map((row) => [row.position, row.id]),
  );

  // 子タスクの parentPosition を、DBの親UUIDへ変換して更新する。
  for (const task of parsed.tasks) {
    if (task.parentPosition === null) continue;

    const parentTaskId = positionToId.get(task.parentPosition);

    if (!parentTaskId) {
      throw new Error(
        `Parent ID was not created: parentPosition=${task.parentPosition}`,
      );
    }

    const { error: updateError } = await supabase
      .from("tasks")
      .update({ parent_task_id: parentTaskId })
      .eq("slack_channel_id", slackChannelId)
      .eq("slack_message_ts", slackMessageTs)
      .eq("position", task.position);

    if (updateError) {
      throw new Error(
        `Failed to assign parent task: ${updateError.message}`,
      );
    }
  }

  const { data: rows, error: selectError } = await supabase
    .from("tasks")
    .select("*")
    .eq("slack_channel_id", slackChannelId)
    .eq("slack_message_ts", slackMessageTs)
    .order("position", { ascending: true });

  if (selectError) {
    throw new Error(`Failed to retrieve created tasks: ${selectError.message}`);
  }

  return rows.map(toTask);
}