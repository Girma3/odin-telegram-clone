import {
  createGroupPost,
  getPostById,
  getPostsByGroupId,
  getUserPosts,
  getAllPosts,
  updatePost,
  deletePost,
} from "../../models/group-query/group-post-queries.js";
import {
  isGroupMember,
  isGroupOwner,
} from "../../models/group-query/group-queries.js";
import { PostSchema } from "../../middlewares/validation/schema-validation.js";

// Create a new post for a group
async function createNewPostForGroup(req, res) {
  const result = PostSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid post data", detail: result.error.message });
  }
  let userId = req.user.id;

  if (!userId || !result.data.groupId) {
    return res.status(400).json({ message: "Unauthorized to post" });
  }

  const { text, imgUrl, groupId } = result.data;
  if (!text && !imgUrl) {
    return res
      .status(400)
      .json({ message: "Either text or image is required" });
  }

  try {
    const isMember = await isGroupMember(groupId, userId);
    const isOwner = await isGroupOwner(groupId, userId);

    if (!isMember && !isOwner) {
      return res
        .status(403)
        .json({ message: "You must be a group member to create a post" });
    }

    const post = await createGroupPost(userId, groupId, { text, imgUrl });
    return res.status(201).json(post);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to create post: ${error.message}` });
  }
}

// Get post by ID
async function getPost(req, res) {
  const { postId } = req.params;

  try {
    const post = await getPostById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.json(post);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get post: ${error.message}` });
  }
}

// Get posts by group
async function getGroupPosts(req, res) {
  const { groupId } = req.params;

  try {
    const posts = await getPostsByGroupId(groupId);
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get posts: ${error.message}` });
  }
}

// Get posts by user
async function getPostsByUser(req, res) {
  const { userId } = req.params;

  try {
    const posts = await getUserPosts(userId);
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get posts: ${error.message}` });
  }
}

// Get all posts (global feed)
async function getAllPostsHandler(req, res) {
  try {
    const posts = await getAllPosts();
    return res.json(posts);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get posts: ${error.message}` });
  }
}

// Update a post
async function updatePostHandler(req, res) {
  const { postId } = req.params;
  const result = PostSchema.partial().safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  const { text, imgUrl } = result.data;
  if (!text && !imgUrl) {
    return res
      .status(400)
      .json({ message: "Either text or image is required" });
  }
  const userId = req.user.id;
  try {
    const post = await updatePost(postId, userId, result.data);
    return res.json(post);
  } catch (error) {
    console.error(error);
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to update post: ${error.message}` });
  }
}

// Delete a post
async function deletePostHandler(req, res) {
  const { postId } = req.params;

  try {
    await deletePost(postId, req.user.id);
    return res.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    if (error.message.includes("Not authorized")) {
      return res.status(403).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to delete post: ${error.message}` });
  }
}

export {
  createNewPostForGroup,
  getPost,
  getGroupPosts,
  getPostsByUser,
  getAllPostsHandler,
  updatePostHandler,
  deletePostHandler,
};
