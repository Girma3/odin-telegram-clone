/**
 *  mention_notification: mentionNotificationHandler,
  reply_notification: replyNotificationHandler,
 */
//  const { messageId, mentionUserId, roomType, roomId } = payload; mention
//const { messageId, originalSenderId, roomType, roomId } = payload; reply
import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";

function NotificationEvent({
  type = "mention_notification",
  userId,
  roomId,
  groupId,
}) {
  const [mentionNotifications, setMentionNotifications] = useState([]);
  const [replyNotifications, setReplyNotifications] = useState([]);
  const mentionPayload = { messageId, mentionUserId, roomType, roomId };
  const replyPayload = { messageId, originalSenderId, roomType, roomId };

  if (type === "mention_notification") {
    useWebSocketEvent(type, (payload) => {
      if (payload.roomId === roomId) {
        setMentionNotifications((prev) => [...new Set([...prev, payload])]);
      }
    });
  } else if (type === "reply_notification") {
    useWebSocketEvent(type, (payload) => {
      if (payload.roomId === roomId) {
        setReplyNotifications((prev) => [...new Set([...prev, payload])]);
      }
    });
  }
  return (
    <div>
      {type === "mention_notification" && (
        <p>
          {mentionNotifications.length > 0
            ? `${mentionNotifications.join(", ")} has mentioned you`
            : ""}
        </p>
      )}
      {type === "reply_notification" && (
        <p>
          {replyNotifications.length > 0
            ? `${replyNotifications.join(", ")} has replied to your message`
            : ""}
        </p>
      )}
    </div>
  );
}
export default NotificationEvent;
