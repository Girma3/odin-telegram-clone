function broadcastWithAck(room, type, payload, senderWs) {
  if (!room) return;

  const messageId = crypto.randomUUID();
  const message = JSON.stringify({ type, payload, messageId });

  room.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);

      // notify sender that message was delivered
      if (client !== senderWs) {
        senderWs.send(
          JSON.stringify({
            type: "delivered",
            payload: { messageId, to: client._id },
          }),
        );
      }
    }
  });
}
