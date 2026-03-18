import {
  addChatReaction,
  getChatReactions,
  removeChatReaction,
} from "../../models/user-query/private-chat-reaction-queries.js";
import {
  getPrivateChatById,
  isConversationParticipant,
} from "../../models/user-query/private-chat-queries.js";
// Add reaction to chat
async function addReactionToChat(req, res) {
  const { chatId } = req.params;
  const { emoji } = req.body;
  const userId = req.user.id;

  if (!emoji || emoji.trim() === "") {
    return res.status(400).json({ message: "Emoji is required" });
  }

  try {
    const reaction = await addChatReaction(chatId, userId, emoji);

    return res.status(201).json(reaction);
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
      .json({ message: `Failed to add reaction: ${error.message}` });
  }
}

// Get reactions for chat
async function getChatReactionsHandler(req, res) {
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

    const reactions = await getChatReactions(chatId);
    return res.json(reactions);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get reactions: ${error.message}` });
  }
}

// Remove reaction from chat
async function removeReactionFromChat(req, res) {
  const { chatId } = req.params;
  const userId = req.user.id;

  try {
    await removeChatReaction(chatId, userId);
    return res.json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error(error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to remove reaction: ${error.message}` });
  }
}

export { addReactionToChat, getChatReactionsHandler, removeReactionFromChat };
