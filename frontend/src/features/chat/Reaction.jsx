function Reaction({ onSelect }) {
  const emojis = [
    { symbol: "👍", label: "like emoji" },
    { symbol: "❤️", label: "heart emoji" },
    { symbol: "😂", label: "laughing emoji" },
    { symbol: "🔥", label: "fire emoji" },
  ];

  return (
    <div className="flex flex-col gap-2 bg-black dark:bg-gray-800 rounded-xl shadow-xl p-2 border border-neutral-800  animate-stretchVertical overflow-hidden">
      {emojis.map((emoji) => (
        <button
          key={emoji.symbol}
          className="cursor-pointer hover:scale-120"
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
