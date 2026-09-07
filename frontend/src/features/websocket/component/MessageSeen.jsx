import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";

function MessageSeen({ type = "message_seen_in_private", user, roomId, groupId }) {
  const [seenByPrivate, setSeenByPrivate] = useState([]);
  const [seenByGroup, setSeenByGroup] = useState([]);

  //for private payload = {roomId, user}
  //for group payload = {groupId, user}

  if (type === "message_seen_in_private") {
    useWebSocketEvent(type, (payload) => {
      if (payload.roomId === roomId) {
        setSeenByPrivate((prev) => [...new Set([...prev, payload.user])]);
      }
    });
  } else if (type === "message_seen_in_group") {
    useWebSocketEvent(type, (payload) => {
      if (payload.groupId === groupId) {
        setSeenByGroup((prev) => [...new Set([...prev, payload.user])]);    
      }
    });
  }
  return (
    <div>
      {type === "message_seen_in_private" && (
        <p>
          {seenByPrivate.length > 0
            ? `${seenByPrivate.join(", ")} has seen the message`
            : ""}
        </p>
      )}
      {type === "message_seen_in_group" && (
        <p>
          {seenByGroup.length > 0
            ? `${seenByGroup.join(", ")} has seen the message`
            : ""}
        </p>
      )}
    </div>
  );
}    
export default MessageSeen;
