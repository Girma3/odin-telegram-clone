import { useState } from "react";
import useWebSocketEvent from "./useWebsocketEvent";
import useWebSocket from "./useWebsocket";
import { send } from "../wsClient";

function usePrivateTyping(roomId, myUserId) {
  const [typingUsers, setTypingUsers] = useState([]);

  // Listen for typing events
  useWebSocketEvent("typing", (payload) => {
    //  if (payload.roomId === roomId) {
    setTypingUsers((prev) => [...new Set([...prev, payload.user])]);
    setTimeout(() => {
      setTypingUsers((prev) => prev.filter((id) => id !== payload.user));
    }, 3000);
    //  }
  });

  // Emit typing event
  const emitTyping = () => {
    send("typing_in_private", { roomId, user: myUserId });
    //console.log(typingUsers);
  };

  return { typingUsers, emitTyping };
}

function useGroupTyping(groupId) {
  const [typingUsers, setTypingUsers] = useState([]);

  useWebSocketEvent("typing_in_group", (payload) => {
    if (payload.groupId === groupId) {
      setTypingUsers((prev) => [...new Set([...prev, payload.user])]);

      setTimeout(() => {
        setTypingUsers((prev) => prev.filter((id) => id !== payload.user));
      }, 3000);
    }
  });

  const emitTyping = () => {
    useWebSocketEvent.emit("typing_in_group", { groupId });
  };

  return {
    typingUsers,
    emitTyping,
  };
}
function TypingIndicator({ type, roomId, groupId }) {
  const typingUsers =
    type === "typing_in_private"
      ? usePrivateTyping(roomId)
      : useGroupTyping(groupId);

  return (
    <p className="text-sm text-amber-400">
      hey
      {typingUsers.length > 0 ? `${typingUsers.join(", ")} is typing...` : ""}
    </p>
  );
}

export { TypingIndicator, usePrivateTyping, useGroupTyping };
