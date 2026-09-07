import { useEffect, useState } from "react";
import useWebSocketEvent from "./useWebsocketEvent";
import { send, on } from "../wsClient";

// message_seen_private: privateMessageSeenHandler,

function useMessageSeen({ messageId, fromUserId }) {
  const [messageSeen, setMessageSeen] = useState(false);

  // Listen for seen events
  useEffect(() => {
    const handler = (payload) => {
      if (payload.messageId === messageId) {
        setMessageSeen(true);
      }
    };
    on("message_seen_private", handler);

    return () => {
      // optional cleanup if you add off()
    };
  }, [messageId]);

  // Emit when you mark as seen
  const markSeen = () => {
    send("message_seen_private", { messageId, fromUserId });
  };

  return { messageSeen, markSeen };
}

export default useMessageSeen;
