const userOnline = new Map();

function setUserOnline(userId, ws) {
  return userOnline.set(userId, ws);
}
function setUserOffline(userId) {
  return userOnline.delete(userId);
}
function isOnline(userId) {
  return userOnline.has(userId);
}
function getOnlineUsers() {
  return Array.from(userOnline.keys());
}
export { setUserOnline, setUserOffline, isOnline, getOnlineUsers };
