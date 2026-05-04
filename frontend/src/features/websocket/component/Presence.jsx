import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";

function PresenceWidget({ myUserId }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  console.log("Rendering PresenceWidget with myUserId:", myUserId);

  useWebSocketEvent("user_online", (payload) => {
    setOnlineUsers((prev) => [...new Set([...prev, payload.userId])]);
  });

  useWebSocketEvent( "user_offline", (payload) => {
    setOnlineUsers((prev) => prev.filter((id) => id !== payload.userId));
  });

  return (
    <div>
      <h3>Online Users</h3>
      <ul>
        {onlineUsers.map((id) => (
          <li key={id}>{id === myUserId ? "Me" : id}</li>
        ))}
      </ul>
    </div>
  );
}

export default PresenceWidget;
