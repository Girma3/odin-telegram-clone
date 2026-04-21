import { useRef, useMemo } from "react";
import UserComment from "./UserComment.jsx";

function getParentPreview(comments = [], parentId) {
  const parent = comments.find((c) => c.id === parentId);
  if (!parent) return null;
  const text = parent.text || "";
  return text.length > 25 ? text.slice(0, 25) + "..." : text;
}

function isUserCommentOwner(userId, comment) {
  if (!userId || !comment) return false;
  return userId === comment.userId;
}

function CommentThread({
  comments,
  currentUser,
  onProfileOpen,
  onCommentDelete,
  onCommentEdit,
  onNestedComment,
  onReaction,
}) {
  const commentRefs = useRef({});

  const parentPreviewMap = useMemo(() => {
    const map = {};

    function buildPreviewMap(allComments) {
      allComments.forEach((comment) => {
        if (comment.replies) {
          comment.replies.forEach((reply) => {
            const parent = allComments.find((c) => c.id === reply.parentId);
            if (parent) {
              const text = parent.text || "";
              map[reply.id] =
                text.length > 25 ? text.slice(0, 25) + "..." : text;
            }
            buildPreviewMap(comment.replies);
          });
        }
      });
    }

    buildPreviewMap(comments);
    return map;
  }, [comments]);

  const setRef = (id, node) => {
    if (node) commentRefs.current[id] = node;
  };

  const jumpToParent = (parentId) => {
    const parentNode = commentRefs.current[parentId];
    if (parentNode) {
      parentNode.scrollIntoView({ behavior: "smooth", block: "center" });
      parentNode.classList.add("ring-2", "ring-blue-400", "bg-blue-50");
      setTimeout(() => {
        parentNode.classList.remove("ring-2", "ring-blue-400", "bg-blue-50");
      }, 1500);
    }
  };

  const renderComment = (comment) => (
    <div
      key={comment.id}
      ref={(node) => setRef(comment.id, node)}
      className="relative"
    >
      {comment.parentId && parentPreviewMap[comment.id] && (
        <div
          className="mb-1 cursor-pointer text-xs text-gray-400 hover:text-blue-400"
          onClick={() => jumpToParent(comment.parentId)}
        >
          ↳ Replying to "{parentPreviewMap[comment.id]}"
        </div>
      )}
      <UserComment
        currentUser={currentUser}
        user={comment?.author?.profile}
        comment={comment}
        owner={isUserCommentOwner(currentUser, comment)}
        onProfileOpen={onProfileOpen}
        onCommentDelete={onCommentDelete}
        onCommentEdit={onCommentEdit}
        onNestedComment={onNestedComment}
        mode={comment.parentId ? "reply" : "comment"}
      />
    </div>
  );

  const allComments = useMemo(() => {
    const result = [];

    function flatten(commentsArray) {
      commentsArray.forEach((comment) => {
        result.push(comment);
        if (comment.replies && comment.replies.length > 0) {
          flatten(comment.replies);
        }
      });
    }

    flatten(comments);
    return result;
  }, [comments]);

  return (
    <ul className="flex flex-col">
      {allComments.map((comment) => renderComment(comment))}
    </ul>
  );
}

export default CommentThread;
