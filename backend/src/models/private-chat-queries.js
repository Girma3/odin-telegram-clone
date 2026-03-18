import prismaGlobal from "./pool.js";

// Create a new private chat message
async function createPrivateChat(senderId, receiverId, data = {}) {
  try {
    const chat = await prismaGlobal.privateChats.create({
      data: {
        senderId,
        receiverId,
        text: data.text || null,
        imgUrl: data.imgUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
      },
    });
    return chat;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create private chat: ${error.message}`);
  }
}

// Get private chat by ID
async function getPrivateChatById(chatId) {
  try {
    const chat = await prismaGlobal.privateChats.findUnique({
      where: {
        id: chatId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        notifications: true,
      },
    });
    return chat;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get private chat: ${error.message}`);
  }
}

// Get conversation between two users
async function getConversation(userId1, userId2) {
  try {
    const chats = await prismaGlobal.privateChats.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: {
        created: "asc",
      },
    });
    return chats;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get conversation: ${error.message}`);
  }
}

// Get all conversations for a user
async function getUserConversations(userId) {
  try {
    // Get unique conversations (latest message with each user)
    const chats = await prismaGlobal.privateChats.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });

    // Group by conversation partner
    const conversationsMap = new Map();

    for (const chat of chats) {
      const partnerId =
        chat.senderId === userId ? chat.receiverId : chat.senderId;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partnerId,
          partner: chat.senderId === userId ? chat.receiver : chat.sender,
          lastMessage: chat,
          updatedAt: chat.created,
        });
      }
    }

    return Array.from(conversationsMap.values());
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get user conversations: ${error.message}`);
  }
}

// Mark messages as read
async function markAsRead(chatId, userId) {
  try {
    const chat = await prismaGlobal.privateChats.update({
      where: {
        id: chatId,
      },
      data: {
        read: true,
      },
    });
    return chat;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to mark as read: ${error.message}`);
  }
}

// Mark all messages from a user as read
async function markConversationAsRead(senderId, receiverId) {
  try {
    const chats = await prismaGlobal.privateChats.updateMany({
      where: {
        senderId,
        receiverId,
        read: false,
      },
      data: {
        read: true,
      },
    });
    return chats;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to mark conversation as read: ${error.message}`);
  }
}

// Delete a private chat message
async function deletePrivateChat(chatId, userId) {
  try {
    // First check if user is sender
    const chat = await prismaGlobal.privateChats.findUnique({
      where: { id: chatId },
      select: { senderId: true },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.senderId !== userId) {
      throw new Error("Not authorized to delete this message");
    }

    // Delete related notifications
    await prismaGlobal.notifications.deleteMany({
      where: { chatId },
    });

    const deletedChat = await prismaGlobal.privateChats.delete({
      where: {
        id: chatId,
      },
    });
    return deletedChat;
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      throw error;
    }
    throw new Error(`Failed to delete chat: ${error.message}`);
  }
}

// Get unread message count for a user
async function getUnreadCount(userId) {
  try {
    const count = await prismaGlobal.privateChats.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get unread count: ${error.message}`);
  }
}

// Check if user is part of conversation
async function isConversationParticipant(userId1, userId2, checkUserId) {
  return userId1 === checkUserId || userId2 === checkUserId;
}

export {
  createPrivateChat,
  getPrivateChatById,
  getConversation,
  getUserConversations,
  markAsRead,
  markConversationAsRead,
  deletePrivateChat,
  getUnreadCount,
  isConversationParticipant,
};
