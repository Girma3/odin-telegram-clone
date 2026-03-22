import { addNotification, clearNotifications } from "../utils/notification.js";

function mentionNotificationHandler(ws, payload, wss) {
  const { messageId, mentionUserId, roomType, roomId } = payload;

  //notify user directly
  let delivered = false;
  wss.clients.forEach((client) => {
    if (client.userId === mentionUserId && client.readyState === client.OPEN) {
      client.send(
        JSON.stringify({
          type: "mention_notification",
          payload: { messageId, roomType, roomId },
        }),
      );
      delivered = true;
    }
  });

  if (!delivered) {
    addNotification(mentionUserId, messageId, roomType, roomId);
  }
}

function replyNotificationHandler(ws, payload, wss) {
  const { messageId, originalSenderId, roomType, roomId } = payload;
  //notify user directly
  let delivered = false;
  wss.clients.forEach((client) => {
    if (
      client.userId === originalSenderId &&
      client.readyState === client.OPEN
    ) {
      client.send(
        JSON.stringify({
          type: "reply_notification",
          payload: { messageId, roomType, roomId, by: ws.userId },
        }),
      );
      delivered = true;
    }
  });
  //store notification for offline user
  if (!delivered) {
    addNotification(originalSenderId, messageId, roomType, roomId);
  }
}
export { mentionNotificationHandler, replyNotificationHandler };
