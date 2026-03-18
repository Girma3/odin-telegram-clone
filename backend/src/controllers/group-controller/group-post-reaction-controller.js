import {
  addReaction,
  removeReaction,
  getPostReactions,
  getReactionById,
} from "../../models/group-query/group-post-queries.js";
import { ReactionSchema } from "../../middlewares/validation/schema-validation.js";

// Add reaction to post
async function addReactionToPost(req, res) {
  const { postId } = req.params;
  const result = ReactionSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ message: result.error.message });
  }

  const { emoji } = result.data;
  let userId = req.user.id;

  try {
    // If they react before, remove their reaction (toggle behavior)
    const hasReactBefore = await getReactionById(postId, userId);
    if (hasReactBefore) {
      await removeReaction(postId, userId);
      //return res.status(200).json({ message: "Reaction removed successfully" });
    }
    const reaction = await addReaction(postId, userId, emoji);
    return res.status(201).json(reaction);
  } catch (error) {
    console.error(error);
    if (error.message.includes("already reacted")) {
      return res.status(400).json({ message: error.message });
    }
    if (error.message.includes("not found")) {
      return res.status(404).json({ message: error.message });
    }
    return res
      .status(500)
      .json({ message: `Failed to add reaction: ${error.message}` });
  }
}

// Remove reaction from post
async function removeReactionFromPost(req, res) {
  const { postId } = req.params;
  let userId = req.user.id;

  try {
    await removeReaction(postId, userId);
    return res.json({ message: "Reaction removed successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to remove reaction: ${error.message}` });
  }
}

// Get reactions for a post
async function getReactions(req, res) {
  const { postId } = req.params;

  try {
    const reactions = await getPostReactions(postId);
    return res.json(reactions);
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: `Failed to get reactions: ${error.message}` });
  }
}

export { addReactionToPost, removeReactionFromPost, getReactions };
