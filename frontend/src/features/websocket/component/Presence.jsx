import { useState } from "react";
import useWebSocketEvent from "../hooks/useWebsocketEvent";
import useOnlineUsers from "../hooks/useOnlineUsers";

function PresenceWidget({ myUserId }) {
  const onlineUsers = useOnlineUsers();

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
