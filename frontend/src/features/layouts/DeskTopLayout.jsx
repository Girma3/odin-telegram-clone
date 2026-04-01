import { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import SideBarOverlay from "./SideBarOverlay";
import { searchHolder, searchInput } from "./MobileLayout";
import { IoSearchSharp } from "react-icons/io5";

import UserChat from "../chat/components/UserChat";
import ChatInput from "../chat/components/ChatInput";
import GroupSingle from "../group/components/GroupSingle";
import ProfileModal from "../profile/components/ProfileModal";

const container = `w-full h-full overflow-y-scroll
  grid grid-cols-[var(--sidebar-width)_8px_minmax(300px,1fr)] text-amber-50 
`;

// Sidebar: with custom scrollbar that appears on hover
const sideBar = `bg-gray-800 p-2 w-full h-full min-h-[200%]
  overflow-y-auto 
  scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-900 
  
`;

// Main: always visible
const main = `bg-gray-800 overflow-y-auto scrollbar scrollbar-thin w-full `;

// Splitter: blue color for resizing
const splitterBase = `bg-gray-800 hover:bg-green-400 cursor-col-resize `;
const splitterActive = `bg-amber-300 cursor-grabbing`;
// ham overlay sidebar on click
const sideOverlay = `
          absolute left-0 top-0 text-white  w-[40%] min-w-[200px] max-w-[300px] h-full
            bg-black bg-opacity-50 z-40 `;

//accept array of objects
function DesktopLayout({
  users,
  groups,
  currentUser,

  privateChats,
  notifications,
  profileState,
  onProfileOpen,
  onCloseModal,
}) {
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [dragging, setDragging] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const hasGroup = groups
    .map((g) => g.ownerId === currentUser.id)
    .includes(true);
  const profile = { ...currentUser.profile, username: currentUser.username };
  let group = null;
  hasGroup
    ? (group = groups.find((g) => g.ownerId === currentUser.id))
    : (group = null);

  const containerRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`,
    );
  }, [sidebarWidth]);

  // ...drag logic for sidebar

  useEffect(() => {
    if (dragging) {
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    } else {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [dragging]);

  const handleDrag = (e) => {
    if (!dragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth = e.clientX - containerRect.left;
    const maxWidth = containerRect.width * 0.5; // sidebar max = 50% of screen
    const clampedWidth = Math.min(Math.max(newWidth, 350), maxWidth);
    setSidebarWidth(clampedWidth);
  };

  const startDrag = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const stopDrag = () => {
    setDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", stopDrag);
    }

    return () => {
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", stopDrag);
    };
  }, [dragging]);

  return (
    <>
      <div ref={containerRef} className={container}>
        {/* Sidebar */}
        <aside className={sideBar}>
          <div className="min-h-[120%]">
            <div className="flex justify-between items-center">
              <button onClick={() => setSidebarOpen(true)} aria-label="menu">
                ☰
              </button>

              <p>user</p>
            </div>
            <div className={`${searchHolder}`}>
              <label htmlFor="search" aria-label="search user or group"></label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="Type your search..."
                className={`${searchInput}`}
              />
              <button aria-label="search">
                <IoSearchSharp className="fill-white-50 " />
              </button>
            </div>
            <div className="p-4 text-white transition-all duration-200 hover:p-3">
              {users.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">Users</h2>
              )}
              {users.length > 0 && (
                <ul className="flex flex-col justify-between gap-2">
                  {users.map((user, i) => (
                    <UserChat
                      key={i + 1}
                      user={user}
                      privateChats={privateChats}
                      currentUser={currentUser}
                    />
                  ))}
                </ul>
              )}
              {groups.length > 0 && (
                <h2 className="text-lg font-semibold mb-4">Groups</h2>
              )}
              {groups.length > 0 && (
                <ul className="flex flex-col justify-between gap-2">
                  {groups.map((group, i) => (
                    <GroupSingle key={i + 1} group={group} />
                  ))}
                </ul>
              )}
            </div>
          </div>
          {/* Overlay that covers only the sidebar */}
          {sidebarOpen && (
            <div className={sideOverlay}>
              <div>
                <button
                  className="absolute top-2 right-2 text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  ✕
                </button>
                <SideBarOverlay
                  hasGroup={hasGroup}
                  user={user}
                  avatarUrl={profile.avatarUrl}
                  username={profile.username}
                  group={group}
                  onProfileOpen={onProfileOpen}
                />
              </div>
            </div>
          )}
        </aside>
        {/* sidebar overlay operations */}
        {/* profile */}
        {profileState.isOpen && (
          <ProfileModal profileState={profileState} onClose={onCloseModal} />
        )}

        {/* Splitter */}
        <div
          className={`${splitterBase} ${dragging ? splitterActive : ""}`}
          onMouseDown={startDrag}
          title="Drag to resize sidebar"
        ></div>

        {/* Main content */}
        <main className={main}>
          <div className="p-4 text-white  min-h-[150%]">
            <h2 className="text-lg font-semibold mb-4">Main Content</h2>

            {/* ... */}
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="fixed bottom-0  right-0 w-[calc(100%-var(--sidebar-width))] ">
        <ChatInput />
      </footer>
    </>
  );
}

export default DesktopLayout;
