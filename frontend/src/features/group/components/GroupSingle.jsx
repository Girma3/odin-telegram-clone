import { useState } from "react";
import { Link } from "react-router-dom";

const chatHolderStyle = `
  text-xs text-amber-100
  w-full min-w-[140px] rounded-md bg-black border border-white/10 p-4 shadow-sm
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

function GroupSingle({ group = null }) {
  if (!group) return null;
  const { profile, name, id, posts } = group;
  const { avatarUrl } = profile;
  let lasPost =
    posts.length > 0 ? posts[posts.length - 1].text : "no posts yet";
  let lastImgPost = posts.length > 0 ? posts[posts.length - 1].imgUrl : null;

  let previewText =
    posts.length > 0
      ? posts[posts.length - 1].text.slice(0, 20) + "..."
      : "no posts yet";

  return (
    <li
      className={`${chatHolderStyle} animate-slideUp duration-200 ease-in-out`}
    >
      <Link
        to={`/group/${id}`}
        className="flex justify-between items-center w-full"
      >
        {/* Left side: avatar + text */}
        <div className="flex items-center gap-2">
          <img
            src={`${avatarUrl}`}
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
          <div className="flex flex-col items-center justify-between">
            <p className={nameStyle}>{name}</p>
            {lastImgPost && (
              <img
                src={`${lastImgPost}`}
                alt="last post"
                className="w-6 h-6 object-cover "
              />
            )}
            {posts.length > 0 && !lastImgPost && (
              <p className={msgStyle}>{previewText}</p>
            )}
          </div>
        </div>

        <div className={notificationStyle}>33</div>
      </Link>
    </li>
  );
}

export default GroupSingle;
