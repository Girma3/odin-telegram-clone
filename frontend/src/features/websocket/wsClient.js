import {
  getAccessToken,
  refreshAccessToken,
} from "../auth/services/authService";
const WS_URL = "ws://localhost:3000";
let ws;
const listeners = {};
let token = getAccessToken();
if (!token) {
  // Try refreshing token if not found
  token = await refreshAccessToken();
}

function connect(token) {
  if (ws) return ws; // prevent duplicate connections
  ws = new WebSocket(`${WS_URL}?token=${token}`);

  ws.onopen = () => console.log("WS connected");
  ws.onclose = () => console.log("WS disconnected");
  ws.onerror = (err) => console.error("WS error:", err);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      const { type, payload } = msg;
      if (listeners[type]) {
        listeners[type].forEach((cb) => cb(payload));
      }
    } catch (err) {
      console.error("Failed to parse:", event.data);
      console.error("Error:", err);
    }
  };

  return ws;
}

function on(eventType, callback) {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  listeners[eventType].push(callback);
}

function send(type, payload) {
  ws.send(JSON.stringify({ type, payload }));
}

/*

const token = localStorage.getItem("accessToken");

// Connect with token in query string
const ws = new WebSocket(`ws://localhost:3000?token=${token}`);

ws.onopen = () => {
  console.log("WebSocket connected");
};

ws.onmessage = (event) => {
  console.log("Raw event:", event.data);

  try {
    const msg = JSON.parse(event.data);
    console.log("WS event:", msg.type, msg.payload);
  } catch (err) {
    console.error("Failed to parse:", event.data);
  }
};

ws.onclose = (event) => {
  console.log("WebSocket disconnected", event.code, event.reason);
};

ws.onerror = (err) => {
  console.error("WebSocket error:", err);
};
 */
export { connect, on, send, token };
