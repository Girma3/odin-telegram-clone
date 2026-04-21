import { useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaReply } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { Link } from "react-router-dom";

import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import KebabMenu from "../../chat/components/KebabMenu";
import {
  useGetReactions,
  useAddReaction,
  useDeleteReaction,
} from "../hooks/useReaction";
import {
  formatDate,
  getMonthAndYear,
  getTheTime,
} from "../../../services/helperFns";
import { IoArrowForwardCircleSharp } from "react-icons/io5";

// Constants
const ICON_STYLES = {
  reply: `w-4 h-4 fill-pink-400 transition-all duration-300 ease-in-out rounded-full hover:fill-green-600 cursor-pointer`,
  kebab: `w-6 h-6 fill-pink-300 hover:fill-green-400`,
};

const IMAGE_STYLES = {
  post: `min-w-6 h-60 rounded-2 shadow-md object-cover ring-1 ring-pink-400`,
  commenter: `w-8 h-8 rounded-full object-cover border-2 ring-green-400 ring-1 border-gray-700`,
};

// Helper function to get commenter image with error handling
function getCommenterImage(users, comment) {
  if (!users || !comment) return null;
  const user = users.find((u) => u.id === comment.userId);
  if (!user) {
    console.log(`User not found for comment userId: ${comment.userId}`);
    return null;
  }
  return { user, imgUrl: user.profile?.avatarUrl };
}

// Helper function to format comment count
function formatCommentCount(count) {
  if (count === 0) return "No comments";
  if (count === 1) return "1 comment";
  return `${count} comments`;
}

// Component for displaying commenter profile images
function CommenterImage({ imgUrl, index, onProfileOpen, user }) {
  const handleClick = () => {
    if (onProfileOpen && user) {
      onProfileOpen({ type: "user", user });
    }
  };

  return (
    <button
      aria-label={`View ${user?.name || "user"}'s profile`}
      className="w-12"
      onClick={handleClick}
      title="show-Profile"
      type="button"
    >
      <img
        src={imgUrl}
        alt={`${user?.username || "User"}'s profile`}
        className={`${IMAGE_STYLES.commenter} ${index > 0 ? "-ml-5" : ""}`}
      />
    </button>
  );
}

// Main GroupPost component
function GroupPost({
  users,
  post,
  isAdmin = false,
  groupId,
  currentUser,
  onProfileOpen,
  onDeletePost,
  onEditPost,
}) {
  //  const { id: authorId, avatarUrl } = post?.author?.profile;
  if (!post?.author || !post) {
    return <div>Post not found</div>;
  }

  const { id } = post;
  const { id: postId, text, imgUrl } = post;
  const { username } = post?.author;

  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emoji, setEmoji] = useState(null);

  // Memoize derived data to avoid recalculation on every render
  const comments = useMemo(() => post.comments || [], [post.comments]);
  const commentCount = useMemo(() => comments.length, [comments]);
  //console.log(comments);

  const commenterUsers = useMemo(() => {
    if (comments.length === 0) return [];
    return comments
      .slice(0, 2)
      .map((comment) => getCommenterImage(users, comment))
      .filter(Boolean); // Remove null entries
  }, [comments, users]);

  const reactions = useMemo(() => post.reactions || [], [post.reactions]);
  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setMenuOpen(false);
  };

  const handleImageDownload = () => {
    if (imgUrl) {
      const link = document.createElement("a");
      link.href = imgUrl;
      link.download = `post-${id}-image`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  //add reaction to post
  const addReactionMutation = useAddReaction({
    onSuccess: () => {
      notifyAddReaction();
    },
    onError: () => {
      toast("Error adding reaction");
    },
  });
  //remove reaction to post
  const removeReactionMutation = useDeleteReaction({
    onSuccess: () => {
      notifyRemoveReaction();
    },
    onError: () => {
      toast({
        title: "Error removing reaction",
        description: "Please try again",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });
  const notifyAddReaction = () => {
    toast({
      title: "Reaction added",
      description: "You reacted to this post",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  const notifyRemoveReaction = () => {
    toast({
      title: "Reaction removed",
      description: "You removed your reaction to this post",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  const handleAddReaction = (emoji) => {
    addReactionMutation.mutate({
      postId,
      emoji,
    });
  };
  const handleRemoveReaction = (emoji) => {
    removeReactionMutation.mutate({
      postId,
      emoji,
    });
  };
  const handleReaction = (reaction) => {
    if (emoji === reaction) {
      handleRemoveReaction(reaction);
      setEmoji(null);
    } else {
      handleAddReaction(reaction);
      setEmoji(reaction);
    }
  };

  return (
    <li
      className="flex justify-start items-end gap-3 p-1 w-max max-w-175"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className={chatHolderStyle}>
        {/* Post Image */}
        {imgUrl && (
          <button
            onClick={handleImageDownload}
            aria-label="Download post image"
            title="Download post image"
          >
            <img
              src={imgUrl}
              alt="Post content"
              className={IMAGE_STYLES.post}
            />
          </button>
        )}

        {/* Post Text */}
        {text && <p className="text-sm">{text}</p>}

        {/* Post Actions and Metadata */}
        <div className="flex justify-between items-center relative p-3">
          {/* Commenter's and Comment Count */}
          <div className="flex items-center w-max justify-baseline mx-4 h-3">
            {reactions.length > 0 &&
              reactions.map((reaction) => (
                <button
                  key={reaction.id}
                  className="text-sm text-gray-600 mr-1"
                  aria-label={`Reacted with ${reaction.emoji}`}
                  title={`${currentUser.id === reaction.userId ? "You Reacted with " + reaction.emoji : ""}`}
                  type="button"
                >
                  {reaction.emoji}
                </button>
              ))}
            {comments.length > 0 && (
              <>
                {commenterUsers.map((commenter, index) => (
                  <CommenterImage
                    key={commenter.user.id}
                    index={index}
                    user={commenter.user}
                    imgUrl={commenter.imgUrl}
                    onProfileOpen={onProfileOpen}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {commentCount}
                </span>
              </>
            )}

            {/* Admin Kebab Menu */}
            {isAdmin && hovered && (
              <div className="ml-2">
                <button
                  aria-label="Open post menu"
                  onClick={handleMenuToggle}
                  type="button"
                >
                  <CiMenuKebab className={ICON_STYLES.kebab} />
                </button>
              </div>
            )}

            {menuOpen && (
              <KebabMenu
                onDelete={() => onDeletePost(postId)}
                onEdit={() => onEditPost(postId)}
              />
            )}

            {/* Reply/Comment Link */}
            <Link to={`/post/discussion/${postId}?groupId=${groupId}`}>
              <button aria-label="Reply to post" title="comments" type="button">
                <IoArrowForwardCircleSharp
                  aria-hidden="true"
                  className={ICON_STYLES.reply}
                />
              </button>
            </Link>
          </div>

          {/* Reaction Button (non-admin only) */}
          {!isAdmin && hovered && (
            <div>
              <Reaction onSelect={handleReaction} />
            </div>
          )}
        </div>

        {/* Post Metadata (Author and Timestamp) */}
        {post?.created && (
          <div className="flex justify-end items-center gap-2 text-sm text-gray-500">
            {username && (
              <span key={username} className="font-medium">
                {username}
              </span>
            )}
            <time className="flex flex-col" dateTime={post.created}>
              <p>{getMonthAndYear(post.created)}</p>
              <p>{getTheTime(post.created)}</p>
            </time>
          </div>
        )}
      </div>
    </li>
  );
}

export default GroupPost;
