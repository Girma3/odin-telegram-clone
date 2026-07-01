import {
  getAccessToken,
  refreshAccessToken,
} from "../auth/services/authService";

const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

let ws = null;
let reconnectAttempts = 0;
let isReconnecting = false;
const maxReconnectDelay = 30000; // Max 30 seconds between retries
const listeners = {};
const messageQueue = []; // Holds messages if sent while connecting

/**
 * Gets a valid token, refreshing it if necessary
 */
async function getValidToken() {
  let currentToken = getAccessToken();

  if (!currentToken) {
    try {
      currentToken = await refreshAccessToken();
    } catch (err) {
      console.error("Failed to refresh token for WebSocket:", err);
    }
  }
  return currentToken;
}

/**
 * Establishes the WebSocket connection with automatic retry logic
 */
async function connect() {
  if (
    ws &&
    (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)
  ) {
    return ws;
  }

  const token = await getValidToken();
  if (!token) {
    // console.error(
    //   "Cannot connect to WebSocket: No valid authentication token.",
    // );
    // Retry later even if auth fails, in case it was a temporary network glitch
    retryConnection();
    return null;
  }

  ws = new WebSocket(`${WS_URL}?token=${token}`);

  ws.onopen = () => {
    //console.log("WebSocket connected successfully");
    reconnectAttempts = 0; // Reset retry counter on successful connection
    isReconnecting = false;
    flushQueue(); // Send any pending messages
  };

  ws.onmessage = (event) => {
    try {
      const { type, payload } = JSON.parse(event.data);
      if (listeners[type]) {
        listeners[type].forEach((cb) => cb(payload));
      }
    } catch (err) {
      console.error("Failed to parse WS message:", event.data, err);
    }
  };

  ws.onerror = (err) => {
    console.error("WebSocket error observed:", err);
  };

  ws.onclose = (event) => {
    // console.log(
    //   `WebSocket closed (Code: ${event.code}). Clean: ${event.wasClean}`,
    // );
    ws = null;

    // Do not reconnect if the closure was intentional (e.g., user logged out)
    if (event.code !== 1000) {
      retryConnection();
    }
  };

  return ws;
}

/**
 * Handles reconnection using Exponential Backoff to protect your server
 */
function retryConnection() {
  if (isReconnecting) return;
  isReconnecting = true;

  // Calculate delay: 1s, 2s, 4s, 8s... up to maxReconnectDelay
  const delay = Math.min(
    1000 * Math.pow(2, reconnectAttempts),
    maxReconnectDelay,
  );
  // console.log(
  //   `Attempting reconnection in ${delay / 1000} seconds... (Attempt ${reconnectAttempts + 1})`,
  // );

  setTimeout(async () => {
    reconnectAttempts++;
    isReconnecting = false;
    await connect();
  }, delay);
}

/**
 * Flushes queued messages once connection opens
 */
function flushQueue() {
  while (messageQueue.length > 0 && ws && ws.readyState === WebSocket.OPEN) {
    const { type, payload } = messageQueue.shift();
    ws.send(JSON.stringify({ type, payload }));
  }
}

/**
 * Registers an event listener
 */
function on(eventType, callback) {
  if (!listeners[eventType]) {
    listeners[eventType] = [];
  }
  listeners[eventType].push(callback);

  // Return an unsubscribe function for easy cleanup in components
  return () => {
    listeners[eventType] = listeners[eventType].filter((cb) => cb !== callback);
  };
}

/**
 * Sends data or queues it if the socket is not ready yet
 */
function send(type, payload) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    // console.warn(`WebSocket not ready. Queueing message: ${type}`);
    messageQueue.push({ type, payload });
    connect(); // Trigger connection if dead
    return;
  }

  ws.send(JSON.stringify({ type, payload }));
}

/**
 * Gracefully closes the connection (use this on logout)
 */
function disconnect() {
  if (ws) {
    ws.close(1000, "Intentional disconnect"); // 1000 prevents auto-reconnect
    ws = null;
  }
}

export { connect, on, send, disconnect, getValidToken };
