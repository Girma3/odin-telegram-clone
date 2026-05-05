import React, { useState } from "react";
import useWebSocketEvent from "./hooks/useWebsocketEvent";

const OnlineUsersContext = React.createContext([]);

function OnlineUsersProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);

  useWebSocketEvent("user_online", (payload) => {
    setOnlineUsers((prev) => [...new Set([...prev, payload.userId])]);
  });

  useWebSocketEvent("user_offline", (payload) => {
    setOnlineUsers((prev) => prev.filter((id) => id !== payload.userId));
  });

  return (
    <OnlineUsersContext.Provider value={onlineUsers}>
      {children}
    </OnlineUsersContext.Provider>
  );
}
export { OnlineUsersContext, OnlineUsersProvider };
