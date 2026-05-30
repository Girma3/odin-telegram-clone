import React, { useRef, useState, useEffect } from "react";
import { IoMdCloseCircle } from "react-icons/io";
import { useQueries } from "@tanstack/react-query";
import Modal from "../../profile/components/Modal.jsx";
import {
  profileByUserKey,
  useGetProfileByUser,
} from "../../profile/hooks/useProfile.js";

const imgStyle = `w-10 h-10 rounded-full
 shadow-md border border-neutral-700/50 object-cover ring-2 ring-emerald-500/20 relative shrink-0`;

const MemberItem = React.memo(function MemberItem({
  member,
  profile,
  admin,
  onProfileOpen,
  currentUser,
}) {
  const user = member?.user || {};
  const username = member?.username || user?.username || "Unknown Member";
  const userId = user?.id || member?.userId;

  const isSelf = currentUser === userId;
  const isAdmin = userId === admin;

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
          className={`${imgStyle} bg-neutral-800 flex items-center justify-center text-neutral-400 font-bold text-xs uppercase tracking-wider`}
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

        {/* Real dynamic bio or location displaying instantly! */}
        <p className="text-neutral-400 text-xs truncate mt-0.5">
          {profile?.bio
            ? profile.bio.slice(0, 45) + "..."
            : profile?.location || "No info shared"}
        </p>
      </div>
    </li>
  );
});

function MemberListModal({
  isOpen,
  onClose,
  admin,
  members = [],
  currentUser,
  onProfileOpen,
}) {
  const listRef = useRef(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // 1. COMBINE DATA SEAMLESSLY AT THE HOOK LEVEL
  const { profileMap, isLoadingProfiles } = useQueries({
    queries: isOpen
      ? members.map((member) => {
          const userId = member?.user?.id || member?.userId;
          return {
            queryKey: profileByUserKey(userId),
            queryFn: () => useGetProfileByUser(userId),
            enabled: !!userId,
            staleTime: 5 * 60 * 1000,
          };
        })
      : [],
    // The combine function is the official way to merge pending queries into live data
    combine: (results) => {
      const map = new Map();
      results.forEach((result, index) => {
        const member = members[index];
        const userId = member?.user?.id || member?.userId;

        // As soon as status hits 'success', the data is piped directly into the live map
        if (userId && result.data) {
          map.set(userId, result.data);
        }
      });

      return {
        profileMap: map,
        isLoadingProfiles: results.some((result) => result.isPending),
      };
    },
  });

  useEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;

    const handleScroll = () => setIsScrolled(listEl.scrollTop > 10);
    listEl.addEventListener("scroll", handleScroll, { passive: true });
    return () => listEl.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-neutral-900/95 border border-white/10 backdrop-blur-xl w-full max-w-md rounded-2xl overflow-hidden max-h-[85vh] flex flex-col shadow-2xl">
        <div
          className={`flex items-center justify-between p-4 border-b transition-all duration-300 bg-neutral-900/40 z-10 ${
            isScrolled
              ? "border-neutral-800 shadow-md backdrop-blur-md"
              : "border-transparent"
          }`}
        >
          <h2 className="text-neutral-100 font-semibold text-base tracking-wide">
            {isScrolled ? "Members" : "Group Members"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-200 transition-colors p-1 rounded-lg hover:bg-white/5"
          >
            <IoMdCloseCircle className="w-6 h-6" />
          </button>
        </div>

        <ul
          ref={listRef}
          className="flex-1 overflow-y-auto py-2 custom-scrollbar max-h-96"
        >
          {members && members.length > 0 ? (
            members.map((member) => {
              const userId = member?.user?.id || member?.userId;

              // 2. READ LIVE PROFILES INSTANTLY FROM THE COMBINED MAP
              const liveProfile = profileMap.get(userId) || null;

              return (
                <MemberItem
                  key={member?.id || userId}
                  member={member}
                  profile={liveProfile}
                  onProfileOpen={onProfileOpen}
                  currentUser={currentUser}
                  admin={admin}
                />
              );
            })
          ) : (
            <li className="p-8 text-center text-neutral-500 text-sm">
              No members found in this group
            </li>
          )}
        </ul>

        <div className="p-3.5 border-t border-neutral-800 bg-neutral-950/40 text-center text-neutral-400 font-medium text-xs tracking-wider uppercase">
          {members?.length || 0} Total Members
        </div>
      </div>
    </Modal>
  );
}

export default MemberListModal;
