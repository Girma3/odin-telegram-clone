import { useEffect } from "react";
import { on } from "../wsClient";
import useWebSocket from "./useWebsocket";

function useWebSocketEvent(eventType, handler) {
  const ws = useWebSocket();
  if (!ws) return null;
  useEffect(() => {
    on(eventType, handler);

    // optional cleanup if you have an unsubscribe function
    return () => {
      // ws.off(eventType, handler) if your lib supports it
    };
  }, [ws, eventType, handler]);
}

export default useWebSocketEvent;
