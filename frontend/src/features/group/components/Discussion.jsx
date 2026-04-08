import { useParams, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import UserComment from "./UserComment";
import { useGetPost } from "../hooks/usePosts";
import {
  useCreateComment,
  useDeleteComment,
  useGetComments,
  useUpdateComment,
} from "../hooks/useComments";
import ChatInput from "../../chat/components/ChatInput";
import { useEffect, useState } from "react";
import CommentThread from "./CommentThread";
import ReplyInput from "../../chat/components/ReplyInput";
const mainPost = `max-w-[600px]  h-max bg-gray-700 rounded-sm p-2`;
function getUserByCommentId(users, comment) {
  const user = users.find((user) => user.id === comment.userId);
  return user;
}

function isUserCommentOwner(userId, comment) {
  return userId === comment.userId;
}
function getCommentById(comments, commentId) {
  return comments.find((comment) => comment.id === commentId);
}
function Discussion({ users, groups, onProfileOpen }) {
  const postId = useParams().id;
  const [searchParams] = useSearchParams();
  const [commentEditId, setCommentEditId] = useState(null);
  const [editCommentData, setEditCommentData] = useState(null);
  const [commentDelete, setCommentDelete] = useState(null);
  //catch if reply is nested
  const [parentCommentId, setParentCommentId] = useState(null);
  const handleCommendEdit = (commentId) => {
    setCommentEditId(commentId);
  };
  useEffect(() => {
    if (commentEditId) {
      const comment = getCommentById(comments, commentEditId);
      if (!comment) return;
      setEditCommentData(comment);
    }
  }, [commentEditId]);

  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useGetPost(postId);
  const {
    mutate: createComment,
    isLoading: isCreating,
    isError: isCreatingError,
    isSuccess: isCreatingSuccess,
    error: createCommentError,
  } = useCreateComment();
  //edit comment
  const {
    mutate: updateComment,
    isLoading: isUpdating,
    isError: isUpdatingError,
    isSuccess: isUpdatingSuccess,
  } = useUpdateComment();

  if (isPostLoading) return <div>Loading...</div>;
  if (isPostError) return <div>Error</div>;
  if (!post) return null;
  //delete  comment
  const deleteCommentMutation = useDeleteComment({
    onSuccess: () => {
      notifyCommentSuccess({
        type: "success",
        title: "Success",
        message: "Comment deleted",
      });
    },
    onError: (error) => {
      notifyCommentErr({
        type: "error",
        title: "Error",
        message: error.message,
      });
    },
  });

  const handleCommentDelete = (commentId, postId) => {
    deleteCommentMutation.mutate({ commentId, postId });
  };

  function handleCommentSubmit(data) {
    //remove undefined values
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

    createComment(payload);
    if (isCreatingSuccess) {
      notifyCommentSuccess();
      setParentCommentId(null);
    }
    if (isCreatingError) {
      notifyCommentErr();
    }
  }

  const notifyCommentErr = () =>
    toast({
      type: "error",
      title: "Error",
      message: `${createCommentError?.message}`,
    });
  const notifyCommentSuccess = () => toast("Comment created");
  function handleCommentUpdate(data) {
    //validate
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
    console.log(data);
    updateComment(payload);
    if (isUpdatingSuccess) {
      notifyCommentSuccess();
      setCommentEditId(null);
      setEditCommentData(null);
    }
    if (isUpdatingError) {
      notifyCommentErr();
    }
  }
  const handleNestedComment = (id) => {
    setParentCommentId(id);
    console.log(parentCommentId);
  };
  console.log(post);

  let groupId = post.groupId;
  const { comments } = post;
  const { text, imgUrl, created, userId } = post;

  return (
    <div className="flex flex-col ">
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
            <span>{created}</span>
          </div>
        </div>
      </div>
      {comments?.length > 0 && (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => {
            const user = comment?.author?.profile;
            const isOwner = isUserCommentOwner(userId, comment);
            return (
              <UserComment
                key={comment.id}
                user={user}
                comment={comment}
                owner={isOwner}
                onProfileOpen={onProfileOpen}
                onCommentEdit={handleCommendEdit}
                onCommentDelete={handleCommentDelete}
                onNestedComment={handleNestedComment}
              />
            );
          })}
        </ul>
      )}

      {comments?.length === 0 && (
        <div className="flex justify-center items-center ">
          <p className="text-amber-300">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}

      <div>
        <h1 className="text-amber-400">Editing comment</h1>

        <button onClick={() => setCommentEditId(null)}>Cancel</button>
        {!editCommentData && (
          <ReplyInput onSubmit={handleCommentSubmit} editData={null} />
        )}
        {editCommentData && (
          <ReplyInput
            editData={editCommentData?.text}
            onSubmit={{ handleCommentUpdate }}
          />
        )}
      </div>
    </div>
  );
}

export default Discussion;
