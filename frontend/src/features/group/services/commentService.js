import { fetchWithAuth } from "../../auth/services/authService";

const apiUrl = import.meta.env.VITE_API_URL;

const getCommentsForPost = async (postId, nested) => {
  const response = await fetch(
    `${apiUrl}/posts/${postId}/comments/?nested=${nested}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const createComment = async ({ postId, ...commentData }) => {
  const response = await fetchWithAuth(`${apiUrl}/posts/${postId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(commentData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const deleteComment = async (commentId) => {
  const response = await fetchWithAuth(
    `${apiUrl}/posts/comments/${commentId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const updateComment = async ({ commentId, ...commentData }) => {
  const response = await fetchWithAuth(
    `${apiUrl}/posts/comments/${commentId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    },
  );

  if (!response.ok) {
    const errorText = await response.json()?.message;
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};
const getCommentsWithTelegramStyle = async (postId) => {
  const response = await fetch(`${apiUrl}/posts/${postId}/comments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};
export {
  getCommentsForPost,
  createComment,
  updateComment,
  deleteComment,
  getCommentsWithTelegramStyle,
};
