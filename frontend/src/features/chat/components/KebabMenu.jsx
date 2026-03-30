function KebabMenu({ onEdit, onDelete }) {
  return (
    <div
      className="absolute right-16 bottom-0 flex flex-col gap-1
      bg-black dark:bg-gray-700 rounded-lg shadow-md p-2 animate-fadeIn"
    >
      <button>Edit</button>
      <button>Delete</button>
    </div>
  );
}

export default KebabMenu;
