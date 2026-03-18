// Notification Service
// This service layer provides a clean interface for creating and managing notifications
// It uses notification-queries.js for database operations

import {
  // Private Chat Notifications
  createPrivateMessageNotification,
  createPrivateReactionNotification,
  createPrivateCommentNotification,
  // Group Notifications
  createGroupPostNotification,
  createGroupCommentNotification,
  createGroupReactionNotification,
  // General
  markNotificationAsRead,
  getUserNotifications as fetchUserNotifications,
  getUnreadNotificationCount as fetchUnreadCount,
} from "../models/user-query/notification-queries.js";

// ============= Private Chat Notifications =============

// Notify about a private message
async function notifyPrivateMessage({ senderId, receiverId, chatId }) {
  return await createPrivateMessageNotification({
    senderId,
    receiverId,
    chatId,
  });
}

// Notify about a private chat reaction
async function notifyPrivateReaction({
  senderId,
  receiverId,
  chatId,
  reactionId,
  emoji,
}) {
  return await createPrivateReactionNotification({
    senderId,
    receiverId,
    chatId,
    reactionId,
    emoji,
  });
}

// Notify about a private chat comment
async function notifyPrivateComment({
  senderId,
  receiverId,
  chatId,
  commentId,
}) {
  return await createPrivateCommentNotification({
    senderId,
    receiverId,
    chatId,
    commentId,
  });
}

// ============= Group Notifications =============

// Notify about a group post
async function notifyGroupPost({ senderId, receiverId, postId }) {
  return await createGroupPostNotification({
    senderId,
    receiverId,
    postId,
  });
}

// Notify about a group comment
async function notifyGroupComment({ senderId, receiverId, postId, commentId }) {
  return await createGroupCommentNotification({
    senderId,
    receiverId,
    postId,
    commentId,
  });
}

// Notify about a group reaction
async function notifyGroupReaction({
  senderId,
  receiverId,
  postId,
  reactionId,
  emoji,
}) {
  return await createGroupReactionNotification({
    senderId,
    receiverId,
    postId,
    reactionId,
    emoji,
  });
}

// ============= General Notification Functions =============

// Mark a notification as read
async function markNotificationRead(notificationId) {
  return await markNotificationAsRead(notificationId);
}

// Get all notifications for a user
async function getNotifications(userId) {
  return await fetchUserNotifications(userId);
}

// Get unread notification count for a user
async function getUnreadCount(userId) {
  return await fetchUnreadCount(userId);
}

export {
  // Private Chat
  notifyPrivateMessage,
  notifyPrivateReaction,
  notifyPrivateComment,
  // Group
  notifyGroupPost,
  notifyGroupComment,
  notifyGroupReaction,
  // General
  markNotificationRead,
  getNotifications,
  getUnreadCount,
};
