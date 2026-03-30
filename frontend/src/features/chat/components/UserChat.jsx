import { useState } from "react";
import { Link } from "react-router-dom";

const chatHolderStyle = `
  text-xs text-amber-100
  w-full min-w-[140px] rounded-md bg-white/5 border border-white/10 p-4 shadow-sm
  transition-all duration-300
  hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
  hover:border-blue-500/50 cursor-pointer
  hover:transform-scale-105
`;

const imgStyle = `
  rounded-full sm:w-6 sm:h-6 w-5 h-5 shadow-md
`;

const nameStyle = `
  sm:text-xs text-[0.5rem] font-semibold text-amber-100
`;

const msgStyle = `
  text-[0.5rem] text-amber-100 word-break
`;

const notificationStyle = `
  flex items-center justify-center
  rounded-full w-3 h-3 bg-blue-600 text-white
  text-[0.5rem] font-bold
`;

function UserChat({ user = null }) {
  if (!user) return null;
  return (
    <li
      className={`${chatHolderStyle} animate-slideUp duration-200 ease-in-out`}
    >
      <Link
        to={`/chat/${user.id}`}
        className="flex justify-between items-center w-full"
      >
        {/* Left side: avatar + text */}
        <div className="flex items-center gap-2">
          <img src={user.imgUrl} alt="profile" className={imgStyle} />
          <div>
            <p className={nameStyle}>{user.name}</p>
            <p className={msgStyle}>{user.msg}</p>
          </div>
        </div>

        <div className={notificationStyle}>3</div>
      </Link>
    </li>
  );
}

export default UserChat;
