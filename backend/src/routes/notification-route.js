import { Router } from "express";

import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAsRead,
} from "../controllers/notification-controller.js";

import { isUserAuthenticated } from "../controllers/auth-controller.js";

const notificationRouter = Router({ mergeParams: true });

// Apply authentication to all routes
notificationRouter.use(isUserAuthenticated);

// Get all notifications for current user
notificationRouter.get("/", getNotificationsHandler);

// Get unread notification count
notificationRouter.get("/unread", getUnreadCountHandler);

// Mark notification as read
notificationRouter.put("/:notificationId/read", markAsRead);

export default notificationRouter;
