import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
} from "../services/notification-service.js";

// Get all notifications for current user
async function getNotificationsHandler(req, res) {
  const userId = req.user.id;

  try {
    const notifications = await getNotifications(userId);
    return res.json(notifications);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get notifications: ${error.message}` });
  }
}

// Get unread notification count for current user
async function getUnreadCountHandler(req, res) {
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

// Mark notification as read
async function markAsRead(req, res) {
  const { notificationId } = req.params;
  const userId = req.user.id;

  try {
    const notification = await markNotificationRead(notificationId);

    // Verify the notification belongs to the user
    if (notification.receiverId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    return res.json(notification);
  } catch (error) {
    console.error(error);
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: "Notification not found" });
    }
    return res.status(500).json({
      message: `Failed to mark notification as read: ${error.message}`,
    });
  }
}

export { getNotificationsHandler, getUnreadCountHandler, markAsRead };
