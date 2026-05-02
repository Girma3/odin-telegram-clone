import { useState, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import { CiMenuKebab } from "react-icons/ci";
import { Link } from "react-router-dom";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaRegMessage } from "react-icons/fa6";
import {
  useGetReactions,
  useAddReaction,
  useDeleteReaction,
} from "../hooks/useReaction";
import { useGetProfileByUser } from "../../profile/hooks/useProfile";
import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import KebabMenu from "../../chat/components/KebabMenu";
import {
  formatDate,
  getMonthAndYear,
  getTheTime,
} from "../../../services/helperFns";
import CommenterUser from "./CommenterUser";

// Constants
const ICON_STYLES = {
  link: `w-8 h-8 fill-pink-400 transition-all duration-300 ease-in-out rounded-full hover:fill-white cursor-pointer`,
  kebab: `w-6 h-6 fill-pink-300 hover:fill-green-400`,
};
const IMAGE_STYLES = {
  post: `min-w-6 h-60 rounded-2 shadow-md object-cover ring-1 ring-pink-400`,
  commenter: `w-8 h-8 rounded-full object-cover border-2 ring-gray-600 ring-1 border-gray-700`,
};

// Helper function to get commenter image with error handling
function getCommenterUser(users, comment) {
  if (!comment || !users) return null;
  const user = users.find((u) => u.userId === comment.userId);
  if (!user) return null;
  const { id, username } = user?.user;
  return user;
}

// Helper function to format comment count
function formatCommentCount(count) {
  if (count === 0) return "No comments";
  if (count === 1) return "1 comment";
  return `${count} comments`;
}

// Component for displaying commenter profile images
function CommenterImage({ index, onProfileOpen, user }) {
  if (!user) return null;
  const { id, username } = user;
  const { data: profile, isSuccess, isLoading } = useGetProfileByUser(id);
  if (!isSuccess && !isLoading) return null;
  const handleClick = () => {
    if (onProfileOpen && user) {
      onProfileOpen({ type: "user", user: user, profile: profile });
    }
  };

  const imgUrl = profile?.avatarUrl;

  return (
    <button
      key={username + index}
      aria-label={`View ${username || "user"}'s profile`}
      className="w-12"
      onClick={handleClick}
      title={`${username || "User"}'s profile`}
      type="button"
    >
      <img
        src={imgUrl}
        alt={`${username || "User"}'s profile`}
        className={`${IMAGE_STYLES.commenter} ${index > 0 ? "-ml-5" : ""}`}
        loading="lazy"
      />
    </button>
  );
}

// Main GroupPost component
function GroupPost({
  users,
  post,
  isAdmin = false,
  isMember = false,
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

  const commenterUsersArr = () => {
    if (comments.length === 0) return [];
    const removeDuplicate = new Set(
      users.filter((user) =>
        comments.some((comment) => comment.userId === user.userId),
      ),
    );
    const uniqueUsers = Array.from(removeDuplicate);
    //slice at max 3 if it has
    let max = uniqueUsers.length > 3 ? 3 : uniqueUsers.length;
    const sliceComments = comments.slice(0, max);
    return sliceComments
      .map((comment) => getCommenterUser(uniqueUsers, comment))
      .filter(Boolean);
  };
  const commenterUsers = commenterUsersArr();
  //console.log(commenterUsers);
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
    if (!isMember)
      return toast({
        title: "Join the group to react",
        description: "You need to be a member of the group to react to posts",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    addReactionMutation.mutate({
      postId,
      emoji,
    });
  };
  const handleRemoveReaction = (emoji) => {
    if (!isMember)
      return toast({
        title: "Join the group to remove reaction",
        description:
          "You need to be a member of the group to remove reactions from posts",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    removeReactionMutation.mutate({
      postId,
      emoji,
    });
  };
  const handleReaction = (reaction) => {
    if (!isMember)
      return toast({
        title: "Join the group to react",
        description: "You need to be a member of the group to react to posts",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
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
      className="flex  justify-start items-end gap-3 p-1 w-max max-w-175"
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
              loading="lazy"
            />
          </button>
        )}

        {/* Post Text */}
        {text && <p className="text-sm">{text}</p>}
        <div className=" flex justify-between items-center py-2">
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

              <ToastContainer />
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
        <hr className="p-px border-none bg-linear-to-r from-green-700 to-amber-400 to-red-600" />

        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center ">
            {comments.length > 0 &&
              commenterUsers.map((commenter, index) => (
                <CommenterImage
                  key={commenter.user.id + index}
                  index={index}
                  user={commenter.user}
                  onProfileOpen={onProfileOpen}
                />
              ))}
            <div className="flex items-center  text-sm">
              <FaRegMessage className="fill-green-50 mx-2" />
              <p>
                {commentCount >= 1
                  ? `${commentCount} comments`
                  : `${commentCount} comment`}
                {commentCount === 0 && "Leave comment"}
              </p>
            </div>{" "}
          </div>
          <Link to={`/post/discussion/${postId}?groupId=${groupId}`}>
            <button
              aria-label="Go to post discussion"
              title="Go to post discussion"
            >
              {" "}
              <MdOutlineKeyboardArrowRight
                aria-hidden="true"
                className={ICON_STYLES.link}
              />
            </button>
          </Link>
        </div>
      </div>
    </li>
  );
}

export default GroupPost;
