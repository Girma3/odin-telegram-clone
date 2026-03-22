function validateMiddleware(ws, type, payload) {
  if (!type) return false; // block event

  // Example: private chat must have text
  if (type === "private_chat") {
    if (!payload || !payload.text) {
      ws.send(JSON.stringify({ type: "error", message: "missing text" }));
      return false;
    }
  }
}

export default validateMiddleware;
