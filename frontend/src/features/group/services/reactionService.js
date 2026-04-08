/*
groupPostRouter.get("/:postId/reactions", getReactions);

// Add reaction to post (authenticated)
groupPostRouter.post(
  "/:postId/reactions",
  isUserAuthenticated,
  addReactionToPost,
);

// Remove reaction from post (authenticated)
groupPostRouter.delete(
  "/:postId/reactions",
  isUserAuthenticated,
  removeReactionFromPost,
);
 */
import { fetchWithAuth } from "../../auth/services/authService";

const apiUrl = import.meta.env.VITE_API_URL;
const addReactionToPost = async (postId, reactionData) => {
  const response = await fetchWithAuth(`${apiUrl}/posts/${postId}/reactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(reactionData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};
const getReactions = async (postId) => {
  const response = await fetch(`${apiUrl}/posts/${postId}/reactions`, {
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
const deleteReaction = async (postId) => {
  const response = await fetchWithAuth(`${apiUrl}/posts/${postId}/reactions`, {
    method: "DELETE",
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
export { addReactionToPost, getReactions, deleteReaction };
