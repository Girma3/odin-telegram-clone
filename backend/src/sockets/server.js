import { WebSocketServer } from "ws";
import { dispatchEvent, use } from "./dispatch-event.js";
import { replayNotifications } from "./utils/notification.js";
import { setUserOffline, setUserOnline } from "./utils/presence.js";

import logMiddleware from "./middleware/log.js";
import { schemaValidationMiddleware } from "./middleware/validate-schema.js";
let wss;
function attachWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  // Register middleware
  use(schemaValidationMiddleware);
  use(logMiddleware);

  // Attach upgrade handler
  server.on("upgrade", (req, socket, head) => {
    wss.handleUpgrade(req, socket, head, (ws) => {
      // Attach request so we can access req.user (set by your app server)
      ws.req = req;
      wss.emit("connection", ws, req);
    });
  });

  // Global heartbeat
  setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  // Connection handler
  wss.on("connection", (ws) => {
    ws.isAlive = true;

    // Auth: userId comes from your app server’s JWT middleware
    ws.userId = ws.req.user?.id;
    if (!ws.userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    // Mark user online + broadcast
    setUserOnline(ws.userId, ws);
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(
          JSON.stringify({
            type: "user_online",
            payload: { userId: ws.userId },
          }),
        );
      }
    });
    // Replay missed notifications
    replayNotifications(ws.userId, ws);
    // Heartbeat pong
    ws.on("pong", () => {
      ws.isAlive = true;
    });

    // Message handler
    ws.on("message", (rawData) => {
      let data;
      try {
        data = JSON.parse(rawData.toString());
      } catch {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid JSON payload",
          }),
        );
        return;
      }

      // Dispatch event safely
      if (!dispatchEvent(ws, data, wss)) {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Unknown event type",
          }),
        );
      }
    });

    // Close handler
    ws.on("close", () => {
      setUserOffline(ws.userId);

      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(
            JSON.stringify({
              type: "user_offline",
              payload: { userId: ws.userId },
            }),
          );
        }
      });
    });
  });

  return wss;
}
export function getSocketServer() {
  return wss;
}
export default attachWebSocketServer;
