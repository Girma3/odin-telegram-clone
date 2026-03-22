import * as groupUtils from "../../src/sockets/utils/group-room.js";
import {
  registerGroupHandler,
  joinGroupHandler,
  leaveGroupHandler,
  groupMessageHandler,
} from "../../src/sockets/handlers/group-event-handlers.js";

describe("WebSocket Group Event Handlers", () => {
  beforeEach(() => {
    jest.spyOn(groupUtils, "registerGroup").mockImplementation(() => {});
    jest.spyOn(groupUtils, "joinGroup").mockImplementation(() => {});
    jest.spyOn(groupUtils, "leaveGroup").mockImplementation(() => {});
    jest.spyOn(groupUtils, "broadcastToGroup").mockImplementation(() => {});

    if (global.crypto && typeof global.crypto.randomUUID === "function") {
      jest
        .spyOn(global.crypto, "randomUUID")
        .mockReturnValue("fixed-group-uuid");
    } else {
      global.crypto = {
        randomUUID: jest.fn().mockReturnValue("fixed-group-uuid"),
      };
    }
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("registerGroupHandler should call registerGroup with groupId", () => {
    const groupId = "group-1";
    registerGroupHandler({}, groupId, {});

    expect(groupUtils.registerGroup).toHaveBeenCalledTimes(1);
    expect(groupUtils.registerGroup).toHaveBeenCalledWith(groupId);
  });

  it("joinGroupHandler should call joinGroup with ws and groupId", () => {
    const groupId = "group-2";
    const ws = { userId: "alice" };
    joinGroupHandler(ws, groupId, {});

    expect(groupUtils.joinGroup).toHaveBeenCalledTimes(1);
    expect(groupUtils.joinGroup).toHaveBeenCalledWith(ws, groupId);
  });

  it("leaveGroupHandler should call leaveGroup with ws and groupId", () => {
    const groupId = "group-3";
    const ws = { userId: "bob" };
    leaveGroupHandler(ws, groupId, {});

    expect(groupUtils.leaveGroup).toHaveBeenCalledTimes(1);
    expect(groupUtils.leaveGroup).toHaveBeenCalledWith(ws, groupId);
  });

  it("groupMessageHandler should broadcast group message and send delivered event", () => {
    const ws = { userId: "sender", send: jest.fn(), readyState: 1 };
    const payload = { groupId: "group-4", text: "Hello group" };

    groupMessageHandler(ws, payload, {});

    expect(groupUtils.broadcastToGroup).toHaveBeenCalledTimes(1);
    expect(groupUtils.broadcastToGroup).toHaveBeenCalledWith(
      "group-4",
      "group_message",
      { text: "Hello group", messageId: "fixed-group-uuid" },
    );

    expect(ws.send).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledWith(
      JSON.stringify({
        type: "delivered",
        payload: { messageId: "fixed-group-uuid", to: "group-4" },
      }),
    );
  });

  it("groupMessageHandler should not throw when called with ws.send available", () => {
    const ws = { userId: "sender", send: jest.fn(), readyState: 1 };
    const payload = { groupId: "group-5", text: "Message" };

    expect(() => groupMessageHandler(ws, payload, {})).not.toThrow();
    expect(groupUtils.broadcastToGroup).toHaveBeenCalledTimes(1);
    expect(ws.send).toHaveBeenCalledTimes(1);
  });
});
