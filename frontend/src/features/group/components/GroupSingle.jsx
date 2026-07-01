import { useState } from "react";
import { Link } from "react-router-dom";

const STYLES = {
  chatHolder: `
  text-xs text-amber-100
  w-full min-w-[140px] rounded-md bg-black border border-white/10 p-4 shadow-sm
  transition-all duration-300
  hover:shadow-[0_0_6px_rgba(59,130,246,0.6)]
  hover:border-blue-500/50 cursor-pointer
  hover:transform-scale-105
`,

  avatar: `
    rounded-full w-10 h-10 shadow-md object-cover ring-3
  `,
  name: `
    sm:text-xs text-[0.5rem] font-semibold text-amber-100
  `,
  message: `
    text-[0.5rem] text-amber-100 word-break
  `,
  notification: `
    flex items-center justify-center
    rounded-full w-4 h-4 bg-green-500 text-black
    text-[0.6rem] font-bold
  `,
};

function GroupSingle({ group = null }) {
  if (!group || !group.profile) return null;
  const { profile, name, id, _count } = group;
  const { avatarUrl, bio } = profile;

  let previewText = bio ? bio.slice(0, 20) + "..." : "no bio yet";

  return (
    <li
      className={`${STYLES.chatHolder} animate-slideUp duration-200 ease-in-out list-none`}
    >
      <Link
        to={`/group/${id}`}
        className="flex justify-between items-center w-full"
        state={{ groupData: group }}
      >
        {/* Left side: avatar + text */}
        <div className="flex items-center gap-2">
          <img
            src={`${avatarUrl}`}
            alt="profile"
            className={STYLES.avatar}
            loading="lazy"
          />
          <div className="flex flex-col items-center justify-between">
            <p className={STYLES.name}>{name}</p>
            <p className={STYLES.message}>{previewText}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default GroupSingle;
