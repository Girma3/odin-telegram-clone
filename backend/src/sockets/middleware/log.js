function logMiddleware(ws, type, payload) {
  console.log(`EVENT: ${type} FROM: ${ws._id}`);
  console.log("PAYLOAD:", payload);
}
export default logMiddleware;
