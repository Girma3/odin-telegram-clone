import {
  broadCastToPrivateRoom,
  joinPrivateRoomHandler,
} from "../utils/private-room.js";
import { broadcastToGroup } from "../utils/group-room.js";
function typingInGroupHandler(ws, payload, wss) {
  const { groupId, user } = payload;
  broadcastToGroup(groupId, "typing", { user, groupId }, ws);
}
function typingInPrivateRoomHandler(ws, payload, wss) {
  const { roomId, user } = payload;
  joinPrivateRoomHandler(ws, { roomId });
  broadCastToPrivateRoom(roomId, "typing", { user, roomId }, ws);
}
export { typingInGroupHandler, typingInPrivateRoomHandler };
