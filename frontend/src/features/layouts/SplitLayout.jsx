import { useState, useEffect } from "react";

// Container: grid only from md up (768px+)
const container = `w-full h-full overflow-hidden grid md:grid-cols-[var(--sidebar-width)_10px_1fr]`;

// Sidebar: hidden below md, visible from md up
const sideBar = `
  bg-amber-800 p-2 
  overflow-y-auto 
  scrollbar scrollbar-thumb-gray-600 scrollbar-track-gray-900 
  w-full h-full hidden md:block
`;

// Main: always visible
const main = `bg-gray-500 overflow-y-auto scrollbar-thin w-full h-full`;

// Splitter: hidden below md, visible from md up - blue color
const splitterBase = `bg-blue-500 hover:bg-blue-400 cursor-col-resize hidden md:block`;
const splitterActive = `bg-blue-300 cursor-grabbing`;

// Mobile overlay sidebar: visible only below md
const mobileOverlay = `fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden`;
const mobileSidebar = `w-full h-full bg-amber-800 overflow-y-auto scrollbar-thin`;

function SplitLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [dragging, setDragging] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`,
    );
  }, [sidebarWidth]);

  const handleDrag = (e) => {
    if (dragging) {
      const newWidth = e.clientX;
      if (newWidth >= 150 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    }
  };

  const startDrag = () => {
    console.log("dragging");
    setDragging(true);
    window.addEventListener("mousemove", handleDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const stopDrag = () => {
    setDragging(false);
    window.removeEventListener("mousemove", handleDrag);
    window.removeEventListener("mouseup", stopDrag);
  };

  return (
    <div className={container}>
      {/* Sidebar (desktop/tablet) */}
      <aside
        className={sideBar}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div
          className={`p-4 text-white transition-all duration-200 ${isSidebarHovered ? "pr-3" : "pr-1"}`}
        >
          <div className="min-h-[200vh]">
            <h2 className="text-lg font-semibold mb-4">Sidebar</h2>
            <p className="mb-2">Chat conversations</p>
            <p className="mb-2">Contact list</p>
            <p className="mb-2">Recent messages</p>
            <p className="mb-2">Group chats</p>
            <p className="mb-2">Private messages</p>
            <p className="mb-2">Archived chats</p>
            <p className="mb-2">Starred messages</p>
            <p className="mb-2">Settings</p>
            <p className="mb-2">Profile</p>
            <p className="mb-2">Notifications</p>
            <p className="mb-2">Privacy</p>
            <p className="mb-2">Security</p>
            <p className="mb-2">Help</p>
            <p className="mb-2">About</p>
          </div>
        </div>
      </aside>

      {/* Splitter - blue color for resizing */}
      <div
        className={`${splitterBase} ${dragging ? splitterActive : ""}`}
        onMouseDown={startDrag}
        title="Drag to resize sidebar"
      ></div>

      {/* Main */}
      <main className={main}>
        <div className="flex items-center justify-between p-4 text-white border-b border-gray-700">
          <h2>Main Content</h2>
          {/* Hamburger (mobile only - below 768px) */}
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            ☰
          </button>
        </div>
        <div className="p-4 text-white min-h-[200vh]">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          <p className="mb-2">Message 1</p>
          <p className="mb-2">Message 2</p>
          <p className="mb-2">Message 3</p>
          <p className="mb-2">Message 4</p>
          <p className="mb-2">Message 5</p>
          <p className="mb-2">Message 6</p>
          <p className="mb-2">Message 7</p>
          <p className="mb-2">Message 8</p>
          <p className="mb-2">Message 9</p>
          <p className="mb-2">Message 10</p>
        </div>
      </main>

      {/* Mobile sidebar overlay - only below 768px */}
      {mobileOpen && (
        <div className={mobileOverlay} onClick={() => setMobileOpen(false)}>
          <aside className={mobileSidebar} onClick={(e) => e.stopPropagation()}>
            <div className="p-4 text-white flex justify-between">
              <h2>Sidebar</h2>
              <button onClick={() => setMobileOpen(false)}>✕</button>
            </div>
            <div className="p-4 text-white min-h-[200vh]">Sidebar content…</div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default SplitLayout;
