import { useState } from "react";
import { FaReply } from "react-icons/fa";
import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import { CiMenuKebab } from "react-icons/ci";
import KebabMenu from "../../chat/components/KebabMenu";
import { Link } from "react-router-dom";
const iconStyle = `w-4 h-4 fill-pink-400  transition-all duration-300 ease-in-out rounded-full
  hover:fill-green-600 cursor-pointer`;
const imgStyle = `min-w-6 h-60 rounded-2 shadow-md object-cover ring-1 ring-pink-400`;

const liStyle = `flex justify-start items-end gap-3 p-2 relative`;

function GroupPost({ post, isAdmin, groupId, onProfileOpen }) {
  const { imgUrl, text, id, created, author } = post;
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const handlePost = () => {
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
      <div className={chatHolderStyle}>
        {imgUrl && (
          <button
            onClick={() => onProfileOpen({ type: "user", id: post.authorId })}
            aria-label="show profile"
            title="show profile"
          >
            <img
              src={` ${imgUrl}
            `}
              alt="post"
              className={imgStyle}
            />
          </button>
        )}
        {text && <p>{text}</p>}
        <div className="flex justify-end items-center relative p-3">
          <div className="flex items-center w-max justify-baseline mx-4 h-3  ">
            {isAdmin && hovered && (
              <div>
                {" "}
                <button aria-label="kebab menu" onClick={handlePost}>
                  <CiMenuKebab className="w-6 h-6   fill-pink-300 hover:fill-green-400" />
                </button>
              </div>
            )}

            {menuOpen && <KebabMenu />}
            <Link to={`/post/discussion/${id}?groupId=${groupId}`}>
              <button aria-label="comment">
                <FaReply className={iconStyle} />
              </button>
            </Link>
          </div>
          {/* admin can't react to there post*/}

          {!isAdmin && hovered && <Reaction />}
        </div>{" "}
        {created && (
          <div className="flex justify-end items-center">
            <p>{author}</p>
            <span>{created}</span>
          </div>
        )}
      </div>
    </li>
  );
}

export default GroupPost;
