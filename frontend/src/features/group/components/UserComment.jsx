import { useState } from "react";
import { FaReply } from "react-icons/fa";
import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import { CiMenuKebab } from "react-icons/ci";
import KebabMenu from "../../chat/components/KebabMenu";
import { Link } from "react-router-dom";
import { useUpdateComment } from "../hooks/useComments";
import { IoArrowForwardCircleSharp } from "react-icons/io5";

const iconStyle = `w-4 h-4 fill-pink-400  transition-all duration-300 ease-in-out rounded-full
  hover:fill-green-600 cursor-pointer`;
const imgStyle = `w-6 h-6 rounded-full shadow-md ring-1 ring-pink-400  object-cover ring-offset-1
 ring-green-300 relative bottom-0`;
const liStyle = `flex justify-start items-end gap-3 p-2 relative`;

function UserComment({
  user,
  comment,
  owner = false,
  onProfileOpen,
  onCommentDelete,
  onCommentEdit,
  onNestedComment,
  mode = "comment",
}) {
  const { text, created, id: commentId, userId, parentId, postId } = comment;
  const { avatarUrl } = comment?.author?.profile;
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handlePost = ({ onProfileOpen }) => {
    setMenuOpen((prev) => !prev);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setMenuOpen(false);
  };

  return (
    <li
      className="flex justify-start  items-end gap-3 p-1 w-max max-w-175 "
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <button
        aria-label="profile"
        onClick={() =>
          onProfileOpen({ type: "user", user: user, isSelf: false })
        }
      >
        <img
          src={`${avatarUrl}`}
          alt="profile"
          className={imgStyle}
          loading="lazy"
        />
      </button>
      <div className={chatHolderStyle}>
        {/* comment can't have image for now */}
        {/* {imgUrl && (
          <img
            src={` ${imgUrl}
          `}
            alt="post"
            className="rounded-sm"
            loading="lazy"
          />
        )} */}
        {text && <p>{text}</p>}
        <p className="text-amber-400">
          is current user author {owner ? "yes" : "no"}
        </p>

        <div className="flex justify-end items-center relative p-1">
          <div className="flex items-center w-max justify-baseline mx-4 h-3 ">
            {owner && hovered && (
              <div>
                {" "}
                <button aria-label="kebab menu" onClick={handlePost}>
                  <CiMenuKebab className="w-6 h-6  fill-pink-300 hover:fill-green-400" />
                </button>
              </div>
            )}
            {menuOpen && (
              <KebabMenu
                onEdit={() => onCommentEdit(commentId)}
                onDelete={() => onCommentDelete(commentId, postId)}
              />
            )}

            <button
              aria-label={mode === "reply" ? "reply" : "show comments"}
              title={mode === "reply" ? "reply" : "show comments"}
              onClick={() => onNestedComment(commentId)}
            >
              {mode === "reply" ? (
                <FaReply aria-hidden="true" className={iconStyle} />
              ) : (
                <IoArrowForwardCircleSharp
                  aria-hidden="true"
                  className={iconStyle}
                />
              )}
            </button>
          </div>
          {/* Hover reactions */}
          {!owner && hovered && <Reaction />}
        </div>
      </div>
    </li>
  );
}

export default UserComment;
