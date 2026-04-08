function Reaction({ onHover, onSelect }) {
  const emojis = [
    { symbol: "👍", label: "like emoji" },
    { symbol: "❤️", label: "heart emoji" },
    { symbol: "😂", label: "laughing emoji" },
    { symbol: "🔥", label: "fire emoji" },
  ];

  return (
    <div
      className="absolute -right-6 bottom-0 flex flex-col gap-1
      bg-black dark:bg-gray-700 rounded-lg shadow-md p-2 animate-fadeIn"
      onMouseEnter={onHover}
    >
      {emojis.map((emoji) => (
        <button
          key={emoji.symbol}
          className="cursor-pointer hover:scale-110"
          aria-label={emoji.label}
          onClick={() => onSelect(emoji.symbol)}
        >
          {emoji.symbol}
        </button>
      ))}
    </div>
  );
}

export default Reaction;
