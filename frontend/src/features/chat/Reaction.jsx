function Reaction({ onHover }) {
  return (
    <div
      className="absolute -right-6 bottom-0 flex flex-col gap-1
      bg-black dark:bg-gray-700 rounded-lg shadow-md p-2 animate-fadeIn"
      onMouseEnter={onHover}
    >
      <button
        className="cursor-pointer hover:scale-110"
        aria-label="like emoji"
      >
        👍
      </button>
      <button
        className="cursor-pointer hover:scale-110"
        aria-label="heart emoji"
      >
        ❤️
      </button>
      <button
        className="cursor-pointer hover:scale-110"
        aria-label="laughing emoji"
      >
        😂
      </button>
      <button
        className="cursor-pointer hover:scale-110 "
        aria-label="fire emoji"
      >
        🔥
      </button>
    </div>
  );
}

export default Reaction;
