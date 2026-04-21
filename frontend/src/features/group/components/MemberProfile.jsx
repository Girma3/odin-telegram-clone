import React, { useState, useRef, useEffect } from "react";
import { useGetProfileByUser } from "../../profile/hooks/useProfile";
import Modal from "../../profile/components/Modal.jsx";
import { IoMdCloseCircle } from "react-icons/io";

const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-pink-400 object-cover ring-offset-1
 ring-green-300 relative`;

const MemberItem = React.memo(function MemberItem({
  member,
  onProfileOpen,
  currentUser,
}) {
  const { data: profile, isSuccess } = useGetProfileByUser(member?.userId);
  if (!isSuccess) return <li className="animate-pulse">Loading...</li>;
  return (
    <li
      className="flex items-center gap-3 p-2 hover:bg-gray-700/50 cursor-pointer"
      onClick={() =>
        onProfileOpen({
          type: "user",
          user: profile,
          isSelf: currentUser === profile?.userId,
        })
      }
    >
      <img src={profile?.avatarUrl} alt="profile" className={imgStyle} />
      <div>
        <span className="text-stone-200 font-medium text-sm">
          {member?.username}
        </span>
        <span className="text-stone-400 text-xs">
          {profile?.bio?.slice(0, 30) || profile?.location || "No info"}
        </span>
      </div>
    </li>
  );
});

function MemberListModal({
  isOpen,
  onClose,
  members,
  currentUser,
  onProfileOpen,
}) {
  const listRef = useRef(null);
  const [headerText, setHeaderText] = useState("Group members");

  useEffect(() => {
    const handleScroll = () => {
      setHeaderText(
        listRef.current?.scrollTop > 0 ? "Members" : "Group members",
      );
    };
    const listEl = listRef.current;
    if (listEl) {
      listEl.addEventListener("scroll", handleScroll);
      return () => listEl.removeEventListener("scroll", handleScroll);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gray-800 w-full max-w-md rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-3 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
          <h2 className="text-stone-200 font-semibold text-lg">{headerText}</h2>
          <button
            onClick={onClose}
            aria-label="close members list"
            className="text-gray-400 hover:text-stone-200"
          >
            <IoMdCloseCircle className="w-6 h-6 fill-gray-400 hover:fill-stone-200" />
          </button>
        </div>
        <ul ref={listRef} className="max-h-80 overflow-y-auto">
          {members?.map((member) => (
            <MemberItem
              key={member?.id || member?.userId}
              member={member}
              onProfileOpen={onProfileOpen}
              currentUser={currentUser}
            />
          ))}
          {(!members || members.length === 0) && (
            <li className="p-4 text-center text-gray-400">No members yet</li>
          )}
        </ul>
        <div className="p-2 border-t border-gray-700 text-center text-gray-400 text-sm">
          {members?.length || 0} members
        </div>
      </div>
    </Modal>
  );
}

function MemberList({ members, currentUser, onProfileOpen, onMemberListOpen }) {
  return (
    <div>
      {onMemberListOpen ? (
        <button
          onClick={onMemberListOpen}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
        >
          <span>{members?.length || 0} members</span>
        </button>
      ) : (
        <ul className=" flex-1 overflow-y-auto">
          {members.map((member) => (
            <MemberItem
              key={member?.id || member?.userId}
              member={member}
              onProfileOpen={onProfileOpen}
              currentUser={currentUser}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

export { MemberList, MemberListModal };
export default MemberList;
