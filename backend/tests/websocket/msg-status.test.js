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
  privateMessageSeenHandler,
  groupMessageSeenHandler,
} from "../../src/sockets/handlers/msg-seen-status.handler.js";

describe("WebSocket Message Seen Status Handlers", () => {
  describe("privateMessageSeenHandler", () => {
    it("should notify the original sender when private message is seen", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const senderWs = new MockWebSocket(senderId);
      const seerWs = new MockWebSocket(seerId);
      const otherWs = new MockWebSocket("other789");

      const wss = new MockWSS([senderWs, seerWs, otherWs]);

      const payload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute
      privateMessageSeenHandler(seerWs, payload, wss);

      // Verify only sender receives the notification
      expect(senderWs.sentMessages.length).toBe(1);
      expect(seerWs.sentMessages.length).toBe(0);
      expect(otherWs.sentMessages.length).toBe(0);

      const sentData = senderWs.sentMessages[0];
      expect(sentData.type).toBe("seen");
      expect(sentData.payload.messageId).toBe(messageId);
      expect(sentData.payload.by).toBe(seerId);
    });

    it("should only notify ready clients", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const readySenderWs = new MockWebSocket(senderId);
      const closedSenderWs = new MockWebSocket(senderId);
      closedSenderWs.readyState = 3; // CLOSED state
      const seerWs = new MockWebSocket(seerId);

      const wss = new MockWSS([readySenderWs, closedSenderWs, seerWs]);

      const payload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute
      privateMessageSeenHandler(seerWs, payload, wss);

      // Verify only ready sender receives the notification
      expect(readySenderWs.sentMessages.length).toBe(1);
      expect(closedSenderWs.sentMessages.length).toBe(0);
      expect(seerWs.sentMessages.length).toBe(0);
    });

    it("should handle multiple clients with same userId", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const senderWs1 = new MockWebSocket(senderId);
      const senderWs2 = new MockWebSocket(senderId);
      const seerWs = new MockWebSocket(seerId);

      const wss = new MockWSS([senderWs1, senderWs2, seerWs]);

      const payload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute
      privateMessageSeenHandler(seerWs, payload, wss);

      // Verify all sender clients receive the notification
      expect(senderWs1.sentMessages.length).toBe(1);
      expect(senderWs2.sentMessages.length).toBe(1);
      expect(seerWs.sentMessages.length).toBe(0);

      const sentData1 = senderWs1.sentMessages[0];
      const sentData2 = senderWs2.sentMessages[0];

      expect(sentData1.type).toBe("seen");
      expect(sentData1.payload.messageId).toBe(messageId);
      expect(sentData1.payload.by).toBe(seerId);
      expect(sentData2.type).toBe("seen");
      expect(sentData2.payload.messageId).toBe(messageId);
      expect(sentData2.payload.by).toBe(seerId);
    });

    it("should not notify anyone if sender is not online", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const seerWs = new MockWebSocket(seerId);
      const otherWs = new MockWebSocket("other789");

      const wss = new MockWSS([seerWs, otherWs]); // No sender online

      const payload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute
      privateMessageSeenHandler(seerWs, payload, wss);

      // Verify no notifications sent
      expect(seerWs.sentMessages.length).toBe(0);
      expect(otherWs.sentMessages.length).toBe(0);
    });

    it("should handle empty client list", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const seerWs = new MockWebSocket(seerId);
      const wss = new MockWSS([]); // No clients

      const payload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute - should not throw error
      expect(() => {
        privateMessageSeenHandler(seerWs, payload, wss);
      }).not.toThrow();
    });
  });

  describe("groupMessageSeenHandler", () => {
    it("should notify the original sender when group message is seen", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";
      const groupId = "group-101";

      const senderWs = new MockWebSocket(senderId);
      const seerWs = new MockWebSocket(seerId);
      const otherWs = new MockWebSocket("other789");

      const wss = new MockWSS([senderWs, seerWs, otherWs]);

      const payload = {
        messageId,
        groupId,
        fromUserId: senderId,
      };

      // Execute
      groupMessageSeenHandler(seerWs, payload, wss);

      // Verify only sender receives the notification
      expect(senderWs.sentMessages.length).toBe(1);
      expect(seerWs.sentMessages.length).toBe(0);
      expect(otherWs.sentMessages.length).toBe(0);

      const sentData = senderWs.sentMessages[0];
      expect(sentData.type).toBe("seen");
      expect(sentData.payload.messageId).toBe(messageId);
      expect(sentData.payload.by).toBe(seerId);
      expect(sentData.payload.groupId).toBe(groupId);
    });

    it("should only notify ready clients", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";
      const groupId = "group-101";

      const readySenderWs = new MockWebSocket(senderId);
      const closedSenderWs = new MockWebSocket(senderId);
      closedSenderWs.readyState = 3; // CLOSED state
      const seerWs = new MockWebSocket(seerId);

      const wss = new MockWSS([readySenderWs, closedSenderWs, seerWs]);

      const payload = {
        messageId,
        groupId,
        fromUserId: senderId,
      };

      // Execute
      groupMessageSeenHandler(seerWs, payload, wss);

      // Verify only ready sender receives the notification
      expect(readySenderWs.sentMessages.length).toBe(1);
      expect(closedSenderWs.sentMessages.length).toBe(0);
      expect(seerWs.sentMessages.length).toBe(0);
    });

    it("should handle multiple clients with same userId", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";
      const groupId = "group-101";

      const senderWs1 = new MockWebSocket(senderId);
      const senderWs2 = new MockWebSocket(senderId);
      const seerWs = new MockWebSocket(seerId);

      const wss = new MockWSS([senderWs1, senderWs2, seerWs]);

      const payload = {
        messageId,
        groupId,
        fromUserId: senderId,
      };

      // Execute
      groupMessageSeenHandler(seerWs, payload, wss);

      // Verify all sender clients receive the notification
      expect(senderWs1.sentMessages.length).toBe(1);
      expect(senderWs2.sentMessages.length).toBe(1);
      expect(seerWs.sentMessages.length).toBe(0);

      const sentData1 = senderWs1.sentMessages[0];
      const sentData2 = senderWs2.sentMessages[0];

      expect(sentData1.type).toBe("seen");
      expect(sentData1.payload.messageId).toBe(messageId);
      expect(sentData1.payload.by).toBe(seerId);
      expect(sentData1.payload.groupId).toBe(groupId);
      expect(sentData2.type).toBe("seen");
      expect(sentData2.payload.messageId).toBe(messageId);
      expect(sentData2.payload.by).toBe(seerId);
      expect(sentData2.payload.groupId).toBe(groupId);
    });

    it("should not notify anyone if sender is not online", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";
      const groupId = "group-101";

      const seerWs = new MockWebSocket(seerId);
      const otherWs = new MockWebSocket("other789");

      const wss = new MockWSS([seerWs, otherWs]); // No sender online

      const payload = {
        messageId,
        groupId,
        fromUserId: senderId,
      };

      // Execute
      groupMessageSeenHandler(seerWs, payload, wss);

      // Verify no notifications sent
      expect(seerWs.sentMessages.length).toBe(0);
      expect(otherWs.sentMessages.length).toBe(0);
    });

    it("should handle empty client list", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";
      const groupId = "group-101";

      const seerWs = new MockWebSocket(seerId);
      const wss = new MockWSS([]); // No clients

      const payload = {
        messageId,
        groupId,
        fromUserId: senderId,
      };

      // Execute - should not throw error
      expect(() => {
        groupMessageSeenHandler(seerWs, payload, wss);
      }).not.toThrow();
    });
  });

  describe("payload validation", () => {
    it("should handle missing optional fields gracefully", () => {
      // Setup
      const senderId = "sender123";
      const seerId = "seer456";
      const messageId = "msg-789";

      const senderWs = new MockWebSocket(senderId);
      const seerWs = new MockWebSocket(seerId);

      const wss = new MockWSS([senderWs, seerWs]);

      // Test with minimal payload for private message
      const privatePayload = {
        messageId,
        fromUserId: senderId,
      };

      // Execute
      privateMessageSeenHandler(seerWs, privatePayload, wss);

      // Verify notification sent
      expect(senderWs.sentMessages.length).toBe(1);
      const sentData = senderWs.sentMessages[0];
      expect(sentData.type).toBe("seen");
      expect(sentData.payload.messageId).toBe(messageId);
      expect(sentData.payload.by).toBe(seerId);
    });
  });
});
