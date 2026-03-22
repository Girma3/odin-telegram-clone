import { z } from "zod";

const privateMessageSchema = z.object({
  userA: z.string(),
  userB: z.string(),
  text: z.string().min(1),
});

const groupMessageSchema = z.object({
  groupId: z.string(),
  text: z.string().min(1),
});

const reactionSchema = z.object({
  messageId: z.string(),
  reaction: z.string(),
  roomType: z.enum(["group", "private"]),
  roomId: z.string(),
});

export { privateMessageSchema, groupMessageSchema, reactionSchema };
