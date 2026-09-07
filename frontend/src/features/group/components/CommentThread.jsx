import { useRef, useMemo, useState, useEffect } from "react";
import UserComment from "./UserComment.jsx";

const GRADIENTS = [
  "from-pink-500 to-rose-500",
  "from-violet-500 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

// Reusable slick style presets
const REPLY_BANNER_CLASS = `
  relative group/reply flex items-center gap-2 pl-4 pr-3 py-1.5 
  bg-zinc-900/50 border-b border-zinc-800/60 cursor-pointer 
  text-xs text-zinc-400 hover:text-violet-400 rounded-t-xl transition-all duration-200
`;

function CommentThread({
  comments,
  currentUser,
  onProfileOpen,
  onCommentDelete,
  onCommentEdit,
  onNestedComment,
}) {
  if (!comments?.length) return null;
  const commentRefs = useRef({});
  const [highlightedId, setHighlightedId] = useState(null);

  // Fix: Clean, stable gradient choice per mounting instance
  const activeGradient = useMemo(() => {
    const index = Math.floor(Math.random() * GRADIENTS.length);
    return GRADIENTS[index];
  }, []);

  // Fix: Optimize tree flattening and parent map calculation to single-pass O(N)
  const { flattenedComments, parentPreviewMap, deletedParentSet } =
    useMemo(() => {
      const list = [];
      const previewMap = {};
      const lookupTable = new Map();
      const deletedParentList = new Set();
      function processNodes(nodes) {
        if (!nodes) return;
        for (let i = 0; i < nodes.length; i++) {
          const comment = nodes[i];

          list.push(comment);
          const isDeleted = comment.author.isDeleted;

          const commentText = isDeleted ? "[comment Deleted]" : comment.text;
          lookupTable.set(comment.id, commentText);
          if (isDeleted) {
            deletedParentList.add(comment.id);
          }
          if (comment.replies?.length) {
            processNodes(comment.replies);
          }
        }
      }

      processNodes(comments);

      // Build parent preview strings safely
      list.forEach((comment) => {
        if (!comment.parentId) return;

        const parentText = lookupTable.get(comment.parentId) || "";
        previewMap[comment.id] =
          parentText.length > 25 ? `${parentText.slice(0, 25)}...` : parentText;
      });

      return {
        flattenedComments: list,
        parentPreviewMap: previewMap,
        deletedParentSet: deletedParentList,
      };
    }, [comments]);

  // Clean timeout safety for highlighted states
  useEffect(() => {
    if (!highlightedId) return;
    const timer = setTimeout(() => setHighlightedId(null), 1500);
    return () => clearTimeout(timer);
  }, [highlightedId]);

  const jumpToParent = (parentId) => {
    const targetNode = commentRefs.current[parentId];
    if (targetNode) {
      targetNode.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(parentId);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      {flattenedComments.map((comment) => {
        const isOwner = currentUser && comment?.userId === currentUser;
        const hasParent = comment.parentId && parentPreviewMap[comment.id];
        const isCurrentlyHighlighted = highlightedId === comment.id;
        const isParentDeleted = deletedParentSet.has(comment.parentId);
        //if comment deleted  return early
        if (comment.author.isDeleted) return null;

        return (
          <div
            key={comment.id}
            ref={(node) => {
              if (node) commentRefs.current[comment.id] = node;
            }}
            className={`
              flex flex-col w-full border rounded-xl bg-zinc-900/20  transition-all duration-300
hover:shadow-md hover:shadow-green-700 
             
              ${
                isCurrentlyHighlighted
                  ? "border-violet-500/80 ring-2 ring-violet-500/20 bg-violet-950/10 shadow-lg shadow-violet-500/5 translate-x-1"
                  : "border-zinc-900 hover:border-zinc-800/80"
              }
            `}
          >
            {/* Contextual Reply Tracker Row */}
            {hasParent && (
              <div
                className={`${REPLY_BANNER_CLASS} ${isParentDeleted ? "pointer-events-none cursor-default" : ""} `}
                onClick={() =>
                  !isParentDeleted && jumpToParent(comment.parentId)
                }
              >
                {/* Visual Anchor Bar */}
                <span
                  className={`absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b ${activeGradient} rounded-tl-xl`}
                />
                <span className="text-zinc-500">Replying to</span>
                <span className="font-medium text-zinc-300 group-hover/reply:text-violet-300 transition-colors truncate max-w-[220px]">
                  "{parentPreviewMap[comment.id]}"
                </span>
              </div>
            )}

            <UserComment
              currentUser={currentUser}
              user={comment?.author}
              profile={comment?.author?.profile}
              comment={comment}
              owner={isOwner}
              onProfileOpen={onProfileOpen}
              onCommentDelete={onCommentDelete}
              onCommentEdit={onCommentEdit}
              onNestedComment={onNestedComment}
              mode="reply"
            />
          </div>
        );
      })}
    </div>
  );
}

export default CommentThread;
