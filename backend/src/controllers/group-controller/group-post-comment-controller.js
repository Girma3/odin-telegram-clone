import {
  addComment,
  deleteComment,
  getCommentsByPost,
} from "../../models/group-query/group-post-queries.js";
import { CommentSchema } from "../../middlewares/validation/schema-validation.js";

// Add comment to post
async function addCommentToPost(req, res) {
  const { postId } = req.params;
  const result = CommentSchema.safeParse(req.body);

  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid comment data", detail: result.error.message });
  }

  let userId = req.user.id;

  try {
    const { text, parentId } = result.data;
    const comment = await addComment(postId, userId, text, parentId);
    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to add comment: ${error.message}` });
  }
}

// Delete comment
async function deleteCommentHandler(req, res) {
  const { commentId } = req.params;

  try {
    await deleteComment(commentId, req.user.id);
    return res.json({ message: "Comment deleted successfully" });
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
      .json({ message: `Failed to delete comment: ${error.message}` });
  }
}

// Get comments for a post
async function getComments(req, res) {
  const { postId } = req.params;

  try {
    const comments = await getCommentsByPost(postId);
    return res.json(comments);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get comments: ${error.message}` });
  }
}

export { addCommentToPost, deleteCommentHandler, getComments };
