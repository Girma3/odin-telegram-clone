import { broadCastToPrivateRoom } from "../utils/private-room.js";
import { broadcastToGroup } from "../utils/group-room.js";
function addReactionHandler(ws, payload, wss) {
  const { messageId, reaction, roomType, roomId } = payload;
  //broadcast to correct type room
  let eventPayload = { messageId, reaction };
  if (roomType === "private") {
    broadCastToPrivateRoom(roomId, "private_reaction", eventPayload);
  } else {
    broadcastToGroup(roomId, "group_reaction", eventPayload);
  }
}

function removeReactionHandler(ws, payload, wss) {
  const { messageId, reaction, roomType, roomId } = payload;
  //broadcast to correct type room
  let eventPayload = { messageId, reaction };
  if (roomType === "private") {
    broadCastToPrivateRoom(roomId, "private_reaction", eventPayload);
  } else {
    broadcastToGroup(roomId, "group_reaction", eventPayload);
  }
}
export { addReactionHandler, removeReactionHandler };
