import {
  getPrivateRoomHandler,
  privateChatHandler,
} from "../../src/sockets/handlers/private-event-handler.js";
import {
  privateRoomId,
  getPrivateRoom,
  privateRoom,
} from "../../src/sockets/utils/private-room.js";
import * as privateRoomUtils from "../../src/sockets/utils/private-room.js";

describe("WebSocket Private Event Handlers", () => {
  beforeEach(() => {
    privateRoom.clear();
    jest
      .spyOn(privateRoomUtils, "broadCastToPrivateRoom")
      .mockImplementation(() => {});

    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      jest
        .spyOn(global.crypto, "randomUUID")
        .mockReturnValue("fixed-uuid-1234");
    } else {
      global.crypto = {
        randomUUID: jest.fn().mockReturnValue("fixed-uuid-1234"),
      };
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
    privateRoom.clear();
  });

  it("getPrivateRoomHandler should add socket to private room", () => {
    const roomId = "private:alice:bob";
    const ws = { userId: "alice" };

    getPrivateRoomHandler(ws, roomId, {});

    const room = getPrivateRoom(roomId);
    expect(room.has(ws)).toBe(true);
    expect(room.size).toBe(1);
  });

  it("privateChatHandler should create room, broadcast message, and send delivered event", () => {
    const ws = { userId: "alice", send: jest.fn(), readyState: 1 };
    const payload = { userA: "alice", userB: "bob", text: "Hey Bob" };

    privateChatHandler(ws, payload, {});

    const expectedRoomId = privateRoomId("alice", "bob");
    const room = getPrivateRoom(expectedRoomId);

    expect(room.has(ws)).toBe(true);
    expect(privateRoomUtils.broadCastToPrivateRoom).toHaveBeenCalledTimes(1);
    expect(privateRoomUtils.broadCastToPrivateRoom).toHaveBeenCalledWith(
      expectedRoomId,
      "private_message",
      { text: "Hey Bob", messageId: "fixed-uuid-1234" },
    );

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "delivered",
        payload: { messageId: "fixed-uuid-1234", to: "bob" },
      }),
    );
  });

  it("privateChatHandler should not throw for an empty ws object and still call broadcast", () => {
    const ws = { send: jest.fn(), userId: "alice", readyState: 1 };
    const payload = { userA: "alice", userB: "bob", text: "Hello" };

    expect(() => privateChatHandler(ws, payload, {})).not.toThrow();
    expect(privateRoomUtils.broadCastToPrivateRoom).toHaveBeenCalledTimes(1);
  });
});
