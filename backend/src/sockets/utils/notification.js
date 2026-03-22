const notifications = new Map();

function addNotification(userId, notification) {
  if (!notifications.has(userId)) {
    notifications.set(userId, []);
  }
  notifications.get(userId).push(notification);
}

function getNotifications(userId) {
  return notifications.get(userId) || [];
}
function clearNotifications(userId) {
  if (notifications.has(userId)) {
    notifications.set(userId, []);
  }
}
function replayNotifications(userId, ws) {
  const notifications = getNotifications(userId);
  notifications.forEach((n) => {
    ws.send(
      JSON.stringify({
        type: n.type, // "mention_notification" or "reply_notification"
        payload: n.payload,
      }),
    );
  });
  clearNotifications(userId);
}

export {
  addNotification,
  getNotifications,
  clearNotifications,
  replayNotifications,
};
