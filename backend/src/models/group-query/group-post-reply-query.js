import prismaGlobal from "../pool.js";

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
            isDeleted: true,
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
//get comments top level or nested all comments
// async function getCommentsByPost(postId, nested = true) {
//   try {
//     const comments = await prismaGlobal.comments.findMany({
//       where: {
//         postId,
//         parentId: nested ? null : undefined, //  top-level comments default
//       },
//       include: {
//         author: {
//           select: {
//             id: true,
//             username: true,
//             email: true,
//             profile: true,
//           },
//         },
//         replies: {
//           include: {
//             author: {
//               select: {
//                 id: true,
//                 username: true,
//                 email: true,
//                 profile: true,
//               },
//             },
//           },
//           orderBy: {
//             created: "asc",
//           },
//         },
//       },
//       orderBy: {
//         created: "asc",
//       },
//     });
//     return comments;
//   } catch (error) {
//     console.error(error);
//     throw new Error(`Failed to get comments: ${error.message}`);
//   }
// }
async function getNestedCommentsByPost(postId) {
  try {
    const comments = await prismaGlobal.comments.findMany({
      where: {
        postId,
        parentId: null,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
            isDeleted: true,
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
                isDeleted: true,
              },
            },
          },
          orderBy: {
            created: "asc",
          },
        },
      },
      orderBy: {
        created: "asc",
      },
    });
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get comments: ${error.message}`);
  }
}
async function getNotNestedCommentsByPost(postId) {
  try {
    const comments = await prismaGlobal.comments.findMany({
      where: {
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            email: true,
            profile: true,
            isDeleted: true,
          },
        },
      },

      orderBy: {
        created: "asc",
      },
    });
    return comments;
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get comments: ${error.message}`);
  }
}
async function getCommentsByPost(postId, nested = "true") {
  try {
    if (nested === "true") {
      return await getNestedCommentsByPost(postId);
    }
    return await getNotNestedCommentsByPost(postId);
  } catch (error) {
    console.error(error);
    throw new Error(`Failed to get comments: ${error.message}`);
  }
}

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
//update comment by Id
async function updateComment(commentId, userId, data) {
  try {
    // First check if user is the author
    const comment = await prismaGlobal.comments.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    if (!comment) {
      throw new Error("Comment not found");
    }

    if (comment.userId !== userId) {
      throw new Error("Not authorized to update this comment");
    }
    const updatedComment = await prismaGlobal.comments.update({
      where: { id: commentId },
      data,
    });
    return updatedComment;
  } catch (error) {
    console.error(error);
    if (error.message.includes("Not authorized")) {
      throw error;
    }
    if (error.message.includes("not found")) {
      throw error;
    }
    throw new Error(`Failed to update comment: ${error.message}`);
  }
}
async function getPostWithTelegramStyleComments(postId) {
  // Step 1: Fetch post with top-level comments
  const post = await prismaGlobal.posts.findUnique({
    where: { id: postId },
    include: {
      author: true,
      group: true,
      reactions: true,
      _count: true,
      comments: {
        where: { parentId: null },
        include: { author: true },
        orderBy: { created: "desc" },
      },
    },
  });

  // Step 2: Fetch all comments for this post
  const allComments = await prismaGlobal.comments.findMany({
    where: { postId },
    include: { author: true },
    orderBy: { created: "asc" },
  });

  // Step 3: Build lookup map
  const repliesByParent = allComments.reduce((acc, comment) => {
    if (!comment.parentId) return acc;
    if (!acc[comment.parentId]) acc[comment.parentId] = [];
    acc[comment.parentId].push(comment);
    return acc;
  }, {});

  // Step 4: Attach replies (Telegram style: shallow preview)
  function attachReplies(comment) {
    comment.replies = repliesByParent[comment.id] || [];
    // Only attach one level for preview, deeper replies can be lazy-loaded
    return comment;
  }

  post.comments = post.comments.map(attachReplies);
  return post;
}

export {
  addComment,
  updateComment,
  getCommentsByPost,
  deleteComment,
  getPostWithTelegramStyleComments,
};
