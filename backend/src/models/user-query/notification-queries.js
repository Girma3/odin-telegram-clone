import prismaGlobal from "../pool.js";

// ============= Private Chat Notifications =============

// Create notification for private message
async function createPrivateMessageNotification({
  senderId,
  receiverId,
  chatId,
}) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "MESSAGE",
        message: "sent you a message",
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        chat: { connect: { id: chatId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
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
    return notification;
  } catch (error) {
    console.error("Error creating private message notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// Create notification for private chat reaction
async function createPrivateReactionNotification({
  senderId,
  receiverId,
  chatId,
  reactionId,
  emoji,
}) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "REACTION",
        message: `reacted to your message with ${emoji}`,
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        chat: { connect: { id: chatId } },
        reaction: { connect: { id: reactionId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
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
        reaction: {
          select: {
            id: true,
            emoji: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating private reaction notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// Create notification for private chat comment
async function createPrivateCommentNotification({
  senderId,
  receiverId,
  chatId,
  commentId,
}) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "COMMENT",
        message: "commented on your message",
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        chat: { connect: { id: chatId } },
        comment: { connect: { id: commentId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
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
        comment: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating private comment notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// ============= Group Notifications =============

// Create notification for group post
async function createGroupPostNotification({ senderId, receiverId, postId }) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "MESSAGE",
        message: "posted in your group",
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        post: { connect: { id: postId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
            imgUrl: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating group post notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// Create notification for group comment
async function createGroupCommentNotification({
  senderId,
  receiverId,
  postId,
  commentId,
}) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "COMMENT",
        message: "commented on your post",
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        post: { connect: { id: postId } },
        comment: { connect: { id: commentId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
          },
        },
        comment: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating group comment notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// Create notification for group reaction
async function createGroupReactionNotification({
  senderId,
  receiverId,
  postId,
  reactionId,
  emoji,
}) {
  try {
    const notification = await prismaGlobal.notifications.create({
      data: {
        type: "REACTION",
        message: `reacted to your post with ${emoji}`,
        receiver: { connect: { id: receiverId } },
        sender: { connect: { id: senderId } },
        post: { connect: { id: postId } },
        reaction: { connect: { id: reactionId } },
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
          },
        },
        reaction: {
          select: {
            id: true,
            emoji: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error creating group reaction notification:", error);
    throw new Error(`Failed to create notification: ${error.message}`);
  }
}

// ============= General Notification Queries =============

// Mark notification as read
async function markNotificationAsRead(notificationId) {
  try {
    const notification = await prismaGlobal.notifications.update({
      where: { id: notificationId },
      data: { read: true },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });
    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw new Error(`Failed to mark notification as read: ${error.message}`);
  }
}

// Get all notifications for a user
async function getUserNotifications(userId) {
  try {
    const notifications = await prismaGlobal.notifications.findMany({
      where: {
        receiverId: userId,
      },
      include: {
        receiver: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        sender: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
            imgUrl: true,
          },
        },
        comment: {
          select: {
            id: true,
            text: true,
          },
        },
        reaction: {
          select: {
            id: true,
            emoji: true,
          },
        },
        chat: {
          select: {
            id: true,
            text: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw new Error(`Failed to get notifications: ${error.message}`);
  }
}

// Get unread notification count for a user
async function getUnreadNotificationCount(userId) {
  try {
    const count = await prismaGlobal.notifications.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
    return count;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    throw new Error(
      `Failed to get unread notification count: ${error.message}`,
    );
  }
}

// Delete notification by ID
async function deleteNotification(notificationId) {
  try {
    await prismaGlobal.notifications.delete({
      where: { id: notificationId },
    });
    return { message: "Notification deleted successfully" };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw new Error(`Failed to delete notification: ${error.message}`);
  }
}

// Delete all notifications for a user
async function deleteAllUserNotifications(userId) {
  try {
    await prismaGlobal.notifications.deleteMany({
      where: { receiverId: userId },
    });
    return { message: "All notifications deleted successfully" };
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw new Error(`Failed to delete notifications: ${error.message}`);
  }
}

export {
  // Private Chat
  createPrivateMessageNotification,
  createPrivateReactionNotification,
  createPrivateCommentNotification,
  // Group
  createGroupPostNotification,
  createGroupCommentNotification,
  createGroupReactionNotification,
  // General
  markNotificationAsRead,
  getUserNotifications,
  getUnreadNotificationCount,
  deleteNotification,
  deleteAllUserNotifications,
};
