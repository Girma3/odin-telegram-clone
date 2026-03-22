// Mock WebSocket for testing
class MockWebSocket {
  constructor(userId) {
    this.userId = userId;
    this.OPEN = 1;
    this.readyState = this.OPEN;
    this.sentMessages = [];
  }

  send(data) {
    this.sentMessages.push(JSON.parse(data));
  }
}

// Mock wss (WebSocket Server)
class MockWSS {
  constructor(clients = []) {
    this.clients = clients;
  }
}

// Import the handlers after defining mocks
import {
  mentionNotificationHandler,
  replyNotificationHandler,
} from "../../src/sockets/handlers/notification-handler.js";
import {
  addNotification,
  getNotifications,
  clearNotifications,
} from "../../src/sockets/utils/notification.js";

describe("WebSocket Notification Handlers", () => {
  beforeEach(() => {
    // Clear all notifications before each test
    clearNotifications("mentionedUser");
    clearNotifications("originalSender");
    clearNotifications("offlineUser");
  });

  describe("mentionNotificationHandler", () => {
    it("should send mention notification directly when user is online", () => {
      // Setup
      const mentionedUser = new MockWebSocket("mentionedUser");
      const sender = new MockWebSocket("sender123");
      const wss = new MockWSS([mentionedUser, sender]);

      const payload = {
        messageId: "msg-123",
        mentionUserId: "mentionedUser",
        roomType: "group",
        roomId: "group-456",
      };

      // Execute
      mentionNotificationHandler(sender, payload, wss);

      // Verify
      expect(mentionedUser.sentMessages.length).toBe(1);
      const sentData = mentionedUser.sentMessages[0];
      expect(sentData.type).toBe("mention_notification");
      expect(sentData.payload.messageId).toBe("msg-123");
      expect(sentData.payload.roomType).toBe("group");
      expect(sentData.payload.roomId).toBe("group-456");
    });

    it("should store notification when mentioned user is offline", () => {
      // Setup - no clients for the mentioned user
      const sender = new MockWebSocket("sender123");
      const otherUser = new MockWebSocket("otherUser");
      const wss = new MockWSS([sender, otherUser]);

      const payload = {
        messageId: "msg-123",
        mentionUserId: "offlineUser",
        roomType: "private",
        roomId: "private-789",
      };

      // Execute
      mentionNotificationHandler(sender, payload, wss);

      // Verify - notification should be stored
      const notifications = getNotifications("offlineUser");
      expect(notifications.length).toBe(1);
      expect(notifications[0]).toBe("msg-123");
    });

    it("should not send notification to wrong user", () => {
      // Setup
      const wrongUser = new MockWebSocket("wrongUser");
      const sender = new MockWebSocket("sender123");
      const wss = new MockWSS([wrongUser, sender]);

      const payload = {
        messageId: "msg-123",
        mentionUserId: "correctUser",
        roomType: "group",
        roomId: "group-456",
      };

      // Execute
      mentionNotificationHandler(sender, payload, wss);

      // Verify - wrongUser should not receive any message
      expect(wrongUser.sentMessages.length).toBe(0);
    });

    it("should handle empty clients array", () => {
      // Setup
      const sender = new MockWebSocket("sender123");
      const wss = new MockWSS([]);

      const payload = {
        messageId: "msg-123",
        mentionUserId: "offlineUser",
        roomType: "group",
        roomId: "group-456",
      };

      // Execute - should not throw
      expect(() => {
        mentionNotificationHandler(sender, payload, wss);
      }).not.toThrow();
    });
  });

  describe("replyNotificationHandler", () => {
    it("should send reply notification directly when user is online", () => {
      // Setup
      const originalSender = new MockWebSocket("originalSender");
      const replier = new MockWebSocket("replier123");
      const wss = new MockWSS([originalSender, replier]);

      const payload = {
        messageId: "reply-msg-456",
        originalSenderId: "originalSender",
        roomType: "private",
        roomId: "private-789",
      };

      // Execute
      replyNotificationHandler(replier, payload, wss);

      // Verify
      expect(originalSender.sentMessages.length).toBe(1);
      const sentData = originalSender.sentMessages[0];
      expect(sentData.type).toBe("reply_notification");
      expect(sentData.payload.messageId).toBe("reply-msg-456");
      expect(sentData.payload.roomType).toBe("private");
      expect(sentData.payload.roomId).toBe("private-789");
      expect(sentData.payload.by).toBe("replier123");
    });

    it("should store notification when original sender is offline", () => {
      // Setup - no clients for the original sender
      const replier = new MockWebSocket("replier123");
      const otherUser = new MockWebSocket("otherUser");
      const wss = new MockWSS([replier, otherUser]);

      const payload = {
        messageId: "reply-msg-456",
        originalSenderId: "offlineSender",
        roomType: "group",
        roomId: "group-999",
      };

      // Execute
      replyNotificationHandler(replier, payload, wss);

      // Verify - notification should be stored
      const notifications = getNotifications("offlineSender");
      expect(notifications.length).toBe(1);
      expect(notifications[0]).toBe("reply-msg-456");
    });

    it("should include replier userId in the notification", () => {
      // Setup
      const originalSender = new MockWebSocket("originalSender");
      const replier = new MockWebSocket("replier456");
      const wss = new MockWSS([originalSender, replier]);

      const payload = {
        messageId: "reply-msg-789",
        originalSenderId: "originalSender",
        roomType: "private",
        roomId: "private-111",
      };

      // Execute
      replyNotificationHandler(replier, payload, wss);

      // Verify - the by field should contain replier's userId
      const sentData = originalSender.sentMessages[0];
      expect(sentData.payload.by).toBe("replier456");
    });

    it("should not send notification to wrong user", () => {
      // Setup
      const wrongUser = new MockWebSocket("wrongUser");
      const replier = new MockWebSocket("replier123");
      const wss = new MockWSS([wrongUser, replier]);

      const payload = {
        messageId: "reply-msg-456",
        originalSenderId: "correctSender",
        roomType: "private",
        roomId: "private-789",
      };

      // Execute
      replyNotificationHandler(replier, payload, wss);

      // Verify - wrongUser should not receive any message
      expect(wrongUser.sentMessages.length).toBe(0);
    });
  });

  describe("Notification Storage", () => {
    it("should accumulate multiple notifications for same user", () => {
      // Setup
      const sender = new MockWebSocket("sender123");
      const wss = new MockWSS([sender]); // mentioned user is offline

      // First mention
      const payload1 = {
        messageId: "msg-1",
        mentionUserId: "offlineUser",
        roomType: "group",
        roomId: "group-1",
      };
      console.log("Sending first mention notification");
      mentionNotificationHandler(sender, payload1, wss);

      // Second mention
      const payload2 = {
        messageId: "msg-2",
        mentionUserId: "offlineUser",
        roomType: "group",
        roomId: "group-2",
      };
      console.log("Sending second mention notification");
      mentionNotificationHandler(sender, payload2, wss);

      // Verify
      const notifications = getNotifications("offlineUser");
      expect(notifications.length).toBe(2);
    });

    it("should handle notifications for different users independently", () => {
      // Setup
      const sender = new MockWebSocket("sender123");
      const wss = new MockWSS([sender]); // both users are offline

      // Send notification to user1
      const payload1 = {
        messageId: "msg-1",
        mentionUserId: "user1",
        roomType: "group",
        roomId: "group-1",
      };
      mentionNotificationHandler(sender, payload1, wss);

      // Send notification to user2
      const payload2 = {
        messageId: "msg-2",
        mentionUserId: "user2",
        roomType: "group",
        roomId: "group-2",
      };
      mentionNotificationHandler(sender, payload2, wss);

      // Verify
      expect(getNotifications("user1").length).toBe(1);
      expect(getNotifications("user2").length).toBe(1);
      expect(getNotifications("user3").length).toBe(0);
    });
  });
});
