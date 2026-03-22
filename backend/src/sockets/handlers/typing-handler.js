import { broadCastToPrivateRoom } from "../utils/private-room.js";
import { broadcastToGroup } from "../utils/group-room.js";
function typingInGroupHandler(ws, payload, wss) {
  const { groupId, user } = payload;
  broadcastToGroup(groupId, "typing", { user });
}
function typingInPrivateRoomHandler(ws, payload, wss) {
  const { roomId, user } = payload;
  broadCastToPrivateRoom(roomId, "typing", { user });
}
export { typingInGroupHandler, typingInPrivateRoomHandler };
