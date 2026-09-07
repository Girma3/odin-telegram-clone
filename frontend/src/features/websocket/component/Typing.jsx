import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";
function Typing({ type = "typing_in_private", user, roomId, groupId }) {
  const [typingUsersPrivate, setTypingUsersPrivate] = useState([]);
  const [typingUsersGroup, setTypingUsersGroup] = useState([]);

  //for private payload = {roomId, user}
  //for group payload = {groupId, user}

  if (type === "typing_in_private") {
    useWebSocketEvent(type, (payload) => {
      if (payload.roomId === roomId) {
        setTypingUsersPrivate((prev) => [...new Set([...prev, payload.user])]);
        setTimeout(() => {
          setTypingUsersPrivate((prev) =>
            prev.filter((id) => id !== payload.user),
          );
        }, 3000); // Remove after 3 seconds of inactivity
      }
    });
  } else if (type === "typing_in_group") {
    useWebSocketEvent(type, (payload) => {
      if (payload.groupId === groupId) {
        setTypingUsersGroup((prev) => [...new Set([...prev, payload.user])]);
        setTimeout(() => {
          setTypingUsersGroup((prev) =>
            prev.filter((id) => id !== payload.user),
          );
        }, 3000); // Remove after 3 seconds of inactivity
      }
    });
  }
  console.log("Typing users in private:", typingUsersPrivate);
  console.log("Typing users in group:", typingUsersGroup);
  return (
    <div>
      {type === "typing_in_private" && (
        <p>
          {typingUsersPrivate.length > 0
            ? `${typingUsersPrivate.join(", ")} is typing...`
            : ""}
        </p>
      )}
      {type === "typing_in_group" && (
        <p>
          {typingUsersGroup.length > 0
            ? `${typingUsersGroup.join(", ")} is typing...`
            : ""}
        </p>
      )}
    </div>
  );
}
export default Typing;
