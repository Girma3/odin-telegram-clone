// import React, { useState, useRef, useEffect } from "react";
// import { useGetProfileByUser } from "../../profile/hooks/useProfile";
// import Modal from "../../profile/components/Modal.jsx";
// import { IoMdCloseCircle } from "react-icons/io";

// const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-pink-400 object-cover ring-offset-1
//  ring-green-300 relative`;

// const MemberItem = React.memo(function MemberItem({
//   member,
//   admin,
//   onProfileOpen,
//   currentUser,
// }) {
//   const { id: userId, username } = member?.user || {};
//   const { data: profile, isSuccess } = useGetProfileByUser(userId);
//   if (!isSuccess) return <li className="animate-pulse">Loading...</li>;

//   return (
//     <li
//       className="flex items-center gap-3 p-2 hover:bg-gray-700/50 cursor-pointer"
//       onClick={() =>
//         onProfileOpen({
//           type: "user",
//           user: member.user,
//           profile: profile,
//           username: username,
//           isSelf: currentUser === profile?.userId,
//         })
//       }
//     >
//       <img src={profile?.avatarUrl} alt="profile" className={imgStyle} />
//       <div>
//         <span className="text-stone-200 font-medium text-sm">
//           {member?.username}
//         </span>
//         <span className="text-stone-400 text-xs">
//           {profile?.bio?.slice(0, 32) + " ..." ||
//             profile?.location ||
//             "No info"}
//         </span>
//         <span className="text-green-400 text-xs">
//           {profile?.userId === admin ? "admin" : null}
//         </span>
//       </div>
//     </li>
//   );
// });

// function MemberListModal({
//   isOpen,
//   onClose,
//   admin,
//   members,
//   currentUser,
//   onProfileOpen,
// }) {
//   const listRef = useRef(null);
//   const [headerText, setHeaderText] = useState("Group members");
//   useEffect(() => {
//     const handleScroll = () => {
//       setHeaderText(
//         listRef.current?.scrollTop > 0 ? "Members" : "Group members",
//       );
//     };
//     const listEl = listRef.current;
//     if (listEl) {
//       listEl.addEventListener("scroll", handleScroll);
//       return () => listEl.removeEventListener("scroll", handleScroll);
//     }
//   }, [isOpen]);

//   return (
//     <Modal isOpen={isOpen} onClose={onClose}>
//       <div className="bg-gray-800 w-full max-w-md rounded-lg overflow-hidden max-h-[90vh] flex flex-col">
//         <div className="flex items-center justify-between p-3 border-b border-gray-700 sticky top-0 bg-gray-800 z-10">
//           <h2 className="text-stone-200 font-semibold text-lg">{headerText}</h2>
//           <button
//             onClick={onClose}
//             aria-label="close members list"
//             className="text-gray-400 hover:text-stone-200"
//           >
//             <IoMdCloseCircle className="w-6 h-6 fill-gray-400 hover:fill-stone-200" />
//           </button>
//         </div>
//         <ul ref={listRef} className="max-h-80 overflow-y-auto">
//           {members?.map((member) => (
//             <MemberItem
//               key={member?.id || member?.userId}
//               member={member}
//               onProfileOpen={onProfileOpen}
//               currentUser={currentUser}
//               admin={admin}
//             />
//           ))}
//           {(!members || members.length === 0) && (
//             <li className="p-4 text-center text-gray-400">No members yet</li>
//           )}
//         </ul>
//         <div className="p-2 border-t border-gray-700 text-center text-gray-400 text-sm">
//           {members?.length || 0} members
//         </div>
//       </div>
//     </Modal>
//   );
// }

// function MemberList({ members, currentUser, onProfileOpen, onMemberListOpen }) {
//   return (
//     <div>
//       {onMemberListOpen ? (
//         <button
//           onClick={onMemberListOpen}
//           className="flex items-center gap-2 text-amber-400 hover:text-amber-300 text-sm"
//         >
//           <span>{members?.length || 0} members</span>
//         </button>
//       ) : (
//         <ul className=" flex-1 overflow-y-auto">
//           {members.map((member) => (
//             <MemberItem
//               key={member?.id || member?.userId}
//               member={member}
//               onProfileOpen={onProfileOpen}
//               currentUser={currentUser}
//             />
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

// export { MemberList, MemberListModal };
// export default MemberList;
import React, { useRef, useState, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import Modal from "../../profile/components/Modal.jsx";

// Modernized avatar layout with fallback support
const imgStyle = `w-10 h-10 rounded-full shadow-md border border-neutral-700/50 object-cover ring-2 ring-emerald-500/20 relative shrink-0`;

const MemberItem = React.memo(function MemberItem({
  member,
  admin,
  onProfileOpen,
  currentUser,
}) {
  // Destructure with fallbacks to avoid application runtime syntax crashes
  const user = member?.user || {};
  const profile = member?.profile || {}; // Note: Pulling profile directly from data stream now
  const username = member?.username || user?.username || "Unknown Member";

  const isSelf = currentUser === profile?.userId || currentUser === user?.id;
  const isAdmin = user?.id === admin || profile?.userId === admin;

  return (
    <li
      className="flex items-center gap-3 p-2.5 mx-2 my-1 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all duration-200 cursor-pointer group"
      onClick={() =>
        onProfileOpen?.({
          type: "user",
          user: user,
          profile: profile,
          username: username,
          isSelf: isSelf,
        })
      }
    >
      {profile?.avatarUrl ? (
        <img src={profile.avatarUrl} alt={username} className={imgStyle} />
      ) : (
        <div
          className={`${imgStyle} bg-neutral-800 flex items-center justify-between text-neutral-400 font-bold text-xs uppercase pl-3`}
        >
          {username.slice(0, 2)}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-neutral-200 font-medium text-[14px] truncate group-hover:text-white transition-colors">
            {username}
          </span>
          {isAdmin && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-md uppercase">
              Admin
            </span>
          )}
          {isSelf && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md uppercase">
              You
            </span>
          )}
        </div>
        <p className="text-neutral-400 text-xs truncate mt-0.5">
          {profile?.bio
            ? profile.bio.slice(0, 45) + "..."
            : profile?.location || "click for more info"}
        </p>
      </div>
    </li>
  );
});

function MemberListModal({
  isOpen,
  onClose,
  admin,
  members,
  currentUser,
  onProfileOpen,
  isLoading, // Added an explicit layout loader flag
}) {
  const listRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleScroll = () => {
      setIsScrolled(listEl.scrollTop > 10);
    };

    listEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => listEl.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-neutral-900/95 border border-white/10 backdrop-blur-xl w-full max-w-md rounded-2xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl animate-fade-in">
        {/* Animated Dynamic Header Panel */}
        <div
          className={`flex items-center justify-between p-4 border-b transition-all duration-300 bg-neutral-900/40 z-10 ${
            isScrolled
              ? "border-neutral-800 shadow-md backdrop-blur-md"
              : "border-transparent"
          }`}
        >
          <h2 className="text-neutral-100 font-semibold text-base tracking-wide transition-all">
            {isScrolled ? "Members" : "Group Members"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close members list"
            className="text-neutral-500 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <IoMdCloseCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Member Directory Node Wrapper */}
        <ul
          ref={listRef}
          className="flex-1 overflow-y-auto py-2 custom-scrollbar max-h-96"
        >
          {isLoading ? (
            // Dedicated High Fidelity Rendering Skeleton Block
            Array.from({ length: 4 }).map((_, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 p-3 mx-2 my-1 animate-pulse"
              >
                <div className="w-10 h-10 rounded-full bg-neutral-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-1/3" />
                  <div className="h-3 bg-neutral-800 rounded w-2/3" />
                </div>
              </li>
            ))
          ) : members && members.length > 0 ? (
            members.map((member) => (
              <MemberItem
                key={member?.id || member?.userId}
                member={member}
                onProfileOpen={onProfileOpen}
                currentUser={currentUser}
                admin={admin}
              />
            ))
          ) : (
            <li className="p-8 text-center text-neutral-500 text-sm">
              No members found in this group
            </li>
          )}
        </ul>

        {/* Informational Footer Node */}
        <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/40 text-center text-neutral-400 font-medium text-xs tracking-wider uppercase">
          {members?.length || 0} Total Members
        </div>
      </div>
    </Modal>
  );
}

function MemberList({ members, currentUser, onProfileOpen, onMemberListOpen }) {
  if (onMemberListOpen) {
    return (
      <button
        onClick={onMemberListOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 hover:text-amber-300 transition-all font-medium text-xs rounded-xl shadow-sm"
      >
        <span>{members?.length || 0} Members</span>
      </button>
    );
  }

  return (
    <ul className="w-full overflow-y-auto">
      {members?.map((member) => (
        <MemberItem
          key={member?.id || member?.userId}
          member={member}
          onProfileOpen={onProfileOpen}
          currentUser={currentUser}
        />
      ))}
    </ul>
  );
}

export { MemberList, MemberListModal };
export default MemberList;
