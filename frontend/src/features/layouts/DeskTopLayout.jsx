import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { IoSearchSharp, IoAddCircleOutline } from "react-icons/io5";
import { HiDotsVertical } from "react-icons/hi";
import {
  useDeleteProfile,
  useGetProfileByUser,
} from "../profile/hooks/useProfile";

import { useDeleteUser, useGetAllUsers } from "../private-chat/hooks/useUser";
import { useGetAllGroups } from "../group/hooks/useGroups";
import SideBarOverlay from "./SideBarOverlay";

import ProfileModal from "../profile/components/ProfileModal";
import UserChat from "../chat/components/UserChat";
import GroupSingle from "../group/components/GroupSingle";
import { toast } from "react-toastify";
import { useAuthContext } from "../auth/AuthContext";

function DesktopLayout({
  children,
  privateChats,
  profileState,
  onProfileOpen,
  onCloseModal,
}) {
  const { currentUser } = useAuthContext();

  if (!currentUser) return null;
  const navigate = useNavigate();
  const { id, username } = currentUser;
  const location = useLocation();

  // 1. Data Layer Fetchers
  const { data: profile } = useGetProfileByUser(id);
  const { data: users, isLoading: isLoadingUsers } = useGetAllUsers();
  const { data: groups, isLoading: isLoadingGroups } = useGetAllGroups();
  const removeUser = useDeleteUser();
  const profileId = profile?.id;

  const handleDeleteProfile = useCallback(async () => {
    if (!profileId || !id) {
      toast.error("Missing profile or user ID for deletion");
      return;
    }
    try {
      await removeUser.mutateAsync({ userId: id, profileId });
      toast.success("Profile deleted successfully");
      navigate("/"); // Redirect to home or login page after deletion
    } catch (error) {
      toast.error(`Failed to delete profile: ${error.message}`);
    }
  }, [removeUser]);

  // 2. Responsive UI State Logic
  const [sidebarWidth, setSidebarWidth] = useState(380);
  const [dragging, setDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const containerRef = useRef(null);

  // Dynamic mobile viewport layout checking logic
  // Checks if a sub-route (like /chat/123 or /group/abc) is active right now
  const isChatActive = useMemo(() => {
    return location.pathname !== "/" && location.pathname !== "/chat";
  }, [location.pathname]);

  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), []);

  const hasGroup = useMemo(() => {
    return groups?.some((g) => g.ownerId === id) || false;
  }, [groups, id]);

  const group = useMemo(() => {
    if (!groups) return null;
    return groups.find((g) => g.ownerId === id) || null;
  }, [groups, id]);

  // 3. Ultra-Smooth Performance Resizer Engine (No CSS Variables)
  const handleDrag = useCallback(
    (e) => {
      if (!dragging || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      const maxWidth = containerRect.width * 0.45; // Caps sidebar max width at 45% of total grid space

      const clampedWidth = Math.min(Math.max(newWidth, 320), maxWidth);
      setSidebarWidth(clampedWidth);
    },
    [dragging],
  );

  const stopDrag = useCallback(() => setDragging(false), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleDrag, { passive: true });
      window.addEventListener("mouseup", stopDrag);
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging, handleDrag, stopDrag]);
  //close side bar
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        handleCloseSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [sidebarOpen, handleCloseSidebar]);

  if (isLoadingUsers || isLoadingGroups) {
    return (
      <div className="flex items-center justify-center h-screen w-screen text-white bg-neutral-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-white/5 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-neutral-400 text-xs tracking-wider uppercase font-medium">
            Loading Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex h-screen w-screen bg-neutral-950 text-neutral-200 overflow-hidden relative font-sans antialiased selection:bg-blue-500/30"
    >
      {/* Premium Gradient Aesthetic Background Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.06),transparent_45%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.03),transparent_50%)] pointer-events-none" />

      {/* LEFT PANES DIRECTORY SYSTEM PANEL */}
      <aside
        style={{
          width: window.innerWidth < 768 ? "100%" : `${sidebarWidth}px`,
        }}
        className={`h-full border-r border-white/5 bg-neutral-900/20 backdrop-blur-md flex flex-col shrink-0 relative transition-transform duration-300 md:transition-none ${
          isChatActive ? "hidden md:flex" : "flex w-full"
        }`}
      >
        {/* Workspace Banner Identity Layout */}
        <div className="p-4 flex items-center justify-between border-b border-white/5 bg-neutral-900/40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
            aria-label="Toggle structural operations menu drawer"
          >
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-600/20">
              <span className="text-white text-xs font-bold uppercase">
                {username?.charAt(0)}
              </span>
            </div>
            <span className="text-neutral-200 text-sm font-semibold truncate max-w-30">
              {username}
            </span>
          </div>
        </div>

        {/* Global Hub Functional Components Grid Row */}
        <div className="p-3 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
          {/* Dynamic Filter Search Query Box */}
          <div className="relative">
            <IoSearchSharp
              aria-hidden="true"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
            />
            <label htmlFor="search" aria-label="Search user or group"></label>
            <input
              type="text"
              id="search"
              name="search"
              placeholder="Search conversations..."
              className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-blue-500/40 focus:ring-4 focus:ring-blue-500/5 transition-all duration-200"
            />
          </div>

          {/* Trigger Workspace Action Button */}

          {/* Direct Private Messages Directory List Node */}
          {users?.users?.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-sm p-2  shadow-2xl shadow-red-600  font-bold text-neutral-500 uppercase tracking-wider">
                Direct Messages Users ({users.users.length})
              </p>

              <ul className="space-y-0.5 flex flex-col gap-2 max-h-72 overflow-y-auto scrollbar pr-0.5">
                {users.users.map((userItem) => (
                  <UserChat
                    key={userItem.id}
                    user={userItem}
                    privateChats={privateChats}
                    currentUser={currentUser}
                  />
                ))}
              </ul>
            </div>
          )}

          {/* Channels / Group Hub Node Mapping Frame */}
          {groups?.length > 0 && (
            <div className="space-y-1.5 pt-2">
              <p className="text-sm p-2 shadow-2xl shadow-red-500 font-bold text-neutral-500 uppercase tracking-wider">
                Group Channels ({groups.length})
              </p>

              <ul className="space-y-0.5 flex flex-col gap-2 max-h-60 overflow-y-auto scrollbar pr-0.5">
                {groups.map((groupItem) => (
                  <GroupSingle key={groupItem.id} group={groupItem} />
                ))}
              </ul>
            </div>
          )}

          {/* Empty Workspace Fallback Matrix Grid Block */}
          {!users?.users?.length && !groups?.length && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-neutral-600">
                <IoAddCircleOutline aria-hidden="true" className="w-6 h-6" />
              </div>
              <p className="text-neutral-400 text-sm font-medium mb-0.5">
                No active sessions
              </p>
              <p className="text-neutral-600 text-xs px-4">
                Initialize a line chat option to interface metrics.
              </p>
            </div>
          )}
        </div>

        {/* 1. Backdrop Layer (Fades in/out, stays in place) */}
        <div
          onClick={handleCloseSidebar}
          role="button"
          tabIndex={0}
          className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-10 transition-opacity duration-300 ${
            sidebarOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        />

        {/* 2. Sliding Drawer Panel (Slides independently from the left) */}
        <div
          className={`fixed top-0 left-0 w-80 h-screen bg-neutral-950 border-r border-white/5 shadow-2xl flex flex-col z-20 transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0 " : "-translate-x-full"
          }`}
        >
          {/* Panel Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/5 bg-neutral-900/40">
            <span className="text-sm font-semibold text-neutral-200 tracking-wide">
              Application Panel
            </span>
            <button
              className="p-1.5 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
              onClick={handleCloseSidebar}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Panel Content (Kept alive so it can slide out smoothly) */}
          <div className="flex-1 overflow-y-auto">
            <SideBarOverlay
              hasGroup={hasGroup}
              user={currentUser}
              profile={profile}
              group={group}
              onProfileOpen={onProfileOpen}
              onCloseSelf={handleCloseSidebar}
              onDelete={handleDeleteProfile}
            />
          </div>
        </div>
      </aside>

      {/* 🚀 SPLITTER RESIZE BAR TRACK (Hidden entirely on mobile screens) */}
      <div
        className={`hidden md:block w-1.5 cursor-col-resize z-30 group/splitter select-none relative shrink-0 transition-colors ${
          dragging ? "bg-blue-500/40" : "bg-transparent hover:bg-white/10"
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        title="Drag track to scale workspace grid columns"
      >
        {/* Subtle glowing center element pin anchor */}
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-8 rounded-full transition-colors ${
            dragging
              ? "bg-blue-400"
              : "bg-neutral-800 group-hover/splitter:bg-neutral-500"
          }`}
        />
      </div>

      {/* 🚀 RIGHT WORKSPACE OUTLET CANVAS CONTAINER PANEL */}
      <main
        className={`h-full flex-1 bg-neutral-900/10 relative ${
          isChatActive ? "flex " : "hidden md:flex"
        }`}
      >
        <div className="w-full h-full flex flex-col relative z-10">
          {children}
        </div>
      </main>

      {/* Profile Card View Modal Handler Mount Node */}
      {profileState.isOpen && (
        <ProfileModal profileState={profileState} onClose={onCloseModal} />
      )}
    </div>
  );
}

export default DesktopLayout;
