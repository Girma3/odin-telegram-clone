const apiUrl = import.meta.env.VITE_API_URL;
import { getAccessToken } from "../../auth/services/authService";

/*
my routes at backend
// Get all groups (public)
groupRouter.get("/all", getAllGroupsHandler);

// Get group by name (public)
groupRouter.get("/name/:name", getGroupByGroupName);

// Get group by ID (public)
groupRouter.get("/:groupId", getGroup);

// Create a new group (authenticated)
groupRouter.post("/", isUserAuthenticated, createNewGroup);

// Join group (authenticated)
groupRouter.post("/:groupId/join", isUserAuthenticated, joinGroup);

// Add member to group (authenticated)
groupRouter.post("/:groupId/members", isUserAuthenticated, addMemberToGroup);

// Get group members (public)
groupRouter.get("/:groupId/members", getMembers);

// Get group posts (public)
groupRouter.get("/:groupId/posts", getPosts);

// Leave group (authenticated)
groupRouter.post("/:groupId/leave", isUserAuthenticated, leaveGroup);

// Remove member from group (authenticated)
groupRouter.delete(
  "/:groupId/members/:userId",
  isUserAuthenticated,
  removeMemberFromGroup,
);

// Update group (authenticated, owner only)
groupRouter.put("/:groupId", isUserAuthenticated, updateGroupHandler);

// Delete group (authenticated, owner only)
groupRouter.delete("/:groupId", isUserAuthenticated, deleteGroupHandler);
//get group by user id
groupRouter.get("/:userId",  getGroupByUserIdController);

 */

const createGroup = async (group) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(group),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};
const getGroupByUserId = async (userId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${userId}`, {
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
const joinGroup = async (groupId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${groupId}/join`, {
    method: "POST",
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

const leaveGroup = async (groupId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${groupId}/leave`, {
    method: "POST",
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

const getAllGroups = async () => {
  const response = await fetch(`${apiUrl}/groups/all`, {
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

const getGroupByName = async (name) => {
  const response = await fetch(`${apiUrl}/groups/name/${name}`, {
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

const getGroup = async (groupId) => {
  // const token = getAccessToken();
  // if (!token) {
  //   throw new Error("Not authenticated");
  // }
  const response = await fetch(`${apiUrl}/groups/${groupId}`, {
    method: "GET",
    headers: {
      // Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const addMemberToGroup = async (groupId, userId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const getMembers = async (groupId) => {
  const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
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

const getPosts = async (groupId) => {
  const response = await fetch(`${apiUrl}/groups/${groupId}/posts`, {
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

const removeMemberFromGroup = async (groupId, userId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/members/${userId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
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

const updateGroup = async ({ groupId, ...groupData }) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${groupId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupData),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }
  return response.json();
};

const deleteGroup = async (groupId) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  const response = await fetch(`${apiUrl}/groups/${groupId}`, {
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

const isUserGroupMember = async (groupId, userId) => {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");
  const response = await fetch(
    `${apiUrl}/groups/${groupId}/user/member?userId=${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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

const isUserGroupAdmin = async (groupId, userId) => {
  const token = getAccessToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(
    `${apiUrl}/groups/${groupId}/user/admin?userId=${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
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
export {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroupByUserId,
  getAllGroups,
  getGroupByName,
  getGroup,
  addMemberToGroup,
  getMembers,
  getPosts,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup,
  isUserGroupAdmin,
  isUserGroupMember,
};
