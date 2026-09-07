import { useState } from "react";
import { FaReply } from "react-icons/fa";
import { chatHolderStyle } from "./PostByUser";
import Reaction from "../../chat/Reaction";
import { CiMenuKebab } from "react-icons/ci";
import KebabMenu from "../../chat/components/KebabMenu";
import { Link } from "react-router-dom";
const iconStyle = `w-4 h-4 fill-pink-400  transition-all duration-300 ease-in-out rounded-full
  hover:fill-green-600 cursor-pointer`;
const imgStyle = `w-6 h-6 rounded-full shadow-md ring-1 ring-pink-400  object-cover ring-offset-1
 ring-green-300 relative bottom-0`;
const liStyle = `flex justify-start items-end gap-3 p-2 relative`;

function UserComment({ user, comment, onProfileOpen }) {
  const { text, created, id } = comment;
  const [hovered, setHovered] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { profile } = user;
  const { avatarUrl } = profile || {};
  const owner = comment.userId === user.id;
  const handlePost = ({ onProfileOpen }) => {
    setMenuOpen((prev) => !prev);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setMenuOpen(false);
  };
  return (
    <div
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
        {text && <p className="p-2 wrap-break-word">{text}</p>}

        <div className="flex justify-end items-center relative p-1">
          <div className="flex items-center w-max justify-baseline mx-4 h-3 ">
            {owner && hovered && (
              <div>
                {" "}
                <button aria-label="menu" onClick={handlePost}>
                  <CiMenuKebab
                    className={`w-6 h-6 fill-pink-300 hover:fill-green-400 transition-transform duration-200 ${
                      menuOpen ? "rotate-90" : ""
                    }`}
                  />
                </button>
              </div>
            )}

            {menuOpen && <KebabMenu />}
            <Link to={`comments/${id}`}>
              <button aria-label="reply">
                <FaReply className={iconStyle} />
              </button>
            </Link>
          </div>
          {/* Hover reactions */}
          {!owner && hovered && <Reaction />}
        </div>
      </div>
    </div>
  );
}

export default UserComment;
