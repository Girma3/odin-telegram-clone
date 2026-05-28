import { useEffect, useRef } from "react";

function useClickOutside(callback) {
  const domNodeRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (domNodeRef.current && !domNodeRef.current.contains(event.target)) {
        callback();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        callback();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    // Clean up both listeners when the component unmounts or menu closes
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [callback]);

  return domNodeRef;
}

export default useClickOutside;
