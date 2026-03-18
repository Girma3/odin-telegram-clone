import { Router } from "express";

// Post controllers
import {
  sendPrivateMessage,
  getChat,
  getConversationHandler,
  getConversationsHandler,
  markMessageAsRead,
  markConversationRead,
  deleteChatHandler,
  getUnreadMessages,
} from "../controllers/private-chat-controllers/private-post-controller.js";

// Reaction controllers
import {
  addReactionToChat,
  removeReactionFromChat,
  getChatReactionsHandler,
} from "../controllers/private-chat-controllers/private-post-reaction-controller.js";

// Comment controllers
import {
  addCommentToChat,
  deleteCommentFromChat,
  getChatCommentsHandler,
} from "../controllers/private-chat-controllers/private-post-comment-controller.js";

import { isUserAuthenticated } from "../controllers/auth-controller.js";

const privatePostRouter = Router({ mergeParams: true });

// Apply authentication to all routes
privatePostRouter.use(isUserAuthenticated);

// Welcome route
privatePostRouter.get("/", (req, res) => {
  return res
    .status(200)
    .json({ message: "Welcome to the private messages API" });
});

// ==================== MESSAGES ====================
// Get all conversations for current user
privatePostRouter.get("/conversations", getConversationsHandler);

// Get unread message count
privatePostRouter.get("/unread", getUnreadMessages);

// Get conversation with a specific user
privatePostRouter.get("/user/:userId", getConversationHandler);

// Mark conversation as read
privatePostRouter.put("/user/:userId/read", markConversationRead);

// Get single chat message by ID
privatePostRouter.get("/:chatId", getChat);

// Send a private message
privatePostRouter.post("/", sendPrivateMessage);

// Mark single message as read
privatePostRouter.put("/:chatId/read", markMessageAsRead);

// Delete a private message
privatePostRouter.delete("/:chatId", deleteChatHandler);

// ==================== REACTIONS ====================
// Add reaction to chat
privatePostRouter.post("/:chatId/reactions", addReactionToChat);

// Get reactions for chat
privatePostRouter.get("/:chatId/reactions", getChatReactionsHandler);

// Remove reaction from chat
privatePostRouter.delete("/:chatId/reactions", removeReactionFromChat);

// ==================== COMMENTS/REPLIES ====================
// Add comment/reply to chat
privatePostRouter.post("/:chatId/comments", addCommentToChat);

// Get comments/replies for chat
privatePostRouter.get("/:chatId/comments", getChatCommentsHandler);

// Delete comment/reply
privatePostRouter.delete("/comments/:commentId", deleteCommentFromChat);

export default privatePostRouter;
