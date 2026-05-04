import { useEffect } from "react";
import { connect, on, token } from "../wsClient";

function useWebSocketEvent(eventType, handler) {
  useEffect(() => {
    const ws = connect(token);
    on(eventType, handler);

    // optional cleanup: remove handler if you want
    return () => {
      // naive cleanup: not removing handler here, but you could implement unsubscribe
    };
  }, [token, eventType, handler]);
}

export default useWebSocketEvent;
