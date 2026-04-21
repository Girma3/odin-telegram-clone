import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import UserComment from "./UserComment";
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

const mainPost = `max-w-[600px]  h-max bg-gray-700 rounded-sm p-2`;
function getCommentById(comments, commentId) {
  return comments.find((comment) => comment.id === commentId);
}

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
  const postId = useParams().id;
  const [commentEditId, setCommentEditId] = useState(null);
  const [editCommentData, setEditCommentData] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);
  const navigate = useNavigate();

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useGetPost(postId);

  const { data: postComments } = useGetComments(postId);
  //console.log(post.comments);
  const comments = useMemo(() => {
    return postComments;
  });
  //console.log(postComments);
  // const comments = post.comments;
  // console.log(postComments);
  // const comments = useMemo(() => {
  //   return commentsData || post?.comments || [];
  // }, [commentsData, post?.comments]);

  useEffect(() => {
    if (!commentEditId) return;
    const comment = getCommentById(comments, commentEditId);
    if (comment && comment.id !== editCommentData?.id) {
      setEditCommentData(comment);
    }
  }, [commentEditId, comments, editCommentData?.id]);

  const handleCommendEdit = useCallback((commentId) => {
    setCommentEditId(commentId);
  }, []);

  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  const handleCommentSubmit = useCallback(
    (data) => {
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });
      let payload = data;
      payload = { postId: post.id, ...data };
      if (parentCommentId) {
        payload = { postId: post.id, ...data, parentId: parentCommentId };
      }
      createCommentMutation.mutate(payload, {
        onSuccess: () => {
          console.log("comment created");
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
      Object.keys(data).forEach((key) => {
        if (data[key] === undefined) {
          delete data[key];
        }
      });
      let userId = editCommentData?.userId;
      let payload = {
        commentId: editCommentData?.id,
        userId: userId,
        ...data,
      };
      updateCommentMutation.mutate(payload, {
        onSuccess: () => {
          toastNotify("success", "Success", "Comment updated.");
          setCommentEditId(null);
          setEditCommentData(null);
        },
        onError: () => {
          toastNotify("error", "Error", "Comment not updated, try again.");
        },
      });
      setParentCommentId(null);
    },
    [updateCommentMutation, editCommentData],
  );

  const handleCommentDelete = useCallback(
    (commentId, postId) => {
      if (!commentId || !postId) return;
      deleteCommentMutation.mutate(
        { commentId, postId },
        {
          onSuccess: () => {
            toastNotify("success", "Success", "Comment deleted.");
          },
          onError: () => {
            toastNotify("error", "Error", "Comment not deleted, try again.");
          },
        },
      );
    },
    [deleteCommentMutation],
  );

  const handleNestedComment = useCallback((id) => {
    setParentCommentId(id);
  }, []);

  if (isPostLoading) return <div>Loading...</div>;
  if (isPostError) return <div>Error</div>;
  if (!post) return null;

  const { text, imgUrl, created, userId } = post;
  console.log(comments);

  return (
    <div className="flex flex-col ">
      <button onClick={() => navigate(-1)}> Back </button>
      <ToastContainer />
      <div className="flex flex-col gap-2 items-center">
        <div className={mainPost}>
          {imgUrl && (
            <img
              src={`${imgUrl}`}
              alt="post"
              className="w-100 h-80 object-cover rounded-sm shadow-md ring-1 ring-pink-400"
              loading="lazy"
            />
          )}
          {text && <p className="py-2">{text}</p>}
          <div className="flex justify-end items-center">
            <span>{getMonthAndYear(created)}</span>
          </div>
        </div>
      </div>
      {comments?.length > 0 && (
        <CommentThread
          comments={comments}
          currentUser={currentUser?.id}
          onProfileOpen={onProfileOpen}
          onCommentEdit={handleCommendEdit}
          onCommentDelete={handleCommentDelete}
          onNestedComment={handleNestedComment}
          mode="reply"
        />
      )}

      {comments?.length === 0 && (
        <div className="flex justify-center items-center ">
          <p className="text-amber-300">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}

      <div>
        {!editCommentData && !commentEditId && !parentCommentId && (
          <ReplyInput onSubmit={handleCommentSubmit} />
        )}
        {parentCommentId && (
          <>
            <h1 className="text-amber-400">Nested reply input</h1>
            <ReplyInput onSubmit={handleCommentSubmit} />
          </>
        )}
        {editCommentData && commentEditId && (
          <>
            <button
              onClick={() => {
                setCommentEditId(null);
                setEditCommentData(null);
              }}
            >
              Cancel
            </button>

            <ReplyInput
              editData={editCommentData?.text}
              onSubmit={handleCommentUpdate}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Discussion;
