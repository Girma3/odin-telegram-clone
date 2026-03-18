import prismaGlobal from "../pool.js";

// Add a reply to a private chat (creates a new message in the conversation)
async function addChatComment(chatId, userId, text) {
  try {
    // Get the original chat to find the receiver
    const originalChat = await prismaGlobal.privateChats.findUnique({
      where: { id: chatId },
      select: { senderId: true, receiverId: true },
    });

    if (!originalChat) {
      throw new Error("Chat not found");
    }

    // Only participants can comment
    if (
      originalChat.senderId !== userId &&
      originalChat.receiverId !== userId
    ) {
      throw new Error("Not authorized to reply to this chat");
    }

    // Determine receiver (the other person)
    const receiverId =
      originalChat.senderId === userId
        ? originalChat.receiverId
        : originalChat.senderId;

    // Create a new message as a reply
    const reply = await prismaGlobal.privateChats.create({
      data: {
        senderId: userId,
        receiverId,
        text,
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

    return reply;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}

// Get comments/replies for a private chat
async function getChatComments(chatId) {
  try {
    const originalChat = await prismaGlobal.privateChats.findUnique({
      where: { id: chatId },
      select: { senderId: true, receiverId: true },
    });

    if (!originalChat) {
      throw new Error("Chat not found");
    }

    // Get all messages in this conversation (both directions between the same users)
    const comments = await prismaGlobal.privateChats.findMany({
      where: {
        OR: [
          {
            senderId: originalChat.senderId,
            receiverId: originalChat.receiverId,
          },
          {
            senderId: originalChat.receiverId,
            receiverId: originalChat.senderId,
          },
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

    return comments;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get comments: ${error.message}`);
  }
}

// Delete a comment/reply in private chat
async function deleteChatComment(commentId, userId) {
  try {
    const comment = await prismaGlobal.privateChats.findUnique({
      where: { id: commentId },
      select: { senderId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.senderId !== userId) {
      throw new Error("Not authorized to delete this comment");
    }

    await prismaGlobal.privateChats.delete({
      where: { id: commentId },
    });

    return { message: "Comment deleted successfully" };
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      throw error;
    }
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

export { addChatComment, getChatComments, deleteChatComment };
