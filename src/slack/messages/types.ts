export type MessageContext = {
  text: string;
  channelId: string;
  messageTs: string;
  userId: string;
  say: (message: { text: string }) => Promise<unknown>;
};
