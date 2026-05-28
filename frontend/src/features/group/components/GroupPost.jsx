import { useMemo, useCallback } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Link } from "react-router-dom";
import { FaRegMessage } from "react-icons/fa6";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { useAddReaction, useDeleteReaction } from "../hooks/useReaction";
import CommenterAvatars from "./CommenterAvatars";
import KebabDropdown from "./KebabDropdown";
import Reaction from "../../chat/Reaction";
import { getTheTime } from "../../../services/helperFns";

const ICON_STYLES = {
  link: `w-8 h-8 fill-white transition-all duration-300 ease-in-out rounded-full hover:fill-amber-400 cursor-pointer`,
  kebab: `w-6 h-6 fill-white  hover:fill-black transition-all duration-300 ease-in-out   `,
};
const IMAGE_STYLES = {
  post: `min-w-6 h-60 rounded-2 shadow-md object-cover ring-1 ring-pink-400`,
  commenter: `w-8 h-8 rounded-full  object-cover border border-black 
  bg-gradient-to-t from- black to-blue-600`,
};

function formatCommentCount(count) {
  if (count === 0) return "Leave Comment";
  if (count === 1) return "1 comment";
  return `${count} comments`;
}

function GroupPost({
  groupMembers = [],
  post,
  isMember = false,
  groupId,
  currentUser,
  onProfileOpen,
  onDeletePost,
  onEditPost,
}) {
  if (!post?.author) return null;
  const { id: postId, imgUrl } = post;

  const isUserAuthor = currentUser?.id === post.userId;
  const comments = useMemo(() => post.comments || [], [post.comments]);
  const reactions = useMemo(() => post.reactions || [], [post.reactions]);
  const alreadyReactedToPost = useMemo(() => {
    return reactions.some((reaction) => reaction.userId === currentUser.id);
  }, [reactions, currentUser?.id]);

  // Toast Helper
  const triggerToast = useCallback((title, desc, status = "info") => {
    const content = (
      <div>
        <strong>{title}</strong>
        {desc && <div>{desc}</div>}
      </div>
    );

    // Use a deterministic ID based on the title to deduplicate triggers
    const uniqueId = `toast-${title.replace(/\s+/g, "-").toLowerCase()}`;

    const toastOptions = {
      toastId: uniqueId, // 🔑 FIX: Prevents duplicate renders
      position: "top-right",
      autoClose: 5000,
      closeOnClick: true, // This will now work properly
      pauseOnHover: true,
      draggable: true,
      hideProgressBar: false,
    };

    const toastFn =
      {
        success: toast.success,
        error: toast.error,
        info: toast.info,
      }[status] ?? toast.info;

    // REMOVED: toast.dismiss() here was killing event handlers prematurely

    toastFn(content, toastOptions);
  }, []);

  // API Mutations
  const addReactionMutation = useAddReaction();

  const removeReactionMutation = useDeleteReaction();

  // Action Toggles with explicit membership validations
  const handleToggleReaction = useCallback(
    (emoji, hasReacted) => {
      if (!isMember) {
        return triggerToast(
          "Join group",
          "You must be a group member to interact",
          "info",
        );
      }
      if (hasReacted) {
        removeReactionMutation.mutate(
          { postId, emoji },
          {
            onSuccess: () => triggerToast("Reaction removed", "", "success"),
            onError: () =>
              triggerToast("Error", "Failed to remove reaction", "error"),
          },
        );
      } else {
        addReactionMutation.mutate(
          { postId, emoji },
          {
            onSuccess: () => triggerToast("Reaction added", "", "success"),
            onError: () =>
              triggerToast("Error", "Failed to add reaction", "error"),
          },
        );
      }
    },
    [
      isMember,
      postId,
      addReactionMutation,
      removeReactionMutation,
      triggerToast,
    ],
  );
  const activeReactions = useMemo(() => {
    const countsMap = reactions.reduce((acc, reaction) => {
      const emoji = reaction.emoji;

      if (!acc[emoji]) {
        acc[emoji] = {
          emoji: emoji,
          count: 0,
          userIds: [],
        };
      }

      acc[emoji].count += 1;
      acc[emoji].userIds.push(reaction.userId);

      return acc;
    }, {});

    return Object.values(countsMap);
  }, [reactions]);

  return (
    <div className="group/post max-w-xl group relative flex flex-col gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        closeOnClick
        pauseOnHover
        draggable
        hideProgressBar={false}
      />

      {/* BODY SECTION: Post Text / Render Images */}
      {post.text && <p className="text-sm text-zinc-300 p-1">{post.text}</p>}
      {imgUrl && (
        <img
          src={imgUrl}
          alt="Post asset"
          className="w-full h-60 rounded-xl object-cover ring-1 ring-zinc-700/50 shadow"
          loading="lazy"
        />
      )}
      {/* REACTIONS SECTION: Displays on hover, with toggle logic */}

      <div className="absolute -right-6 bottom-0 hidden group-hover:block">
        {isMember && !isUserAuthor && !alreadyReactedToPost && (
          <Reaction onSelect={handleToggleReaction} />
        )}
      </div>

      <div className="flex gap-2 items-center">
        {activeReactions.map((reaction) => {
          // Check if the current logged-in user is in this emoji's user list
          const hasUserReacted = reaction.userIds.includes(currentUser.id);

          return (
            <button
              key={reaction.emoji} // Use emoji as the unique key now
              className={`flex gap-1 items-center  p-1 rounded ${isUserAuthor ? "bg-gray-900" : ""}`}
              title={`${hasUserReacted ? "Remove" : "Add"} reaction ${reaction.emoji}`}
              aria-label={`${hasUserReacted ? "Remove" : "Add"} reaction ${reaction.emoji}`}
              onClick={() =>
                handleToggleReaction(reaction.emoji, hasUserReacted)
              }
              disabled={!isMember || isUserAuthor}
            >
              <span
                className={`  ${hasUserReacted ? "bg-blue-500 " : " "}px-1 rounded-sm hover:scale-110 transition-transform duration-200`}
              >
                {reaction.emoji}
              </span>
              <span className="text-xs font-bold">{reaction.count}</span>{" "}
            </button>
          );
        })}{" "}
      </div>
      {/* author , time and menu */}
      <div className="flex gap-2 text-xs text-zinc-400  justify-end items-center w-full">
        <div>
          <span className=" font-semibold  px-2">{post.author.username}</span>
          <time>{getTheTime(post.created)}</time>
        </div>
        <KebabDropdown
          isUserAuthor={isUserAuthor}
          postId={postId}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
        />
      </div>
      <hr className="p-px border-none bg-linear-to-r from-green-700 to-amber-400 to-red-600" />

      {/* FOOTER LINK BLOCK PATTERN: Entire Row leads to Discussion Channel */}
      <div
        className="group/link relative flex
           justify-between items-center p-2 rounded-xl
            bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800
             hover:border-zinc-700/80 transition-all focus-within:ring-2 focus-within:ring-blue-500"
      >
        <Link
          to={`/post/discussion/${postId}?groupId=${groupId}`}
          state={{ groupMembers, postData: post }}
          className="absolute inset-0 z-0 rounded-xl"
          aria-label="View discussion"
        />

        <div
          className="flex items-center gap-3 relative"
          onClick={(e) => e.stopPropagation()}
        >
          <CommenterAvatars
            comments={comments}
            groupMembers={groupMembers}
            onProfileOpen={onProfileOpen}
          />
          <div className=" group flex  items-center text-xs sm:text-sm font-medium text-zinc-400 group-hover/link:text-blue-400 transition-colors">
            {comments.length === 0 && (
              <FaRegMessage className="mr-2 text-zinc-500 group-hover:fill-amber-300  " />
            )}
            <p className="px-2">{formatCommentCount(comments.length)}</p>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="p-1 text-zinc-500 group-hover/link:text-zinc-200 group-hover/link:translate-x-1 transition-all"
        >
          <MdOutlineKeyboardArrowRight className="w-6 h-6 group-hover:fill-zinc-300 " />
        </div>
      </div>
    </div>
  );
}
export default GroupPost;
