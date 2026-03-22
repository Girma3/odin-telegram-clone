//event handlers for private events
import {
  privateRoomId,
  getPrivateRoom,
  broadCastToPrivateRoom,
} from "../utils/private-room.js";

function getPrivateRoomHandler(ws, roomId, wss) {
  const room = getPrivateRoom(roomId);
  room.add(ws);
}

function privateChatHandler(ws, payload, wss) {
  const { userA, userB, text } = payload;
  const roomId = privateRoomId(userA, userB);
  const room = getPrivateRoom(roomId);
  room.add(ws);
  //generate msg id
  const messageId = crypto.randomUUID();
  broadCastToPrivateRoom(roomId, "private_message", { text, messageId });
  //notify sender that message was sent
  ws.send(
    JSON.stringify({
      type: "delivered",
      payload: { messageId, to: userB },
    }),
  );
}

export { getPrivateRoomHandler, privateChatHandler };
