import prismaGlobal from "../pool.js";

// Add reaction to private chat
async function addChatReaction(chatId, userId, emoji) {
  try {
    // Check if chat exists and user is participant
    const chat = await prismaGlobal.privateChats.findUnique({
      where: { id: chatId },
      select: { senderId: true, receiverId: true },
    });

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.senderId !== userId && chat.receiverId !== userId) {
      throw new Error("Not authorized to react to this chat");
    }

    // Check if reaction already exists and remove it (toggle behavior)
    const existingReaction = await prismaGlobal.reactions.findFirst({
      where: {
        chatId,
        userId,
      },
    });

    if (existingReaction) {
      // Check if the emoji is the same - if so, just remove it (toggle off)
      if (existingReaction.emoji === emoji) {
        // Delete the existing reaction
        await prismaGlobal.reactions.delete({
          where: {
            id: existingReaction.id,
          },
        });

        // Also remove any related notifications
        await prismaGlobal.notifications.deleteMany({
          where: {
            reactionId: existingReaction.id,
          },
        });

        return { message: "Reaction removed", removed: true };
      }

      // If emoji is different, update the existing reaction
      const reaction = await prismaGlobal.reactions.update({
        where: {
          id: existingReaction.id,
        },
        data: {
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          chat: {
            select: {
              id: true,
              text: true,
            },
          },
        },
      });

      // Update notification for the reaction
      const notificationRecipientId =
        userId === chat.senderId ? chat.receiverId : chat.senderId;

      await prismaGlobal.notifications.updateMany({
        where: {
          reactionId: reaction.id,
        },
        data: {
          message: `reacted to your message with ${emoji}`,
        },
      });

      return reaction;
    }

    // Create reaction in reactions table with chatId
    const reaction = await prismaGlobal.reactions.create({
      data: {
        chatId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        chat: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });

    // Create notification for the reaction
    // Determine who should receive the notification:
    // - If sender reacts, receiver gets notified
    // - If receiver reacts, sender gets notified
    const notificationRecipientId =
      userId === chat.senderId ? chat.receiverId : chat.senderId;

    await prismaGlobal.notifications.create({
      data: {
        type: "REACTION",
        message: `reacted to your message with ${emoji}`,
        receiver: { connect: { id: notificationRecipientId } },
        sender: { connect: { id: userId } },
        chat: { connect: { id: chatId } },
        reaction: { connect: { id: reaction.id } },
      },
    });

    return reaction;
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      throw new Error("User has already reacted to this chat");
    }
    console.error(error);
    throw new Error(`Failed to add reaction: ${error.message}`);
  }
}

// Get reactions for a private chat
async function getChatReactions(chatId) {
  try {
    const reactions = await prismaGlobal.reactions.findMany({
      where: {
        chatId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return reactions;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get reactions: ${error.message}`);
  }
}

// Remove reaction from private chat
async function removeChatReaction(chatId, userId) {
  try {
    const reaction = await prismaGlobal.reactions.findFirst({
      where: {
        chatId,
        userId,
      },
    });

    if (!reaction) {
      throw new Error("Reaction not found");
    }

    // Delete the reaction
    await prismaGlobal.reactions.delete({
      where: { id: reaction.id },
    });

    // Also delete related notifications
    await prismaGlobal.notifications.deleteMany({
      where: { reactionId: reaction.id },
    });

    return { message: "Reaction removed successfully" };
  } catch (error) {
    console.error(error);
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error(`Failed to remove reaction: ${error.message}`);
  }
}

export { addChatReaction, getChatReactions, removeChatReaction };
