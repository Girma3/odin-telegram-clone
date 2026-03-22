//private chat events
const privateRoom = new Map();
function privateRoomId(userA, userB) {
  return ["private", userA, userB].sort().join(":");
}

function getPrivateRoom(roomId) {
  if (!privateRoom.has(roomId)) {
    privateRoom.set(roomId, new Set());
  }
  return privateRoom.get(roomId);
}

function broadCastToPrivateRoom(roomId, type, payload) {
  const room = getPrivateRoom(roomId);
  if (!room) return;
  const message = JSON.stringify({ type, payload });
  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}
export { privateRoomId, getPrivateRoom, broadCastToPrivateRoom, privateRoom };
