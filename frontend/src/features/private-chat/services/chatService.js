import { getAccessToken as getToken } from "../../auth/services/authService";
const apiUrl = import.meta.env.VITE_API_URL;

const getConversations = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private-posts/conversations`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const getUnreadMessages = async () => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private-posts/unread`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const getConversation = async (userId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const markConversationRead = async (userId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private/user/${userId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const getChat = async (chatId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private/${chatId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const sendPrivateMessage = async (message) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const markMessageAsRead = async (chatId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private/${chatId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const deleteChat = async (chatId) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/private/${chatId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};
const editChat = async ({ chatId, data }) => {
  const token = getToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  const response = await fetch(`${apiUrl}/private/${chatId}/edit`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

export {
  getConversations,
  getUnreadMessages,
  getConversation,
  markConversationRead,
  getChat,
  sendPrivateMessage,
  markMessageAsRead,
  editChat,
  deleteChat,
};

/*
// ==================== MESSAGES ====================
// Get all conversations for current user
privatePostRouter.get("/conversations", getConversationsHandler);

// Get unread message count
privatePostRouter.get("/unread", getUnreadMessages);

// Get conversation with a specific user
privatePostRouter.get("/user/:userId", getConversationHandler);

// Mark conversation as read
privatePostRouter.put("/user/:userId/read", markConversationRead);

// Get single chat message by ID
privatePostRouter.get("/:chatId", getChat);

// Send a private message
privatePostRouter.post("/", sendPrivateMessage);

// Mark single message as read
privatePostRouter.put("/:chatId/read", markMessageAsRead);

// Delete a private message
privatePostRouter.delete("/:chatId", deleteChatHandler);

*/
