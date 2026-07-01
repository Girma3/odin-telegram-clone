import { LuPencil, LuTrash2 } from "react-icons/lu";
function KebabMenu({ onEdit, onDelete }) {
  return (
    <div
      className="flex flex-col gap-0.5 min-w-[140px]
      bg-zinc-900 dark:bg-zinc-800 text-zinc-100 rounded-xl shadow-2xl p-1.5 
      border border-zinc-800 dark:border-zinc-700
      animate-in fade-in slide-in-from-top-2 duration-200"
    >
      {/* Edit Option */}
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg
        transition-colors duration-150 text-left
        hover:bg-zinc-800 dark:hover:bg-zinc-700 hover:text-white"
      >
        <LuPencil className="text-zinc-400 w-4 h-4 transition-colors group-hover:text-white" />
        <span>Edit post</span>
      </button>

      {/* Divider line for visual separation */}
      <div className="h-[1px] bg-zinc-800 dark:bg-zinc-700 my-1" />

      {/* Delete Option */}
      <button
        type="button"
        onClick={onDelete}
        className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg
        transition-colors duration-150 text-left text-red-400
        hover:bg-red-500/10 dark:hover:bg-red-500/20 hover:text-red-300"
      >
        <LuTrash2 className="w-4 h-4" />
        <span>Delete post</span>
      </button>
    </div>
  );
}

// function KebabMenu({ onEdit, onDelete }) {
//   return (
//     <div
//       className="flex flex-col gap-1
//       bg-black dark:bg-gray-700 rounded-lg shadow-md p-2 animate-fadeIn"
//     >
//       <button
//         className="transition-transform duration-200 hover:scale-110"
//         onClick={onEdit}
//       >
//         Edit
//       </button>
//       <button
//         className="transition-transform duration-200 hover:scale-110"
//         onClick={onDelete}
//       >
//         Delete
//       </button>
//     </div>
//   );
// }

export default KebabMenu;
