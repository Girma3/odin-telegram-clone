import { z } from "zod";

// Robust UUID validation regex (supports UUID v1-v5, case insensitive)
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Robust URL validation regex (supports http, https, and common URL formats)
const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i;

const UUID_SCHEMA = z.string().regex(uuidRegex, "Invalid UUID format");
const URL_SCHEMA = z.string().regex(urlRegex, "Invalid URL format").optional();

// User schema
const UserSchema = z.object({
  //id: UUID_SCHEMA,
  username: z.string().min(3).max(30),
  email: z.email("Invalid email format"),
  status: z.enum(["ONLINE", "OFFLINE"]).default("ONLINE").optional(),
  // createdAt: z.date(),
});

// Profile schema
const ProfileSchema = z.object({
  bio: z.string().max(300).optional(), //  max length
  avatarUrl: URL_SCHEMA.optional(),
  location: z.string().max(100).optional(),
  website: URL_SCHEMA.optional(),
  userId: UUID_SCHEMA,
  groupId: UUID_SCHEMA.optional(),
});

// Group schema
const GroupSchema = z.object({
  name: z.string().min(3),
  profile: ProfileSchema.optional(),
});

// Post schema
const PostSchema = z.object({
  id: UUID_SCHEMA.optional(),
  text: z.string().optional(),
  imgUrl: URL_SCHEMA.optional(),
  userId: UUID_SCHEMA.optional(),
  groupId: UUID_SCHEMA.optional(),
});

// Comment schema
const CommentSchema = z.object({
  text: z.string().min(1),
  postId: UUID_SCHEMA.optional(),
  userId: UUID_SCHEMA.optional(),
  parentId: UUID_SCHEMA.optional(),
});

// Reaction schema
const ReactionSchema = z.object({
  emoji: z.string().min(1),
  postId: UUID_SCHEMA.optional(),
});

// PrivateChat schema
const PrivateChatSchema = z.object({
  text: z.string().optional(),
  imgUrl: URL_SCHEMA.optional(),
  read: z.boolean().default(false),
  senderId: UUID_SCHEMA.optional(),
  receiverId: UUID_SCHEMA,
});

// Notification schema
const NotificationSchema = z.object({
  id: UUID_SCHEMA,
  type: z.enum(["COMMENT", "REACTION", "MESSAGE", "GROUP_INVITE"]),
  message: z.string().optional(),
  createdAt: z.coerce.date(),
  read: z.boolean().default(false),
  userId: UUID_SCHEMA,
  postId: UUID_SCHEMA.optional(),
  commentId: UUID_SCHEMA.optional(),
  reactionId: UUID_SCHEMA.optional(),
  chatId: UUID_SCHEMA.optional(),
});
// RefreshToken schema
const RefreshTokenSchema = z.object({
  id: UUID_SCHEMA,
  token: z.string().min(10), // JWTs are long strings, enforce minimum length
  userId: UUID_SCHEMA,
  createdAt: z.date(),
  expiresAt: z.date(),
});

export {
  UserSchema,
  ProfileSchema,
  GroupSchema,
  PostSchema,
  CommentSchema,
  ReactionSchema,
  PrivateChatSchema,
  NotificationSchema,
  RefreshTokenSchema,
};
