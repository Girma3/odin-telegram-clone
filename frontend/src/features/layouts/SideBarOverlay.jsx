import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogout } from "../auth/hooks/useAuth";

const imgStyle = `
  rounded-full w-16 h-16 shadow-xl ring-2 ring-amber-500/50 ring-offset-2 ring-offset-gray-800 object-cover
`;

const linkHolder = `
  flex flex-col gap-1 py-2
`;

const topHalf = `bg-gray-800/50 backdrop-blur-sm rounded-xl w-full border border-gray-700/50 flex flex-col items-start justify-between gap-3 p-4`;

const menuSection = `
  flex flex-col gap-0.5 w-full
`;

const menuHeader = `
  text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5
`;

const primaryLink = `
  text-sm text-gray-300 p-2.5 rounded-lg hover:bg-gray-700/50 hover:text-white 
  transition-all duration-200 flex items-center gap-2.5 cursor-pointer group
  hover:bg-gray-700/50 hover:pl-3
`;

const iconWrapper = `
  w-8 h-8 rounded-lg bg-gray-700/50 flex items-center justify-center 
  group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors
`;

const dangerLink = `
  text-sm text-red-400 p-2.5 rounded-lg hover:bg-red-500/10 hover:text-red-300 
  transition-all duration-200 flex items-center gap-2.5 cursor-pointer group
  hover:bg-red-500/10 hover:pl-3
`;

const ICON_WRAPPER =
  "w-8 h-8 rounded-xl bg-white/5 group-hover:bg-blue-500/10 text-neutral-400 group-hover:text-blue-400 flex items-center justify-center transition-all duration-200 shrink-0";
const PRIMARY_LINK =
  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] text-neutral-300 font-medium hover:text-white hover:bg-white/5 active:bg-white/10 group transition-all duration-200 text-left";
const DANGER_LINK =
  "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-[14px] text-red-400 font-medium hover:text-red-300 hover:bg-red-500/10 active:bg-red-500/20 group transition-all duration-200 text-left";

function SideBarOverlay({
  user,
  profile,
  group,
  hasGroup = false,
  onProfileOpen,
  onCloseSelf,
  onDelete,
}) {
  const navigate = useNavigate();

  if (!user) return null;
  const { id, username } = user;

  const {
    mutate: logoutMutate,
    isPending: isLogOutPending,
    isSuccess,
  } = useLogout();

  useEffect(() => {
    if (isSuccess) {
      navigate("/auth", { replace: true });
    }
  }, [isSuccess, navigate]);

  // Update your click handler to point directly to the unpacked mutation method
  const handleLogOut = () => logoutMutate();
  const isProfileEmpty =
    !profile || Object.values(profile).every((value) => !value);
  const userGroup = group;

  const openProfileView = () => {
    onProfileOpen?.({
      type: "user",
      user,
      profile,
      username,
      isSelf: true,
    });
  };

  return (
    /* Outer Container: Full screen on mobile, fixed side-width layout block on desktop */
    <div className="fixed inset-0 md:relative w-full md:w-80 h-full bg-neutral-950/95 md:bg-transparent border-r border-white/5 backdrop-blur-xl flex flex-col text-neutral-200 z-50 md:z-auto animate-fade-in">
      {/* Top Profile Banner Panel Layout */}
      <div className=" flex flex-col gap-4 p-3 border-b border-white/5 bg-white/5   relative">
        {/* Mobile Back Nav Arrow Trigger (Hidden on Desktop) */}
        <button
          onClick={onCloseSelf}
          aria-label="Close menu drawer"
          className=" md:hidden p-1.5 w-fit rounded-md bg-white/5  text-neutral-400 hover:text-white active:scale-95 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        {/* User Card Segment Node */}
        <div className="flex items-center gap-3 mt-2 md:mt-0">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={username}
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white/10 shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 font-bold uppercase text-sm tracking-wide shrink-0">
              {username?.slice(0, 2) || "US"}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-neutral-100 truncate">
              {username}
            </p>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {isProfileEmpty ? "Complete your profile" : "Online"}
            </p>
          </div>
        </div>

        {/* Direct Action Configuration Button */}
      </div>

      {/* Directory Nav Section Block */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
        {/* Account Section Array Node */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-1">
            Account
          </div>
          <button className={PRIMARY_LINK} onClick={openProfileView}>
            <span className={ICON_WRAPPER}>
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </span>
            Profile Settings
          </button>
        </div>

        {/* Channels / Group Category Array List */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-1">
            Groups
          </div>

          {!hasGroup && !userGroup?.id && (
            <button
              className={PRIMARY_LINK}
              onClick={() =>
                onProfileOpen?.({
                  type: "group",
                  group: null,
                  hasGroup: false,
                  userId: id,
                })
              }
            >
              <span className={ICON_WRAPPER}>
                <svg
                  aria-hidden="true"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
              </span>
              Create Group Hub
            </button>
          )}

          {userGroup && hasGroup && (
            <button
              className={PRIMARY_LINK}
              onClick={() => {
                onProfileOpen?.({
                  type: "group",
                  group: userGroup,
                  isAdmin: true,
                  hasGroup: true,
                  userId: id,
                });
                onCloseSelf?.();
              }}
            >
              <span className={ICON_WRAPPER}>
                <svg
                  aria-hidden="true"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </span>
              My Managed Group
            </button>
          )}
        </div>

        {/* Global Control Mutation Options Footer Track Section */}
        <div className="space-y-1">
          <div className="px-3 text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-1">
            Actions
          </div>

          <button
            className={`${PRIMARY_LINK} ${isLogOutPending ? "opacity-40 cursor-not-allowed" : ""}`}
            onClick={handleLogOut}
            disabled={isLogOutPending}
          >
            <span className={ICON_WRAPPER}>
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </span>
            {isLogOutPending ? "Logging out..." : "Logout Session"}
          </button>

          {onDelete && (
            <button className={DANGER_LINK} onClick={onDelete}>
              <span className="w-8 h-8 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 text-red-400 flex items-center justify-center transition-all duration-200 shrink-0">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </span>
              Terminate Account
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default SideBarOverlay;
