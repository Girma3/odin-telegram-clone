import { useMemo } from "react";
import { connect } from "../wsClient";

function useWebSocket() {
  const ws = useMemo(() => connect(), []);
  return ws;
}

export default useWebSocket;
