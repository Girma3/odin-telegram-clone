function privateMessageSeenHandler(ws, payload, wss) {
  const { messageId, fromUserId } = payload;

  // notify original sender that message was seen
  wss.clients.forEach((client) => {
    if (client.userId === fromUserId && client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "seen",
          payload: { messageId, by: ws.userId },
        }),
      );
    }
  });
}
function groupMessageSeenHandler(ws, payload, wss) {
  const { messageId, groupId, fromUserId } = payload;

  // notify original sender that message was seen
  wss.clients.forEach((client) => {
    if (client.userId === fromUserId && client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "seen",
          payload: { messageId, by: ws.userId, groupId },
        }),
      );
    }
  });
}

export { privateMessageSeenHandler, groupMessageSeenHandler };
