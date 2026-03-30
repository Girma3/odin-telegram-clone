import { useState } from "react";
//import ChatWithComment from "../../chat/components/ChatWithComment";
import Modal from "../../profile/components/Modal";
import ProfileCard from "../../profile/components/ProfileCard";
import Discussion from "./Discussion";
import UserComment from "./UserComment";
import { Link, useParams } from "react-router-dom";
import GroupPost from "./GroupPost";
import ProfileGroup from "../../profile/components/ProfileGroup";
const header = `bg-gray-700 p-4 `;
const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-green-300 offset-2`;

function GroupChat({ groups, onProfileOpen, onClose }) {
  let groupId = useParams();
  groupId = parseInt(groupId.id);
  const group = groups.find((group) => group.id === groupId);
  if (!group) return null;
  const { id, imgUrl, msg, name, members, posts } = group;

  let membersCount = members > 1 ? `${members} members` : `${members} member`;

  return (
    <div>
      <div className={header}>
        <button
          onClick={() => onProfileOpen({ type: "group", id: id })}
          aria-label="show profile"
          title="show group profile"
        >
          <img
            src={`${imgUrl}`}
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
        </button>

        <div className="flex flex-col">
          <p>{name}</p>
          <p>{membersCount}</p>
        </div>
      </div>

      <ul className="flex flex-col gap-2 justify-between p-2">
        {posts.map((post) => (
          <GroupPost
            key={post.id}
            post={post}
            groupId={groupId}
            isAdmin={true}
            onProfileOpen={onProfileOpen}
          />
        ))}
      </ul>
    </div>
  );
}

export default GroupChat;
