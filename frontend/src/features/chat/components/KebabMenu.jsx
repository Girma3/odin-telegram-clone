function KebabMenu({ onEdit, onDelete }) {
  return (
    <div
      className="absolute right-16 bottom-0 flex flex-col gap-1
      bg-black dark:bg-gray-700 rounded-lg shadow-md p-2 animate-fadeIn"
    >
      <button className="rounded-md px-2 py-1 text-left text-sm text-white transition-colors duration-200 hover:bg-gray-700 hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400">
        Edit
      </button>
      <button className="rounded-md px-2 py-1 text-left text-sm text-white transition-colors duration-200 hover:bg-red-600/80 focus:outline-none focus:ring-2 focus:ring-red-400">
        Delete
      </button>
    </div>
  );
}

export default KebabMenu;
