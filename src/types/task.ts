export type Task = {
  id: string;
  title: string;
  companyName: string | null;
  status: "open" | "done" | "cancelled";
  completedAt: string | null;
  slackChannelId: string;
  slackMessageTs: string;
  slackUserId: string;
  createdAt: string;
  updatedAt: string;
};
