import { Router } from "express";
import {
  createNewGroup,
  getGroup,
  getGroupByGroupName,
  getAllGroupsHandler,
  updateGroupHandler,
  deleteGroupHandler,
  addMemberToGroup,
  removeMemberFromGroup,
  getMembers,
  getPosts,
  joinGroup,
  leaveGroup,
} from "../controllers/group-controller.js";
import { isUserAuthenticated } from "../controllers/auth-controller.js";

const groupRouter = Router({ mergeParams: true });

// Welcome route
groupRouter.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the groups API" });
});

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

export default groupRouter;
