import { Router } from "express";
import {
  createNewGroup,
  getGroup,
  getGroupByUserIdController,
  getGroupByGroupName,
  getAllGroupsHandler,
  updateGroupHandler,
  softDeleteGroupHandler,
  deleteGroupHandler,
  addMemberToGroup,
  removeMemberFromGroup,
  getMembers,
  getPosts,
  joinGroup,
  leaveGroup,
  isUserAdmin,
  isUserGroupMember,
} from "../controllers/group-controller/group-controller.js";
import { isUserAuthenticated } from "../controllers/auth-controller.js";

const groupRouter = Router({ mergeParams: true });

// Welcome
groupRouter.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the groups API" });
});

// ----------------------
// PUBLIC ROUTES (STATIC FIRST)
// ----------------------

// Get all groups
groupRouter.get("/all", getAllGroupsHandler);

// Get group by name
groupRouter.get("/name/:name", getGroupByGroupName);

// Get groups by userId (IMPORTANT: prefix to avoid conflict)
groupRouter.get("/user/:userId", getGroupByUserIdController);

//check user is member
groupRouter.get("/:groupId/user/member", isUserGroupMember);
//check user is admin
groupRouter.get("/:groupId/user/admin", isUserAdmin);
// ----------------------
// GROUP-SPECIFIC ROUTES (STATIC SEGMENTS FIRST)
// ----------------------

// Get group members
groupRouter.get("/:groupId/members", getMembers);

// Get group posts
groupRouter.get("/:groupId/posts", getPosts);

// Get group by ID (MUST COME LAST among groupId routes)
groupRouter.get("/:groupId", getGroup);

// ----------------------
// AUTHENTICATED ACTIONS
// ----------------------

// Create group
groupRouter.post("/", isUserAuthenticated, createNewGroup);

// Join group
groupRouter.post("/:groupId/join", isUserAuthenticated, joinGroup);

// Leave group
groupRouter.post("/:groupId/leave", isUserAuthenticated, leaveGroup);

// Add member
groupRouter.post("/:groupId/members", isUserAuthenticated, addMemberToGroup);

// Remove member
groupRouter.delete(
  "/:groupId/members/:userId",
  isUserAuthenticated,
  removeMemberFromGroup,
);

// Update group (use consistent path)
groupRouter.put("/:groupId", isUserAuthenticated, updateGroupHandler);

// Delete group
//hard
groupRouter.delete("/:groupId/hard", isUserAuthenticated, deleteGroupHandler);
//soft
groupRouter.delete(
  "/:groupId/soft",
  isUserAuthenticated,
  softDeleteGroupHandler,
);

export default groupRouter;
