import e from "express";
import { eventMap } from "./event-map.js";
const middlewares = [];

function use(mw) {
  middlewares.push(mw);
}
function dispatchEvent(ws, data, wss) {
  const { type, payload } = data;

  // 1. Validate event type
  const handler = eventMap[type];
  if (!handler) {
    ws.send(JSON.stringify({ type: "error", message: "unknown event type" }));
    return;
  }

  // 2. Middleware chain (logging, validation, auth, etc.)
  // run middleware chain
  for (const mw of middlewares) {
    const result = mw(ws, type, payload);
    if (result === false) {
      // middleware blocked the event
      return;
    }
  }

  // 3. Execute handler
  try {
    handler(ws, payload, wss);
  } catch (err) {
    console.error("Handler error:", err);
    ws.send(JSON.stringify({ type: "error", message: "handler failed" }));
  }
}
export { dispatchEvent, use };
