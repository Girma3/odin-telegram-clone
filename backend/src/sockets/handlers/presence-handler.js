import {
  setUserOnline,
  setUserOffline,
  getOnlineUsers,
} from "../utils/presence.js";

function userOnlineHandler(ws, payload, wss) {
  const { userId } = payload;
  ws.userId = userId;

  setUserOnline(userId, ws);

  // broadcast to everyone
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "user_online",
          payload: { userId },
        }),
      );
    }
  });
}

function userOfflineHandler(ws, payload, wss) {
  const { userId } = payload;

  setUserOffline(userId);

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(
        JSON.stringify({
          type: "user_offline",
          payload: { userId },
        }),
      );
    }
  });
}

export { userOnlineHandler, userOfflineHandler };
