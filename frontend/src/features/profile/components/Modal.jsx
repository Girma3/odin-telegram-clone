import React, { useEffect, useRef } from "react";
const modalStyle = `
     rounded-lg shadow-xl
 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
     bg-gray-800
     border-0
    backdrop:bg-black/60
    transition-transform transition-opacity duration-300
    open:opacity-100 open:scale-100
    opacity-0 scale-95
  
`;

function Modal({ isOpen, onClose, children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      dialogRef.current?.showModal();
    } else {
      document.body.style.overflow = "";
      dialogRef.current?.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className={modalStyle}
    >
      {children}
    </dialog>
  );
}

export default React.memo(Modal);
