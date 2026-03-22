import { WebSocketServer } from "ws";
import { wsArcjet } from "../arcJet/arcJet.js";

function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    noServer: true,
    maxPayload: 1024 * 1024,
  });

  // Handle upgrade requests
  server.on("upgrade", async (req, socket, head) => {
    try {
      if (wsArcjet) {
        const decision = await wsArcjet.protect(req);
        if (decision.isDenied()) {
          socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
          socket.destroy();
          return;
        }
      }
    } catch (e) {
      console.error("wsArcjet error", e);
      socket.write("HTTP/1.1 503 Service Unavailable\r\n\r\n");
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // When a client connects
  wss.on("connection", (socket, req) => {
    socket.isAlive = true;

    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.on("message", (data) => {
      // TODO: route events here
    });

    socket.on("close", () => {
      console.log("Client disconnected");
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
      socket.terminate();
    });
  });

  // Heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (!client.isAlive) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));
}

export { attachWebSocketServer };
