import { useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IoSend } from "react-icons/io5";
import { MdClose } from "react-icons/md";

function ReplyInput({ onSubmit, editData = null, emitTyping, onReset }) {
  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      text: editData || "",
    },
  });

  const textValue = watch("text");

  // Synchronize form values when shifting to edit mode
  useEffect(() => {
    reset({ text: editData || "" });
    // Adjust height on initial edit mount
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      if (editData) {
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      }
    }
  }, [editData, reset]);

  // Fix: Debounce typing events to prevent socket flooding
  const handleTyping = useCallback(
    (e) => {
      // 1. Handle websocket emission with a 1-second interval guard
      if (emitTyping && !typingTimeoutRef.current) {
        emitTyping();
        typingTimeoutRef.current = setTimeout(() => {
          typingTimeoutRef.current = null;
        }, 1000);
      }

      // 2. Responsive Auto-growing height calculations
      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    },
    [emitTyping],
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  function handleFormSubmit(data) {
    const trimmedText = data.text?.trim();

    // Fix: Validated React-Toastify call pattern
    if (!trimmedText) {
      toast.error("Message content cannot be empty.");
      return;
    }

    if (onSubmit) {
      onSubmit({ text: trimmedText });
      reset();
      // Fix: Reset text height back to default baseline row height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  }

  const handleCancel = () => {
    reset();
    if (onReset) onReset();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Merge native react hook form ref with local element height reference hook
  const { ref: registeredRef, ...restRegister } = register("text", {
    onChange: handleTyping,
    required: "Message is required",
    maxLength: {
      value: 1000,
      message: "Message exceeds 1000 characters limit",
    },
  });

  return (
    <div className="w-full space-y-1.5">
      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={`
          flex items-end gap-3 px-4 py-3 rounded-xl bg-zinc-900/40 border transition-all duration-200
          ${
            editData
              ? "border-violet-500/40 bg-violet-950/5 ring-1 ring-violet-500/10"
              : "border-zinc-800 focus-within:border-zinc-700/80 focus-within:bg-zinc-900/60"
          }
        `}
      >
        {/* Responsive Elastic Text Area input */}
        <textarea
          {...restRegister}
          ref={(node) => {
            registeredRef(node);
            textareaRef.current = node;
          }}
          rows={1}
          placeholder={
            editData ? "Update your comment..." : "Write a comment..."
          }
          className="flex-1 bg-transparent outline-none resize-none max-h-36 py-0.5 text-sm text-zinc-100 placeholder:text-zinc-500 scrollbar-none leading-relaxed"
          onKeyDown={(e) => {
            // CMD/CTRL + Enter hotkey to submit directly
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(handleFormSubmit)();
            }
          }}
        />

        {/* Action Button Dock */}
        <div className="flex items-center gap-2 shrink-0 h-8">
          {editData && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center justify-center p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition text-xs font-medium gap-1"
            >
              <MdClose className="text-sm" />
              <span className="hidden sm:inline">Cancel</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !textValue?.trim()}
            aria-label={editData ? "Save comment edit" : "Send comment"}
            className={`
              flex items-center justify-center p-2 rounded-xl text-white transition font-medium text-sm shadow-md
              ${
                editData
                  ? "bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 shadow-violet-500/10"
                  : "bg-zinc-100 text-zinc-950 hover:bg-white disabled:bg-zinc-900 disabled:text-zinc-600 shadow-zinc-950/10"
              }
            `}
          >
            <IoSend className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Modernized localized validation notification display area */}
      {errors.text && (
        <p className="text-rose-400/90 text-xs px-2 font-medium animate-fade-in">
          {errors.text.message}
        </p>
      )}
    </div>
  );
}

export default ReplyInput;
