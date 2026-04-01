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
  rounded-full w-10 h-10 shadow-md object-cover ring-3  
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

function UserChat({ user, privateChats, currentUser }) {
  const { profile, username } = user || {};
  const status = user?.status || "OFFLINE";

  if (!currentUser) return null;

  const chatsWithUser = privateChats.filter(
    (chat) =>
      (chat.senderId === currentUser.id && chat.receiverId === user.id) ||
      (chat.senderId === user.id && chat.receiverId === currentUser.id),
  );
  const lastMessage =
    chatsWithUser.length > 0 ? chatsWithUser[chatsWithUser.length - 1] : null;
  const previewText =
    lastMessage && lastMessage.text && lastMessage.text.trim() !== ""
      ? lastMessage.text.length > 20
        ? lastMessage.text.slice(0, 20) + "..."
        : lastMessage.text
      : "send message";
  //console.log(user.id, currentUser.id);

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
          <img
            src={profile.avatarUrl}
            alt="profile"
            className={`${imgStyle} ${status === "ONLINE" ? "ring-green-500" : "ring-gray-500"}`}
          />
          <div>
            <p className={nameStyle}>{username}</p>
            <p className={msgStyle}>{previewText}</p>
          </div>
        </div>

        <div className={notificationStyle}>3</div>
      </Link>
    </li>
  );
}

export default UserChat;
