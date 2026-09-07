import { useRef, useState } from "react";
import { RiCloseCircleFill, RiImageEditFill } from "react-icons/ri";
import { toast } from "react-toastify";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

function ImageUploader({ onUpload, isUploading = false, className = "" }) {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Invalid file type. Use JPEG, PNG, GIF, or WebP.");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.onerror = () => toast.error("Failed to read file.");
    reader.readAsDataURL(file);
    if (onUpload) {
      onUpload(file);
    }
    e.target.value = ""; // Reset for same file re-upload
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isUploading}
        aria-label="Upload avatar"
        className={`${className} p-1.5 rounded-full bg-green-500 hover:bg-yellow-500 transition-colors ${
          isUploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <RiImageEditFill className="w-full h-full text-white" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleFileChange}
        hidden
        disabled={isUploading}
      />
      {preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-4 rounded-lg relative">
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-2 -right-2 text-red-500 hover:text-red-400"
            >
              <RiCloseCircleFill className="w-6 h-6" />
            </button>
            <img
              src={preview}
              alt="Preview"
              className="max-w-xs max-h-60 rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default ImageUploader;
