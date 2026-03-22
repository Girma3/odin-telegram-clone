//groups rooms
const groupRooms = new Map();

function registerGroup(groupId) {
  if (!groupRooms.has(groupId)) {
    groupRooms.set(groupId, new Set());
  }
}

function joinGroup(ws, groupId) {
  registerGroup(groupId);
  groupRooms.get(groupId).add(ws);
}

function leaveGroup(ws, groupId) {
  const group = groupRooms.get(groupId);
  if (!group) return;

  group.delete(ws);

  if (group.size === 0) {
    groupRooms.delete(groupId);
  }
}

function broadcastToGroup(groupId, type, payload) {
  const group = groupRooms.get(groupId);
  if (!group) return;

  const message = JSON.stringify({ type, payload });

  group.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

export { registerGroup, joinGroup, leaveGroup, broadcastToGroup };
