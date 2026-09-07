import { useEffect, useState } from "react";
import { send, on } from "../wsClient";

function useReplyNotification({ roomId }) {
  const [replyNotifications, setReplyNotifications] = useState([]);

  useEffect(() => {
    const handler = (payload) => {
      if (payload.roomId === roomId) {
        setReplyNotifications((prev) => {
          // avoid duplicates by messageId
          const exists = prev.some((n) => n.messageId === payload.messageId);
          return exists ? prev : [...prev, payload];
        });
      }
    };
    on("reply_notification", handler);

    return () => {
      // cleanup if you add off()
    };
  }, [roomId]);

  // Emit a reply notification
  const sendReplyNotification = ({ messageId, originalSenderId, roomType }) => {
    send("reply_notification", {
      messageId,
      originalSenderId,
      roomType,
      roomId,
    });
  };

  return { replyNotifications, sendReplyNotification };
}

export default useReplyNotification;
