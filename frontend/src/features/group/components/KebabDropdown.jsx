import { useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { LuPencil, LuTrash2 } from "react-icons/lu";
import useClickOutside from "../../chat/hooks/useClickOutside";

function KebabDropdown({ onEditPost, onDeletePost }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickOutside(() => setMenuOpen(false));

  return (
    <div ref={menuRef} className="relative">
      <button
        aria-label="Open post menu"
        onClick={(e) => {
          e.stopPropagation();
          setMenuOpen((prev) => !prev);
        }}
        type="button"
        className={`p-1.5 group rounded-full transition-all text-white hover:bg-white/10
          ${menuOpen ? "opacity-100 scale-105" : "opacity-40 group-hover:opacity-100"}`}
      >
        <CiMenuKebab
          aria-hidden="true"
          className={` w-6 h-6 group-hover:fill-green-500  transition-transform ${menuOpen ? "rotate-90" : ""}`}
        />
      </button>

      {menuOpen && (
        <div
          className="absolute right-0 top-full mt-1.5 z-50 min-w-35
            bg-zinc-900 text-zinc-100 rounded-xl shadow-2xl p-1.5 border border-zinc-800
            animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => {
              onEditPost();
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <LuPencil aria-hidden="true" className="w-4 h-4 text-zinc-400" />
            <span>Edit post</span>
          </button>

          <div className="h-px bg-zinc-800 my-1" />

          {/* Delete Button */}
          <button
            aria-label="Delete post"
            type="button"
            onClick={() => {
              onDeletePost();
              setMenuOpen(false);
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LuTrash2 aria-hidden="true" className="w-4 h-4" />
            <span>Delete post</span>
          </button>
        </div>
      )}
    </div>
  );
}
export default KebabDropdown;
