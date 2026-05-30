// import { useEffect, useState, useMemo, useCallback, use, useRef } from "react";
// import { useLocation, useNavigate, useParams } from "react-router-dom";
// import { ToastContainer, toast } from "react-toastify";
// import UserComment from "./UserComment";
// import CommentThread from "./CommentThread";
// import ReplyInput from "../../chat/components/ReplyInput";

// import { useGetPost } from "../hooks/usePosts";
// import {
//   useCreateComment,
//   useDeleteComment,
//   useGetComments,
//   useUpdateComment,
// } from "../hooks/useComments";
// import { getMonthAndYear } from "../../../services/helperFns";
// import useReplyNotification from "../../websocket/hooks/useReplyNotification";
// import { usePrivateTyping } from "../../websocket/hooks/useTyping";
// import { MdOnDeviceTraining } from "react-icons/md";

//const mainPost = `max-w-[600px]  h-max bg-gray-700 rounded-sm p-2`;
function getCommentById(comments, commentId) {
  return comments.find((comment) => comment.id === commentId);
}

// const toastNotify = (type, title, message) => {
//   toast({
//     type,
//     title,
//     message,
//     status: type,
//     duration: 5000,
//     isClosable: true,
//   });
// };
import { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import CommentThread from "./CommentThread";
import ReplyInput from "../../chat/components/ReplyInput";

import { useGetPost } from "../hooks/usePosts";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from "../hooks/useComments";
import { getMonthAndYear } from "../../../services/helperFns";
import useReplyNotification from "../../websocket/hooks/useReplyNotification";
import { usePrivateTyping } from "../../websocket/hooks/useTyping";
import { IoArrowBack } from "react-icons/io5";

const toastNotify = (type, title, message) => {
  toast({
    type,
    title,
    message,
    status: type,
    duration: 5000,
    isClosable: true,
  });
};

function Discussion({ currentUser, onProfileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: postId } = useParams();

  const { groupMembers, postData } = location.state || {};

  const [commentEditId, setCommentEditId] = useState(null);
  const [editCommentData, setEditCommentData] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);

  // Websockets
  const { sendReplyNotification } = useReplyNotification({ roomId: "1" });
  const { typingUsers, emitTyping } = usePrivateTyping(postId, currentUser?.id);

  useEffect(() => {
    sendReplyNotification({
      messageId: "123",
      originalSenderId: "456",
      roomType: "group",
    });
  }, [sendReplyNotification]);

  // Queries
  const {
    data: fetchedPost,
    isLoading: isPostLoading,
    isSuccess: isPostSuccess,
  } = useGetPost(postId);
  const {
    data: postComments,
    isSuccess: isCommentsSuccess,
    isLoading: isCommentsLoading,
  } = useGetComments(postId, "false");

  const post = isPostSuccess ? fetchedPost : postData;

  const comments = useMemo(() => {
    if (isCommentsSuccess && postComments) return postComments;
    return post?.comments || [];
  }, [isCommentsSuccess, postComments, post?.comments]);

  useEffect(() => {
    if (!commentEditId || !comments.length) return;
    const comment = comments.find((c) => c.id === commentEditId);
    if (comment && comment.id !== editCommentData?.id) {
      setEditCommentData(comment);
    }
  }, [commentEditId, comments, editCommentData?.id]);

  const mode = editCommentData ? "edit" : "new";

  const handleCommendEdit = useCallback((commentId) => {
    setCommentEditId(commentId);
  }, []);

  // Mutations
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleCommentSubmit = useCallback(
    (data) => {
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
      );

      const payload = {
        postId: post?.id,
        ...filteredData,
        ...(parentCommentId && { parentId: parentCommentId }),
      };

      createCommentMutation.mutate(payload, {
        onSuccess: () => {
          toastNotify("success", "Success", "Comment Created.");
          setParentCommentId(null);
        },
        onError: () => {
          toastNotify("error", "Error", "Comment not created, try again.");
        },
      });
    },
    [createCommentMutation, post?.id, parentCommentId],
  );

  const handleCommentUpdate = useCallback(
    (data) => {
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined),
      );

      const payload = {
        commentId: editCommentData?.id,
        userId: editCommentData?.userId,
        ...filteredData,
      };

      updateCommentMutation.mutate(payload, {
        onSuccess: () => {
          toastNotify("success", "Success", "Comment updated.");
          setCommentEditId(null);
          setEditCommentData(null);
          setParentCommentId(null);
        },
        onError: () => {
          toastNotify("error", "Error", "Comment not updated, try again.");
        },
      });
    },
    [updateCommentMutation, editCommentData],
  );

  const handleCommentDelete = useCallback(
    (commentId, targetPostId) => {
      if (!commentId || !targetPostId) return;
      deleteCommentMutation.mutate(
        { commentId, postId: targetPostId },
        {
          onSuccess: () =>
            toastNotify("success", "Success", "Comment deleted."),
          onError: () =>
            toastNotify("error", "Error", "Comment not deleted, try again."),
        },
      );
    },
    [deleteCommentMutation],
  );

  const handleNestedComment = useCallback((id) => {
    setParentCommentId(id);
  }, []);

  const typingUserNames = useMemo(() => {
    if (!typingUsers?.length || !groupMembers?.length) return [];
    return groupMembers
      .filter((member) => typingUsers.includes(member.userId))
      .map((member) => member?.user?.username)
      .filter(Boolean)
      .slice(0, 3);
  }, [typingUsers, groupMembers]);

  if (isPostLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isPostSuccess || !post) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center backdrop-blur-md bg-zinc-900/40 rounded-2xl border border-zinc-800 max-w-md mx-auto my-12">
        <p className="text-zinc-400 font-medium mb-3">
          Failed to load conversation thread
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl transition duration-200 text-sm shadow-lg shadow-indigo-500/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full h-[calc(100vh-2rem)] bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-zinc-900 overflow-hidden my-4">
      <ToastContainer theme="dark" position="top-center" autoClose={4000} />

      {/* Navigation Header */}
      <div className="flex items-center px-4 py-3 border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium tracking-tight bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-800/60 transition duration-200"
        >
          <IoArrowBack className="text-base" />
          <span>Back</span>
        </button>
      </div>

      {/* Scrollable Feed Container */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
        {/* Main Post Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-sm transition duration-300 hover:border-zinc-700/60 shadow-xl">
          {post.imgUrl && (
            <div className="relative overflow-hidden w-full max-h-[340px]">
              <img
                src={post.imgUrl}
                alt="Post attachment"
                className="w-full h-full object-cover transition duration-500 group-hover:scale-[1.01]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-60"></div>
            </div>
          )}

          <div className="p-5 space-y-4">
            {post.text && (
              <p className="text-[15px] leading-relaxed text-zinc-200 font-normal selection:bg-violet-500/30">
                {post.text}
              </p>
            )}

            <div className="flex justify-end items-center text-xs text-zinc-500 font-medium tracking-wider">
              <span className="bg-zinc-900/80 px-2.5 py-1 rounded-md border border-zinc-800/40">
                {getMonthAndYear(post.created)}
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Typing Status Indicator */}

        <div
          className=" flex items-center justify-center gap-2.5  min-h-10
          py-2 bg-violet-950/20  rounded-xl max-w-max animate-fade-in"
        >
          {typingUserNames.length > 0 && (
            <>
              <div className="flex gap-1 items-center py-1 px-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce"></span>
              </div>
              <p className="text-xs text-violet-300/90 font-medium">
                {typingUserNames.join(", ")}{" "}
                {typingUserNames.length > 1 ? "are" : "is"} typing
              </p>
            </>
          )}
        </div>
        {/* Dynamic Comments System */}
        <div className="space-y-4 pt-2">
          {comments.length > 0 ? (
            <CommentThread
              comments={comments}
              currentUser={currentUser?.id}
              onProfileOpen={onProfileOpen}
              onCommentEdit={handleCommendEdit}
              onCommentDelete={handleCommentDelete}
              onNestedComment={handleNestedComment}
            />
          ) : (
            !isCommentsLoading && (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-800/80 rounded-2xl bg-zinc-900/10">
                <p className="text-sm text-zinc-500 font-medium">
                  No comments yet
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  Be the first to jump into the discussion!
                </p>
              </div>
            )
          )}

          {isCommentsLoading && (
            <div className="flex h-16 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
            </div>
          )}
        </div>
      </div>

      <ReplyInput
        editData={mode === "edit" ? editCommentData?.text : null}
        onSubmit={mode === "edit" ? handleCommentUpdate : handleCommentSubmit}
        onReset={() => {
          setCommentEditId(null);
          setEditCommentData(null);
          setParentCommentId(null);
        }}
        emitTyping={emitTyping}
      />
    </div>
  );
}

function getMode() {
  if (parentCommentId) {
    return "reply";
  } else if (commentEditId) {
    return "edit";
  } else {
    return "new";
  }
}
export default Discussion;
