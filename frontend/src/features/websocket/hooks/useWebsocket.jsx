import { useMemo } from "react";
import { connect, token } from "../wsClient";

function useWebSocket() {
  const ws = useMemo(() => connect(token), [token]);
  return ws;
}

export default useWebSocket;
