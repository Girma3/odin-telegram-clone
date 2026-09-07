import { fetchWithAuth } from "../../auth/services/authService";

const apiUrl = import.meta.env.VITE_API_URL;

const getAllPosts = async () => {
  const response = await fetch(`${apiUrl}/posts/feed`, {
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

const getPostsByUser = async (userId) => {
  const response = await fetch(`${apiUrl}/posts/user/${userId}`, {
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

const getGroupPosts = async (groupId) => {
  const response = await fetch(`${apiUrl}/posts/group/${groupId}`, {
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

const getPost = async (postId) => {
  const response = await fetch(`${apiUrl}/posts/${postId}`, {
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

const createPost = async (postData) => {
  const response = await fetchWithAuth(`${apiUrl}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const updatePost = async ({ postId, ...postData }) => {
  const response = await fetchWithAuth(`${apiUrl}/posts/${postId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

const deletePost = async (postId) => {
  const response = await fetchWithAuth(`${apiUrl}/posts/${postId}`, {
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

export {
  getAllPosts,
  getPostsByUser,
  getGroupPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
};
