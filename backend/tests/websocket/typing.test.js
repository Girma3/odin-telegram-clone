import * as privateRoom from "../../src/sockets/utils/private-room.js";
import * as groupRoom from "../../src/sockets/utils/group-room.js";
import {
  typingInGroupHandler,
  typingInPrivateRoomHandler,
} from "../../src/sockets/handlers/typing-handler.js";

describe("WebSocket Typing Handlers", () => {
  beforeEach(() => {
    jest.spyOn(groupRoom, "broadcastToGroup").mockImplementation(() => {});
    jest
      .spyOn(privateRoom, "broadCastToPrivateRoom")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should broadcast typing event to group", () => {
    const ws = { userId: "alice" };
    const payload = { groupId: "group123", user: "alice" };
    const wss = { clients: [] };

    typingInGroupHandler(ws, payload, wss);

    expect(groupRoom.broadcastToGroup).toHaveBeenCalledTimes(1);
    expect(groupRoom.broadcastToGroup).toHaveBeenCalledWith(
      "group123",
      "typing",
      { user: "alice" },
    );
    expect(privateRoom.broadCastToPrivateRoom).not.toHaveBeenCalled();
  });

  it("should broadcast typing event to private room", () => {
    const ws = { userId: "bob" };
    const payload = { roomId: "roomABC", user: "bob" };
    const wss = { clients: [] };

    typingInPrivateRoomHandler(ws, payload, wss);

    expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledTimes(1);
    expect(privateRoom.broadCastToPrivateRoom).toHaveBeenCalledWith(
      "roomABC",
      "typing",
      { user: "bob" },
    );
    expect(groupRoom.broadcastToGroup).not.toHaveBeenCalled();
  });

  it("should not throw when called linearly without wss state", () => {
    expect(() => {
      typingInGroupHandler({}, { groupId: "x", user: "u" }, {});
      typingInPrivateRoomHandler({}, { roomId: "x", user: "u" }, {});
    }).not.toThrow();
  });
});
