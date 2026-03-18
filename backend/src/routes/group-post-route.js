import { Router } from "express";

// Post controllers
import {
  createNewPostForGroup,
  getPost,
  getPostsByUser,
  getAllPostsHandler,
  updatePostHandler,
  deletePostHandler,
  getGroupPosts,
} from "../controllers/group-controller/group-post-controller.js";

// Reaction controllers
import {
  addReactionToPost,
  removeReactionFromPost,
  getReactions,
} from "../controllers/group-controller/group-post-reaction-controller.js";

// Comment controllers
import {
  addCommentToPost,
  deleteCommentHandler,
  getComments,
} from "../controllers/group-controller/group-post-comment-controller.js";

import { isUserAuthenticated } from "../controllers/auth-controller.js";

const groupPostRouter = Router({ mergeParams: true });

// Welcome route
groupPostRouter.get("/", (req, res) => {
  return res.status(200).json({ message: "Welcome to the group posts API" });
});

// ==================== POSTS ====================
// Get all posts (global feed) - public
groupPostRouter.get("/feed", getAllPostsHandler);

// Get posts by user - public
groupPostRouter.get("/user/:userId", getPostsByUser);

// Get posts by group - public
groupPostRouter.get("/group/:groupId", getGroupPosts);

// Get single post - public
groupPostRouter.get("/:postId", getPost);

// Create a new post in group (authenticated)
groupPostRouter.post("/", isUserAuthenticated, createNewPostForGroup);

// Update post (authenticated, author only)
groupPostRouter.put("/:postId", isUserAuthenticated, updatePostHandler);

// Delete post (authenticated, author or group owner)
groupPostRouter.delete("/:postId", isUserAuthenticated, deletePostHandler);

// ==================== COMMENTS ====================
// Get comments for a post - public
groupPostRouter.get("/:postId/comments", getComments);

// Add comment to post (authenticated)
groupPostRouter.post(
  "/:postId/comments",
  isUserAuthenticated,
  addCommentToPost,
);

// Delete comment (authenticated)
groupPostRouter.delete(
  "/comments/:commentId",
  isUserAuthenticated,
  deleteCommentHandler,
);

// ==================== REACTIONS ====================
// Get reactions for a post - public
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

export default groupPostRouter;
