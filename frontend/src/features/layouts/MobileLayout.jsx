import { useState } from "react";
import UserChat from "../chat/components/UserChat";
import ProfileSlider from "../profile/components/ProfileSlider";
import SideBarOverlay from "./SideBarOverlay";
import { IoSearchSharp } from "react-icons/io5";
import { FaBackward } from "react-icons/fa";

// 1. Header (black background)
const header = `
  flex items-center justify-between
  w-full p-2 

  bg-black text-white
  text-sm sm:text-base font-semibold
`;

// Search bar inside header
export const searchHolder = `
  flex items-center justify-around
  w-[90%] max-w-[600px]  px-2 m-auto
  bg-white/10 rounded-md 
`;

export const searchInput = `
  flex-1 bg-transparent outline-none  w-full p-2
  text-xs sm:text-sm placeholder:text-gray-400 
`;

// 2. Top holder (favorites with gradient)
const topHolder = `
 relative
  w-full
  bg-gradient-to-b from-purple-700 to-purple-900
  text-white p-2 my-2 h-max
  rounded-t-xl
  before:content-[''] before:absolute before:left-0 before:bottom-[-1rem]
  before:w-full before:h-6
  before:rounded-t-2xl before:bg-black before:z-2
`;

// 3. Bottom holder (chat list, black background)
const bottomHolder = `
  w-full 
  bg-black text-white
  rounded-t-5xl p-2 shadow-lg absolute min-h-max overflow-y-auto  scrollbar-thin  
`;

const usersHolder = `
  flex justify-between py-2 overflow-x-auto snap-x snap-mandatory scrollbar-hide
`;
const chatHolder = `
  flex flex-col items-center gap-3
`;

// Avatar style
const imgStyle = `
  rounded-full w-8 h-8 sm:w-10 sm:h-10 shadow-md flex-shrink-0
`;
const users = [18, 19, 20];
const sideBar = `fixed top-0 left-0 h-screen w-screen bg-gray-600 z-50 
                  transform transition-transform duration-300 ease-in-out `;

function MobileLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="min-h-screen bg-blue text-white w-screen ">
      {/* Header + Search */}
      <div>
        <div className={header}>
          <button className="p-1" onClick={() => setMenuOpen(true)}>
            ☰
          </button>

          <img src="./images/jet.jpg" alt="profile" className={imgStyle} />
        </div>
        {menuOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setMenuOpen(false)}
            />
            {/* Sidebar */}
            <div
              className={`${sideBar}
                  ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <button className="p-2" onClick={() => setMenuOpen(false)}>
                <FaBackward />
              </button>
              <SideBarOverlay />
              {/* Sidebar content */}
            </div>
          </>
        )}

        <div className={searchHolder}>
          <label htmlFor="search" aria-label="search-user or group"></label>
          <input
            type="text"
            id="search"
            name="search"
            placeholder="Type your search..."
            className={searchInput}
          />
          <button aria-label="search">
            <IoSearchSharp className="text-blue-400 w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Favorites */}
      <div className={topHolder}>
        <p className="mt-3 text-xs">Favorite</p>
        <div className={usersHolder}>
          <ProfileSlider />
        </div>
      </div>

      {/* Chat list */}
      <div className={bottomHolder}>
        <p className="text-xs">Chat</p>
        <ul className={chatHolder}>
          {users.map((user) => (
            <UserChat key={user} />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MobileLayout;
