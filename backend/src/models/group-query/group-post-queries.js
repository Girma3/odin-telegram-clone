import prismaGlobal from "../pool.js";

// Create a new post in a group
async function createGroupPost(userId, groupId, data = {}) {
  try {
    const post = await prismaGlobal.posts.create({
      data: {
        userId,
        groupId,
        text: data.text || null,
        imgUrl: data.imgUrl || null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to create post: ${error.message}`);
  }
}

// Get post by ID
async function getPostById(postId) {
  try {
    const post = await prismaGlobal.posts.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
                profile: true,
              },
            },
          },
          orderBy: {
            created: "desc",
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
    });
    return post;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get post: ${error.message}`);
  }
}

// Get posts by group ID
async function getPostsByGroupId(groupId) {
  try {
    const posts = await prismaGlobal.posts.findMany({
      where: {
        groupId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get group posts: ${error.message}`);
  }
}

// Get all posts by a user
async function getUserPosts(userId) {
  try {
    const posts = await prismaGlobal.posts.findMany({
      where: {
        userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get user posts: ${error.message}`);
  }
}

// Get all posts (global feed)
async function getAllPosts() {
  try {
    const posts = await prismaGlobal.posts.findMany({
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return posts;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get all posts: ${error.message}`);
  }
}

// Update a post
async function updatePost(postId, userId, updates) {
  try {
    // First check if user is the author
    const post = await prismaGlobal.posts.findUnique({
      where: { id: postId },
      select: { userId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    if (post.userId !== userId) {
      throw new Error("Not authorized to update this post");
    }

    const updatedPost = await prismaGlobal.posts.update({
      where: {
        id: postId,
      },
      data: updates,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return updatedPost;
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      throw error;
    }
    throw new Error(`Failed to update post: ${error.message}`);
  }
}

// Delete a post
async function deletePost(postId, userId) {
  try {
    // First check if user is the author
    const post = await prismaGlobal.posts.findUnique({
      where: { id: postId },
      select: { userId: true, groupId: true },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    // Check if user is author OR group owner
    const group = await prismaGlobal.groups.findUnique({
      where: { id: post.groupId },
      select: { ownerId: true },
    });

    if (post.userId !== userId && group?.ownerId !== userId) {
      throw new Error("Not authorized to delete this post");
    }

    // Delete related data first
    await prismaGlobal.$transaction([
      prismaGlobal.notifications.deleteMany({
        where: { postId },
      }),
      prismaGlobal.reactions.deleteMany({
        where: { postId },
      }),
      prismaGlobal.comments.deleteMany({
        where: { postId },
      }),
    ]);

    const deletedPost = await prismaGlobal.posts.delete({
      where: {
        id: postId,
      },
    });
    return deletedPost;
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      throw error;
    }
    throw new Error(`Failed to delete post: ${error.message}`);
  }
}

// Add reaction to post
async function addReaction(postId, userId, emoji) {
  try {
    const reaction = await prismaGlobal.reactions.create({
      data: {
        postId,
        userId,
        emoji,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });
    return reaction;
  } catch (error) {
    // Handle unique constraint violation
    if (error.code === "P2002") {
      throw new Error("User has already reacted to this post");
    }
    console.error(error);
    throw new Error(`Failed to add reaction: ${error.message}`);
  }
}

// Remove reaction from post
async function removeReaction(postId, userId) {
  try {
    const reaction = await prismaGlobal.reactions.delete({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return reaction;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to remove reaction: ${error.message}`);
  }
}

// Get reactions for a post
async function getPostReactions(postId) {
  try {
    const reactions = await prismaGlobal.reactions.findMany({
      where: {
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return reactions;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get reactions: ${error.message}`);
  }
}

// Get user reaction for specific post
async function getReactionById(postId, userId) {
  try {
    const reaction = await prismaGlobal.reactions.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });
    return reaction;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get reaction: ${error.message}`);
  }
}

// Add comment to post
async function addComment(postId, userId, text, parentId = null) {
  try {
    const comment = await prismaGlobal.comments.create({
      data: {
        postId,
        userId,
        text,
        parentId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        post: {
          select: {
            id: true,
            text: true,
          },
        },
        parent: {
          select: {
            id: true,
            text: true,
          },
        },
      },
    });
    return comment;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to add comment: ${error.message}`);
  }
}

// Delete comment
async function deleteComment(commentId, userId) {
  try {
    // First check if user is the author
    const comment = await prismaGlobal.comments.findUnique({
      where: { id: commentId },
      select: { userId: true, postId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    // Check if user is comment author OR post author OR group owner
    const post = await prismaGlobal.posts.findUnique({
      where: { id: comment.postId },
      select: { userId: true, groupId: true },
    });

    const group = await prismaGlobal.groups.findUnique({
      where: { id: post.groupId },
      select: { ownerId: true },
    });

    if (
      comment.userId !== userId &&
      post.userId !== userId &&
      group?.ownerId !== userId
    ) {
      throw new Error("Not authorized to delete this comment");
    }

    // Delete replies first
    await prismaGlobal.comments.deleteMany({
      where: { parentId: commentId },
    });

    // Delete notifications
    await prismaGlobal.notifications.deleteMany({
      where: { commentId },
    });

    const deletedComment = await prismaGlobal.comments.delete({
      where: {
        id: commentId,
      },
    });
    return deletedComment;
  } catch (error) {
    console.error(error);
    if (
      error.message.includes("Not authorized") ||
      error.message.includes("not found")
    ) {
      throw error;
    }
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

// Get comments by post
async function getCommentsByPost(postId) {
  try {
    const comments = await prismaGlobal.comments.findMany({
      where: {
        postId,
        parentId: null, // Only top-level comments
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                email: true,
                profile: true,
              },
            },
          },
          orderBy: {
            created: "asc",
          },
        },
      },
      orderBy: {
        created: "desc",
      },
    });
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get comments: ${error.message}`);
  }
}

// Check if user is post author
async function isPostAuthor(postId, userId) {
  try {
    const post = await prismaGlobal.posts.findUnique({
      where: { id: postId },
      select: { userId: true },
    });
    return post?.userId === userId;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to check post author: ${error.message}`);
  }
}

export {
  createGroupPost,
  getPostById,
  getPostsByGroupId,
  getUserPosts,
  getAllPosts,
  updatePost,
  deletePost,
  addReaction,
  removeReaction,
  getPostReactions,
  getReactionById,
  addComment,
  deleteComment,
  getCommentsByPost,
  isPostAuthor,
};
