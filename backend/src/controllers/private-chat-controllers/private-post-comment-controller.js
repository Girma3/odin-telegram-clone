import { CommentSchema } from "../../middlewares/validation/schema-validation.js";
import {
  addChatComment,
  getChatComments,
  deleteChatComment,
} from "../../models/user-query/private-chat-comment-queries.js";
import {
  getPrivateChatById,
  isConversationParticipant,
} from "../../models/user-query/private-chat-queries.js";

// Add comment/reply to chat
async function addCommentToChat(req, res) {
  const { chatId } = req.params;

  const userId = req.user.id;
  const result = CommentSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid comment data", detail: result.error.message });
  }
  const { text } = result.data;
  if (!text) {
    return res.status(400).json({ message: "Comment text is required" });
  }

  try {
    const comment = await addChatComment(chatId, userId, text);
    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to add comment: ${error.message}` });
  }
}

// Get comments/replies for chat
async function getChatCommentsHandler(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    // Check if user is participant
    const chat = await getPrivateChatById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    const isParticipant = await isConversationParticipant(
      chat.senderId,
      chat.receiverId,
      userId,
    );

    if (!isParticipant) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this chat" });
    }
    const comments = await getChatComments(chatId);
    return res.json(comments);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get comments: ${error.message}` });
  }
}

// Delete comment/reply
async function deleteCommentFromChat(req, res) {
  const { commentId } = req.params;
  const userId = req.user.id;

  try {
    await deleteChatComment(commentId, userId);
    return res.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to delete comment: ${error.message}` });
  }
}

export { addCommentToChat, getChatCommentsHandler, deleteCommentFromChat };
