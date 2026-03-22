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
  userOnlineHandler,
  userOfflineHandler,
} from "../../src/sockets/handlers/presence-handler.js";
import {
  setUserOnline,
  setUserOffline,
  isOnline,
  getOnlineUsers,
} from "../../src/sockets/utils/presence.js";

describe("WebSocket Presence Handlers", () => {
  beforeEach(() => {
    // Clear the online users map before each test
    // Since we can't directly access the Map, we'll use the utility functions
    // to ensure clean state. We'll need to track users and clean them up.
  });

  afterEach(() => {
    // Clean up any users that were set online during tests
    const onlineUsers = getOnlineUsers();
    onlineUsers.forEach((userId) => {
      setUserOffline(userId);
    });
  });

  describe("userOnlineHandler", () => {
    it("should set user online and broadcast to all connected clients", () => {
      // Setup
      const userId = "user123";
      const ws = new MockWebSocket(userId);
      const client1 = new MockWebSocket("client1");
      const client2 = new MockWebSocket("client2");
      const wss = new MockWSS([ws, client1, client2]);

      const payload = { userId };

      // Execute
      userOnlineHandler(ws, payload, wss);

      // Verify user is set online
      expect(isOnline(userId)).toBe(true);
      expect(ws.userId).toBe(userId);

      // Verify broadcast to all clients
      expect(client1.sentMessages.length).toBe(1);
      expect(client2.sentMessages.length).toBe(1);

      const sentData1 = client1.sentMessages[0];
      const sentData2 = client2.sentMessages[0];

      expect(sentData1.type).toBe("user_online");
      expect(sentData1.payload.userId).toBe(userId);
      expect(sentData2.type).toBe("user_online");
      expect(sentData2.payload.userId).toBe(userId);
    });

    it("should only broadcast to clients with readyState OPEN", () => {
      // Setup
      const userId = "user123";
      const ws = new MockWebSocket(userId);
      const readyClient = new MockWebSocket("readyClient");
      const closedClient = new MockWebSocket("closedClient");
      closedClient.readyState = 3; // CLOSED state

      const wss = new MockWSS([ws, readyClient, closedClient]);

      const payload = { userId };

      // Execute
      userOnlineHandler(ws, payload, wss);

      // Verify broadcast only to ready client
      expect(readyClient.sentMessages.length).toBe(1);
      expect(closedClient.sentMessages.length).toBe(0);

      const sentData = readyClient.sentMessages[0];
      expect(sentData.type).toBe("user_online");
      expect(sentData.payload.userId).toBe(userId);
    });

    it("should handle empty client list", () => {
      // Setup
      const userId = "user123";
      const ws = new MockWebSocket(userId);
      const wss = new MockWSS([]); // No clients

      const payload = { userId };

      // Execute - should not throw error
      expect(() => {
        userOnlineHandler(ws, payload, wss);
      }).not.toThrow();

      // Verify user is still set online
      expect(isOnline(userId)).toBe(true);
      expect(ws.userId).toBe(userId);
    });
  });

  describe("userOfflineHandler", () => {
    it("should set user offline and broadcast to all connected clients", () => {
      // Setup - first set user online
      const userId = "user123";
      setUserOnline(userId, new MockWebSocket(userId));

      const ws = new MockWebSocket(userId);
      const client1 = new MockWebSocket("client1");
      const client2 = new MockWebSocket("client2");
      const wss = new MockWSS([ws, client1, client2]);

      const payload = { userId };

      // Execute
      userOfflineHandler(ws, payload, wss);

      // Verify user is set offline
      expect(isOnline(userId)).toBe(false);

      // Verify broadcast to all clients
      expect(client1.sentMessages.length).toBe(1);
      expect(client2.sentMessages.length).toBe(1);

      const sentData1 = client1.sentMessages[0];
      const sentData2 = client2.sentMessages[0];

      expect(sentData1.type).toBe("user_offline");
      expect(sentData1.payload.userId).toBe(userId);
      expect(sentData2.type).toBe("user_offline");
      expect(sentData2.payload.userId).toBe(userId);
    });

    it("should only broadcast to clients with readyState OPEN", () => {
      // Setup - first set user online
      const userId = "user123";
      setUserOnline(userId, new MockWebSocket(userId));

      const ws = new MockWebSocket(userId);
      const readyClient = new MockWebSocket("readyClient");
      const closedClient = new MockWebSocket("closedClient");
      closedClient.readyState = 3; // CLOSED state

      const wss = new MockWSS([ws, readyClient, closedClient]);

      const payload = { userId };

      // Execute
      userOfflineHandler(ws, payload, wss);

      // Verify broadcast only to ready client
      expect(readyClient.sentMessages.length).toBe(1);
      expect(closedClient.sentMessages.length).toBe(0);

      const sentData = readyClient.sentMessages[0];
      expect(sentData.type).toBe("user_offline");
      expect(sentData.payload.userId).toBe(userId);
    });

    it("should handle setting offline a user that was not online", () => {
      // Setup
      const userId = "user123";
      const ws = new MockWebSocket(userId);
      const client1 = new MockWebSocket("client1");
      const wss = new MockWSS([ws, client1]);

      const payload = { userId };

      // Execute - should not throw error
      expect(() => {
        userOfflineHandler(ws, payload, wss);
      }).not.toThrow();

      // Verify user is still offline
      expect(isOnline(userId)).toBe(false);

      // Verify broadcast still happens
      expect(client1.sentMessages.length).toBe(1);
      const sentData = client1.sentMessages[0];
      expect(sentData.type).toBe("user_offline");
      expect(sentData.payload.userId).toBe(userId);
    });

    it("should handle empty client list", () => {
      // Setup - first set user online
      const userId = "user123";
      setUserOnline(userId, new MockWebSocket(userId));

      const ws = new MockWebSocket(userId);
      const wss = new MockWSS([]); // No clients

      const payload = { userId };

      // Execute - should not throw error
      expect(() => {
        userOfflineHandler(ws, payload, wss);
      }).not.toThrow();

      // Verify user is set offline
      expect(isOnline(userId)).toBe(false);
    });
  });

  describe("integration with presence utils", () => {
    it("should correctly track multiple users online/offline", () => {
      // Setup
      const user1 = "user1";
      const user2 = "user2";
      const ws1 = new MockWebSocket(user1);
      const ws2 = new MockWebSocket(user2);
      const wss = new MockWSS([ws1, ws2]);

      // Set both users online
      userOnlineHandler(ws1, { userId: user1 }, wss);
      userOnlineHandler(ws2, { userId: user2 }, wss);

      // Verify both are online
      expect(isOnline(user1)).toBe(true);
      expect(isOnline(user2)).toBe(true);
      expect(getOnlineUsers()).toContain(user1);
      expect(getOnlineUsers()).toContain(user2);

      // Set user1 offline
      userOfflineHandler(ws1, { userId: user1 }, wss);

      // Verify user1 is offline, user2 is still online
      expect(isOnline(user1)).toBe(false);
      expect(isOnline(user2)).toBe(true);
      expect(getOnlineUsers()).not.toContain(user1);
      expect(getOnlineUsers()).toContain(user2);
    });
  });
});
