import React, { useState, useMemo, useEffect } from "react";
import useWebSocketEvent from "./hooks/useWebsocketEvent";
import { useAuthContext } from "../auth/AuthContext";

const OnlineUsersContext = React.createContext(null);

function OnlineUsersProvider({ children }) {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { currentUser } = useAuthContext();

  // 1. Reset state completely if the current user logs out
  useEffect(() => {
    if (!currentUser) {
      setOnlineUsers([]);
    }
  }, [currentUser]);

  // 2. Handle incoming WebSocket events gracefully
  useWebSocketEvent("user_online", (payload) => {
    if (!payload?.userId) return;
    setOnlineUsers((prev) => {
      if (prev.includes(payload.userId)) return prev; // Avoid triggering re-renders if already present
      return [...prev, payload.userId];
    });
  });

  useWebSocketEvent("user_offline", (payload) => {
    if (!payload?.userId) return;
    setOnlineUsers((prev) => prev.filter((id) => id !== payload.userId));
  });

  // 3. OPTIONAL: Handle initial user list sync if your backend sends it on connect
  useWebSocketEvent("initial_online_users", (payload) => {
    if (Array.isArray(payload?.userIds)) {
      setOnlineUsers(payload.userIds);
    }
  });

  // 4. Memoize the value to stop  component re-renders
  const value = useMemo(
    () => ({
      onlineUsers,
      isUserOnline: (userId) => onlineUsers.includes(userId),
    }),
    [onlineUsers],
  );

  return (
    <OnlineUsersContext.Provider value={value}>
      {children}
    </OnlineUsersContext.Provider>
  );
}
export { OnlineUsersProvider, OnlineUsersContext };
