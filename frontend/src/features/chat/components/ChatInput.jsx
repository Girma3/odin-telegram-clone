import { useRef, useState } from "react";
import { RiImageAddFill } from "react-icons/ri";

function ChatInput() {
  const uploadImageInput = useRef(null);
  const [preview, setPreview] = useState(null);

  function handleUploadImg() {
    uploadImageInput.current.click();
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  }

  return (
    <div className="flex items-center gap-2 w-full  border border-white/10 rounded-md bg-black">
      {/* Upload button */}
      <button
        aria-label="upload image"
        onClick={handleUploadImg}
        className="p-2 rounded-md hover:bg-blue-500/20 transition"
      >
        <RiImageAddFill className="text-blue-500 w-5 h-5" />
      </button>
      {/* Message input */}
      <textarea
        name="userMsg"
        id="userMsg"
        className="flex-1 bg-transparent outline-none text-sm text-amber-100 placeholder:text-amber-200"
        placeholder="Write a message..."
      />{" "}
      {/* Hidden file input */}
      <input
        type="file"
        name="userPost"
        id="userPost"
        ref={uploadImageInput}
        onChange={handleFileChange}
        hidden
      />
      {/* Image preview if uploaded */}
      {preview && (
        <div className="ml-2">
          <img
            src={preview}
            alt="preview"
            className="w-10 h-10 rounded-md object-cover shadow-md"
          />
        </div>
      )}
    </div>
  );
}

export default ChatInput;
