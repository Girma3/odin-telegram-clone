import { useState } from "react";
import { FaReply } from "react-icons/fa";
import { CiMenuKebab } from "react-icons/ci";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import KebabMenu from "../../chat/components/KebabMenu";
import Reaction from "../../chat/Reaction";
import useOnlineUsers from "../../websocket/hooks/useOnlineUsers";

function UserComment({
  user,
  profile,
  comment,
  owner = false,
  currentUser,
  onProfileOpen,
  onCommentDelete,
  onCommentEdit,
  onNestedComment,
  mode = "comment",
}) {
  if (!user || !comment) return null;

  const { text, id: commentId, userId, postId } = comment;
  const { onlineUsers } = useOnlineUsers();
  const isOnline = onlineUsers.includes(userId);

  // Safe defensive data targeting
  const profileData = profile || {};
  const avatarUrl = profileData?.avatarUrl || "/images/jet.jpg";
  const username = comment?.author?.username || "User";
  const authorDeleted = comment?.author?.isDeleted;
  if (authorDeleted) return null;

  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleMouseLeave = () => {
    setHovered(false);
    setMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (!onProfileOpen) return;
    onProfileOpen({
      type: "user",
      user: comment?.author || user,
      isSelf: currentUser === userId,
      profile: profileData,
    });
  };

  return (
    <div
      className="group/comment flex 
      items-start gap-3 p-3 w-full max-w-2xl rounded-xl
       animate-[fadeIn_2s_ease-out] transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* Interactive Avatar Container */}
      <button
        type="button"
        aria-label={`View ${username}'s profile`}
        title={`Show ${username}'s profile`}
        onClick={handleProfileClick}
        className="relative shrink-0 active:scale-95 transition-transform duration-150"
      >
        <img
          src={avatarUrl}
          alt={`${username}'s avatar`}
          className="w-8 h-8 rounded-full shadow-md border border-zinc-800 object-cover"
          loading="lazy"
        />
        <span
          className={` absolute bottom-0 right-0 w-2 h-2 
          ${isOnline ? "bg-green-500" : "bg-zinc-800"} rounded-full border border-zinc-950 shadow-sm`}
        />
      </button>

      {/* Main Comment Text Core */}
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-300 hover:text-white cursor-pointer transition-colors">
            {username}
          </span>
        </div>

        {/* Text bubble element */}
        <div className="rounded-2xl rounded-tl-none bg-zinc-900/60 border border-zinc-800/50 px-4 py-2.5 text-zinc-200 text-[14px] leading-relaxed shadow-sm break-words selection:bg-violet-500/30">
          {text && <p>{authorDeleted ? "[Deleted Comment]" : text}</p>}
        </div>

        {/* Dynamic Action Interaction Row */}
        <div className="flex items-center gap-4 h-5 mt-1 px-1">
          <div className="flex items-center gap-2.5">
            {/* Contextual Action Trigger */}
            <button
              type="button"
              aria-label={
                mode === "reply" ? "Reply to comment" : "Show comment thread"
              }
              title={mode === "reply" ? "Reply" : "Thread View"}
              onClick={() => onNestedComment(commentId)}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-violet-400 font-medium transition-colors group/btn"
            >
              {authorDeleted ? null : mode === "reply" ? (
                <>
                  <FaReply className="w-3 h-3 group-hover/btn:-translate-x-0.5 transition-transform" />
                  <span>Reply</span>
                </>
              ) : (
                <>
                  <IoArrowForwardCircleSharp className="w-4 h-4 text-zinc-500 group-hover/btn:text-violet-400 group-hover/btn:scale-105 transition-all" />
                  <span>View Thread</span>
                </>
              )}
            </button>
          </div>

          {/* Context Management Section */}

          <div className="relative flex items-center">
            {owner && (
              <button
                type="button"
                aria-label="Comment options"
                onClick={toggleMenu}
                className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all"
              >
                <CiMenuKebab
                  className={`w-5 h-5 transition-transform duration-200 ${menuOpen ? "rotate-90 text-violet-400" : ""}`}
                />
              </button>
            )}

            {menuOpen && (
              <div className="absolute left-0 top-6 z-20 animate-fade-in">
                <KebabMenu
                  onEdit={() => {
                    onCommentEdit(commentId);
                    setMenuOpen(false);
                  }}
                  onDelete={() => {
                    onCommentDelete(commentId, postId);
                    setMenuOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Fixed React Evaluation Condition Banner */}
          {!owner && mode !== "reply" && hovered && (
            <div className="animate-fade-in ml-auto">
              <Reaction />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserComment;
