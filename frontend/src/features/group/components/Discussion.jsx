import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import UserComment from "./UserComment";
import { useGetPost } from "../hooks/usePosts";
import {
  useCreateComment,
  useDeleteComment,
  useUpdateComment,
} from "../hooks/useComments";

import { useEffect, useState } from "react";
import CommentThread from "./CommentThread";
import ReplyInput from "../../chat/components/ReplyInput";
import { getMonthAndYear } from "../../../services/helperFns";
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
  const [commentEditId, setCommentEditId] = useState(null);
  const [editCommentData, setEditCommentData] = useState(null);

  //catch if reply is nested
  const [parentCommentId, setParentCommentId] = useState(null);
  const {
    data: post,
    isLoading: isPostLoading,
    isError: isPostError,
  } = useGetPost(postId);
  if (isPostLoading) {
    return <div>Loading..</div>;
  }
  if (isPostError) {
    return <div>error</div>;
  }

  const { comments } = post;
  useEffect(() => {
    if (commentEditId && comments) {
      const comment = getCommentById(comments, commentEditId);
      if (!comment) return;
      setEditCommentData(comment);
    }
  }, [commentEditId, comments]);

  const handleCommendEdit = (commentId) => {
    setCommentEditId(commentId);
  };
  const createCommentMutation = useCreateComment({
    onSuccess: () => {
      notifyCommentCreate();
      setParentCommentId(null);
    },
    onError: () => {
      notifyCommentCreateErr();
    },
  });
  const notifyCommentCreate = () => {
    toast({
      type: "success",
      title: "Success",
      message: "Comment Created.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };
  const notifyCommentCreateErr = () => {
    toast({
      type: "error",
      title: "Error",
      message: "comment not created try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  //edit comment

  const updateCommentMutation = useUpdateComment({
    onSuccess: () => {
      notifyCommentSuccess({
        type: "success",
        title: "Success",
        message: "Comment updated",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setCommentEditId(null);
      setEditCommentData(null);
    },
    onError: (error) => {
      notifyCommentErr();
    },
  });
  const notifyCommentSuccess = () => {};
  const notifyCommentErr = () => {
    toast({
      type: "error",
      title: "Error",
      message: "comment not updated try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };
  if (isPostLoading) return <div>Loading...</div>;
  if (isPostError) return <div>Error</div>;
  if (!post) return null;
  //delete  comment
  const deleteCommentMutation = useDeleteComment({
    onSuccess: () => {
      notifyDelCommentSuccess({
        type: "success",
        title: "Success",
        message: "Comment deleted",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      notifyCommentErr();
    },
  });
  const notifyDelCommentSuccess = () => {
    toast({
      type: "success",
      title: "Success",
      message: "Comment deleted",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  console.log(post);
  const handleCommentDelete = (commentId, postId) => {
    console.log(commentId, postId);
    if (!commentId || !postId) return;
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
    createCommentMutation.mutate(payload);
  }

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
    updateCommentMutation.mutate(payload);
    setCommentEditId(null);
    setEditCommentData(null);
    setParentCommentId(null);
  }
  const handleNestedComment = (id) => {
    setParentCommentId(id);
    console.log(parentCommentId);
  };
  // console.log(post);

  let groupId = post.groupId;

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
            <span>{getMonthAndYear(created)}</span>
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
                mode="reply"
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
