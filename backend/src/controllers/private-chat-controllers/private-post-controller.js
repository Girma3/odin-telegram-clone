import {
  createPrivateChat,
  getPrivateChatById,
  getConversation,
  getUserConversations,
  markAsRead,
  markConversationAsRead,
  deletePrivateChat,
  getUnreadCount,
  isConversationParticipant,
} from "../../models/user-query/private-chat-queries.js";
import { PrivateChatSchema } from "../../middlewares/validation/schema-validation.js";

// Send a private message
async function sendPrivateMessage(req, res) {
  const result = PrivateChatSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid message data", detail: result.error.message });
  }
  const { receiverId, text, imgUrl } = result.data;
  if (!text && !imgUrl) {
    return res
      .status(400)
      .json({ message: "Either text or image is required" });
  }

  const senderId = req.user.id;

  // Cannot send message to yourself
  if (senderId === receiverId) {
    return res.status(400).json({ message: "Cannot send message to yourself" });
  }

  try {
    const chat = await createPrivateChat(senderId, receiverId, {
      text,
      imgUrl,
    });
    return res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to send message: ${error.message}` });
  }
}

// Get private chat by ID
async function getChat(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await getPrivateChatById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is part of the conversation
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

    return res.json(chat);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get chat: ${error.message}` });
  }
}

// Get conversation between two users
async function getConversationHandler(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    const chats = await getConversation(currentUserId, userId);
    return res.json(chats);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get conversation: ${error.message}` });
  }
}

// Get all conversations for current user
async function getConversationsHandler(req, res) {
  const userId = req.user.id;

  try {
    const conversations = await getUserConversations(userId);
    return res.json(conversations);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get conversations: ${error.message}` });
  }
}

// Mark message as read
async function markMessageAsRead(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    const chat = await getPrivateChatById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Only receiver can mark as read
    if (chat.receiverId !== userId) {
      return res
        .status(403)
        .json({ message: "Only receiver can mark message as read" });
    }

    const updatedChat = await markAsRead(chatId, userId);
    return res.json(updatedChat);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to mark as read: ${error.message}` });
  }
}

// Mark entire conversation as read
async function markConversationRead(req, res) {
  const { userId } = req.params;
  const currentUserId = req.user.id;

  try {
    await markConversationAsRead(userId, currentUserId);
    return res.json({ message: "Conversation marked as read" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to mark as read: ${error.message}` });
  }
}

// Delete a private message
async function deleteChatHandler(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    await deletePrivateChat(chatId, userId);
    return res.json({ message: "Message deleted successfully" });
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
      .json({ message: `Failed to delete message: ${error.message}` });
  }
}

// Get unread message count
async function getUnreadMessages(req, res) {
  const userId = req.user.id;

  try {
    const count = await getUnreadCount(userId);
    return res.json({ unreadCount: count });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get unread count: ${error.message}` });
  }
}

export {
  sendPrivateMessage,
  getChat,
  getConversationHandler,
  getConversationsHandler,
  markMessageAsRead,
  markConversationRead,
  deleteChatHandler,
  getUnreadMessages,
};
