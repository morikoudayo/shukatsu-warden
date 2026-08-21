import { getTaskSummaryText } from "../_shared/task-summary.js";

import type { MessageContext } from "../types.js";

export async function handle(context: MessageContext): Promise<void> {
  await context.say({ text: await getTaskSummaryText(context) });
}
