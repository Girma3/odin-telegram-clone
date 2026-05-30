// import { useRef, useState, useCallback } from "react";
// import { RiImageAddFill, RiCloseCircleFill } from "react-icons/ri";
// import { IoSend } from "react-icons/io5";
// import { useForm } from "react-hook-form";

// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// const ALLOWED_FILE_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/jpg",
//   "image/gif",
//   "image/webp",
// ];

// function ChatInput({ onSubmit, editChat, emitTyping }) {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       text: editChat || "",
//       imgUrl: null,
//     },
//   });

//   //submit on enter key
//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       e.preventDefault();
//       handleSubmit(handleOnSubmit)();
//     }
//   };

//   const uploadImageInput = useRef(null);
//   const [preview, setPreview] = useState(null);
//   const [uploadError, setUploadError] = useState(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleTyping = () => {
//     if (emitTyping) {
//       emitTyping();
//     }
//   };
//   const handleOnSubmit = useCallback(
//     async (data, e) => {
//       if (!data.text?.trim() && !data.imgUrl) {
//         setUploadError("Please enter a message or upload an image");
//         return;
//       }

//       setIsSubmitting(true);
//       setUploadError(null);
//       if (e.key === "Enter") {
//         e.preventDefault();
//         await onSubmit?.(data);
//         resetForm();
//       }

//       try {
//         await onSubmit?.(data);
//         resetForm();
//       } catch (error) {
//         setUploadError("Failed to send message. Please try again.");
//       } finally {
//         setIsSubmitting(false);
//       }
//     },
//     [onSubmit, reset],
//   );

//   const resetForm = useCallback(() => {
//     reset();
//     setPreview(null);
//     setUploadError(null);
//     if (uploadImageInput.current) {
//       uploadImageInput.current.value = "";
//     }
//   }, [reset]);

//   const handleUploadImg = useCallback(() => {
//     uploadImageInput.current?.click();
//   }, []);

//   const handleFileChange = useCallback(
//     (e) => {
//       const file = e.target.files[0];
//       if (!file) return;

//       // Validate file type
//       if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         setUploadError(
//           "Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.",
//         );
//         return;
//       }

//       // Validate file size
//       if (file.size > MAX_FILE_SIZE) {
//         setUploadError("File size exceeds 5MB limit.");
//         return;
//       }

//       setUploadError(null);

//       const reader = new FileReader();
//       reader.onloadend = () => setPreview(reader.result);
//       reader.onerror = () => setUploadError("Failed to read file.");
//       reader.readAsDataURL(file);
//       setValue("imgUrl", file, { shouldValidate: true });
//     },
//     [setValue],
//   );

//   const removeImage = useCallback(() => {
//     setPreview(null);
//     setValue("imgUrl", null);
//     if (uploadImageInput.current) {
//       uploadImageInput.current.value = "";
//     }
//   }, [setValue]);

//   return (
//     <div>
//       <div className="flex items-start gap-2 w-full border border-white/10 rounded-md p-2 bg-transparent">
//         {/* Upload button */}
//         <button
//           type="button"
//           aria-label="Upload image"
//           onClick={handleUploadImg}
//           className="p-2 rounded-md hover:bg-blue-500/20 transition-colors shrink-0"
//           disabled={isSubmitting}
//         >
//           <RiImageAddFill className="text-blue-500 w-5 h-5" />
//         </button>

//         {/* Message input form */}
//         <form
//           onSubmit={handleSubmit(handleOnSubmit)}
//           autoComplete="off"
//           className="flex flex-1 items-start gap-2 min-w-0 "
//         >
//           <div className="flex-1 min-w-0">
//             <textarea
//               name="text"
//               id="text"
//               {...register("text", {
//                 onChange: handleTyping,
//                 validate: {
//                   required: (value) => {
//                     if (!value?.trim()) {
//                       return "Message  is required";
//                     }
//                     return true;
//                   },
//                 },
//               })}
//               className={`w-full bg-transparent outline-none text-sm text-amber-100 placeholder:text-amber-200 resize-none min-h-10 max-h-32 ${
//                 errors.userMsg ? "border-red-500" : ""
//               }`}
//               placeholder={editChat ? "Update message" : "Type a message..."}
//               rows={1}
//               onInput={(e) => {
//                 e.target.style.height = "auto";
//                 e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
//               }}
//               disabled={isSubmitting}
//             />
//             {errors.userMsg && (
//               <p className="text-red-400 text-xs mt-1">
//                 {errors.userMsg.message}
//               </p>
//             )}
//           </div>

//           {/* Hidden file input */}
//           <input
//             type="file"
//             name="imgUrl"
//             id="imgUrl"
//             ref={uploadImageInput}
//             accept={ALLOWED_FILE_TYPES.join(",")}
//             onChange={handleFileChange}
//             hidden
//             disabled={isSubmitting}
//           />

//           {/* Image preview with remove button */}
//           {preview && (
//             <div className="relative  ">
//               <img
//                 src={preview}
//                 alt="Preview"
//                 className="w-10 h-10 rounded-md object-cover shadow-md"
//               />
//               <button
//                 type="button"
//                 onClick={removeImage}
//                 className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
//                 aria-label="Remove image"
//               >
//                 <RiCloseCircleFill aria-hidden="true" className="w-3 h-3" />
//               </button>
//             </div>
//           )}

//           <button
//             type="submit"
//             aria-label={editChat ? "Update message" : "Send message"}
//             className={`w-max p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shrink-0 ${
//               isSubmitting ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//             disabled={isSubmitting}
//           >
//             <IoSend className="w-3 h-3 relative" />
//           </button>
//         </form>
//       </div>

//       {/* Error display */}
//       {uploadError && (
//         <p className="text-red-400 text-xs mt-1 ml-2">{uploadError}</p>
//       )}
//     </div>
//   );
// }

// export default ChatInput;
import React, { useRef, useState, useCallback, useEffect } from "react";
import { RiImageAddFill, RiCloseCircleFill } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import { useForm } from "react-hook-form";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
];

// Wrapped in React.memo to completely eliminate lag while typing
const ChatInput = React.memo(({ onSubmit, editChat, emitTyping }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      text: editChat || "",
      imgUrl: null,
    },
  });

  const uploadImageInput = useRef(null);
  const textareaRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Watch text state to conditionally style send button or handle subtle logic
  const textValue = watch("text");

  // Destructure register fields so we can merge hooks with our local DOM ref
  const {
    ref: registerRef,
    onChange: registerOnChange,
    ...textRegisterRest
  } = register("text", {
    onChange: () => emitTyping?.(),
  });

  const resetForm = useCallback(() => {
    reset({ text: "", imgUrl: null });
    setPreview(null);
    setUploadError(null);
    if (uploadImageInput.current) uploadImageInput.current.value = "";
    if (textareaRef.current) textareaRef.current.style.height = "40px";
  }, [reset]);

  const handleOnSubmit = useCallback(
    async (data) => {
      const hasText = data.text?.trim();
      if (!hasText && !data.imgUrl) {
        setUploadError("Please enter a message or upload an image");
        return;
      }

      setIsSubmitting(true);
      setUploadError(null);

      //remove null
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== null),
      );

      try {
        if (onSubmit) {
          onSubmit(payload);
          resetForm();
        }
      } catch (error) {
        setUploadError("Failed to send message. Please try again.");
      } finally {
        setIsSubmitting(false);
        // resetForm();
      }
    },
    [onSubmit, resetForm],
  );

  // Handle Enter key submission without duplicating requests
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(handleOnSubmit)();
    }
  };

  const handleUploadImg = useCallback(() => {
    uploadImageInput.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setUploadError("Invalid format. Please use JPEG, PNG, GIF, or WebP.");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setUploadError("File size exceeds 5MB limit.");
        return;
      }

      setUploadError(null);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.onerror = () => setUploadError("Failed to read file.");
      reader.readAsDataURL(file);
      setValue("imgUrl", file, { shouldValidate: true });
    },
    [setValue],
  );

  const removeImage = useCallback(() => {
    setPreview(null);
    setValue("imgUrl", null);
    if (uploadImageInput.current) uploadImageInput.current.value = "";
  }, [setValue]);

  // Sync textarea height based on content smoothly
  const adjustHeight = (target) => {
    target.style.height = "auto";
    target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-2">
      <form
        onSubmit={handleSubmit(handleOnSubmit)}
        autoComplete="off"
        className={`flex items-end gap-3 w-full border rounded-2xl p-2.5 bg-neutral-900/60 backdrop-blur-md shadow-lg transition-all duration-200 ${
          errors.text || uploadError
            ? "border-red-500/50"
            : "border-white/10 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10"
        }`}
      >
        {/* Upload Media Button */}
        <button
          type="button"
          aria-label="Upload image"
          onClick={handleUploadImg}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-blue-500/10 text-neutral-400 hover:text-blue-400 transition-all shrink-0 mb-0.5"
          disabled={isSubmitting}
        >
          <RiImageAddFill aria-hidden="true" className="w-5 h-5" />
        </button>

        {/* Text Area Container */}
        <div className="flex-1 min-w-0 self-center">
          <textarea
            {...textRegisterRest}
            ref={(e) => {
              registerRef(e);
              textareaRef.current = e;
            }}
            onChange={(e) => {
              registerOnChange(e);
              adjustHeight(e.target);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              editChat ? "Update your comment..." : "Share your thoughts..."
            }
            disabled={isSubmitting}
            rows={1}
            className="w-full bg-transparent outline-none text-[15px] text-neutral-100 placeholder:text-neutral-500 resize-none min-h-[40px] max-h-32 py-2 block leading-relaxed"
          />
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={uploadImageInput}
          accept={ALLOWED_FILE_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
          disabled={isSubmitting}
        />

        {/* Image Preview Panel */}
        {preview && (
          <div className="relative shrink-0 mb-0.5 group">
            <img
              src={preview}
              alt="Preview"
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/10 shadow-md group-hover:opacity-80 transition-opacity"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 bg-neutral-950 text-red-400 rounded-full hover:text-red-500 transition-colors shadow-lg"
              aria-label="Remove image"
            >
              <RiCloseCircleFill className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          aria-label={editChat ? "Update message" : "Send message"}
          disabled={isSubmitting || (!textValue?.trim() && !preview)}
          className={`p-2.5 rounded-xl shrink-0 transition-all duration-200 mb-0.5 ${
            textValue?.trim() || preview
              ? "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105 active:scale-95 shadow-md shadow-blue-600/20"
              : "bg-white/5 text-neutral-600 cursor-not-allowed"
          }`}
        >
          <IoSend className="w-4 h-4" />
        </button>
      </form>

      {/* Validation Messages Section */}
      {(uploadError || errors.text) && (
        <p className="text-red-400 text-xs font-medium mt-2 ml-3 tracking-wide animate-fade-in">
          {uploadError || errors.text?.message}
        </p>
      )}
    </div>
  );
});

ChatInput.displayName = "ChatInput";

export default ChatInput;
