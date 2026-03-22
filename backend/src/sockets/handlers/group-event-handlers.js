// group events handlers
import {
  registerGroup,
  joinGroup,
  leaveGroup,
  broadcastToGroup,
} from "../utils/group-room.js";
function registerGroupHandler(ws, groupId, wss) {
  registerGroup(groupId);
}

function joinGroupHandler(ws, groupId, wss) {
  joinGroup(ws, groupId);
}

function leaveGroupHandler(ws, groupId, wss) {
  leaveGroup(ws, groupId);
}

function groupMessageHandler(ws, payload, wss) {
  const { groupId, text } = payload;
  const messageId = crypto.randomUUID();
  broadcastToGroup(groupId, "group_message", { text, messageId });
  //notify sender that message was sent
  ws.send(
    JSON.stringify({
      type: "delivered",
      payload: { messageId, to: groupId },
    }),
  );
}
export {
  registerGroupHandler,
  joinGroupHandler,
  leaveGroupHandler,
  groupMessageHandler,
};
