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

class MockRoomHelper {
  constructor() {
    this.calls = [];
  }

  broadcastToRoom(roomId, type, payload) {
    this.calls.push({ roomId, type, payload });
  }

  clear() {
    this.calls = [];
  }
}

// We'll stub the modules imported in handler with jest.mock
import * as privateRoom from "../../src/sockets/utils/private-room.js";
import * as groupRoom from "../../src/sockets/utils/group-room.js";
import {
  addReactionHandler,
  removeReactionHandler,
} from "../../src/sockets/handlers/reaction-handler.js";

describe("WebSocket Reaction Handlers", () => {
  beforeEach(() => {
    jest
      .spyOn(privateRoom, "broadCastToPrivateRoom")
      .mockImplementation(() => {});
    jest.spyOn(groupRoom, "broadcastToGroup").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("addReactionHandler", () => {
    it("should broadcast private reaction to private room helper", () => {
      const ws = new MockWebSocket("u1");
      const wss = { clients: [] };
      const payload = {
        messageId: "m1",
        reaction: "👍",
        roomType: "private",
        roomId: "roomA",
      };

      addReactionHandler(ws, payload, wss);

      expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledTimes(1);
      expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledWith(
        "roomA",
        "private_reaction",
        { messageId: "m1", reaction: "👍" },
      );
      expect(groupRoom.broadcastToGroup).not.toHaveBeenCalled();
    });

    it("should broadcast group reaction to group helper", () => {
      const ws = new MockWebSocket("u1");
      const wss = { clients: [] };
      const payload = {
        messageId: "m2",
        reaction: "❤️",
        roomType: "group",
        roomId: "group123",
      };

      addReactionHandler(ws, payload, wss);

      expect(groupRoom.broadcastToGroup).toHaveBeenCalledTimes(1);
      expect(groupRoom.broadcastToGroup).toHaveBeenCalledWith(
        "group123",
        "group_reaction",
        { messageId: "m2", reaction: "❤️" },
      );
      expect(privateRoom.broadCastToPrivateRoom).not.toHaveBeenCalled();
    });

    it("should gracefully handle invalid roomType", () => {
      const ws = new MockWebSocket("u1");
      const wss = { clients: [] };
      const payload = {
        messageId: "m3",
        reaction: "😂",
        roomType: "unknown",
        roomId: "unknown-room",
      };

      expect(() => addReactionHandler(ws, payload, wss)).not.toThrow();
      expect(groupRoom.broadcastToGroup).toHaveBeenCalledTimes(1);
      expect(privateRoom.broadCastToPrivateRoom).not.toHaveBeenCalled();
    });
  });

  describe("removeReactionHandler", () => {
    it("should broadcast private reaction removal to private room helper", () => {
      const ws = new MockWebSocket("u2");
      const wss = { clients: [] };
      const payload = {
        messageId: "m4",
        reaction: "😮",
        roomType: "private",
        roomId: "roomB",
      };

      removeReactionHandler(ws, payload, wss);

      expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledTimes(1);
      expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledWith(
        "roomB",
        "private_reaction",
        { messageId: "m4", reaction: "😮" },
      );
      expect(groupRoom.broadcastToGroup).not.toHaveBeenCalled();
    });

    it("should broadcast group reaction removal to group helper", () => {
      const ws = new MockWebSocket("u2");
      const wss = { clients: [] };
      const payload = {
        messageId: "m5",
        reaction: "😢",
        roomType: "group",
        roomId: "group456",
      };

      removeReactionHandler(ws, payload, wss);

      expect(groupRoom.broadcastToGroup).toHaveBeenCalledTimes(1);
      expect(groupRoom.broadcastToGroup).toHaveBeenCalledWith(
        "group456",
        "group_reaction",
        { messageId: "m5", reaction: "😢" },
      );
      expect(privateRoom.broadCastToPrivateRoom).not.toHaveBeenCalled();
    });

    it("should gracefully handle invalid roomType", () => {
      const ws = new MockWebSocket("u2");
      const wss = { clients: [] };
      const payload = {
        messageId: "m6",
        reaction: "😎",
        roomType: "alien",
        roomId: "extra-room",
      };

      expect(() => removeReactionHandler(ws, payload, wss)).not.toThrow();
      expect(groupRoom.broadcastToGroup).toHaveBeenCalledTimes(1);
      expect(privateRoom.broadCastToPrivateRoom).not.toHaveBeenCalled();
    });
  });
});
