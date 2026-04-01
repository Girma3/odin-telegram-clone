import { useState, useMemo } from "react";
import { FaReply } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { Link } from "react-router-dom";
import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import KebabMenu from "../../chat/components/KebabMenu";

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
}) {
  const { imgUrl, text, id, created, author } = post;
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Memoize derived data to avoid recalculation on every render
  const comments = useMemo(() => post.comments || [], [post.comments]);
  const commentCount = useMemo(
    () => formatCommentCount(comments.length),
    [comments.length],
  );

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

            {menuOpen && <KebabMenu />}

            {/* Reply/Comment Link */}
            <Link to={`/post/discussion/${id}?groupId=${groupId}`}>
              <button aria-label="Reply to post" type="button">
                <FaReply className={ICON_STYLES.reply} />
              </button>
            </Link>
          </div>

          {/* Reaction Button (non-admin only) */}
          {!isAdmin && hovered && (
            <div>
              <Reaction />
            </div>
          )}
        </div>

        {/* Post Metadata (Author and Timestamp) */}
        {created && (
          <div className="flex justify-end items-center gap-2 text-sm text-gray-500">
            {author && <span className="font-medium">{author}</span>}
            <time dateTime={created}>{created}</time>
          </div>
        )}
      </div>
    </li>
  );
}

export default GroupPost;
