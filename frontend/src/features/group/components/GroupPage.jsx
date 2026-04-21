import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import GroupPost from "./GroupPost";
import { useGetGroup } from "../hooks/useGroups";
import ChatInput from "../../chat/components/ChatInput";
import {
  useCreatePost,
  useDeletePost,
  useGetAllPosts,
  useGetGroupPosts,
  useUpdatePost,
} from "../hooks/usePosts";
import { useCallback, useMemo, useState } from "react";
import MemberProfile, { MemberListModal } from "./MemberProfile";
import MemberList from "./MemberProfile";

const header = `bg-gray-700 p-4 `;
const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-green-300 offset-2`;
function isUserAdmin(userId, postId) {
  return userId === postId;
}
function getPostById(posts, id) {
  return posts.find((post) => post.id === id);
}
function GroupPage({ users, currentUser, onProfileOpen }) {
  let groupId = useParams().id;
  //get clicked post id and show input with data
  const [editedPost, setEditedPost] = useState(null);
  const [editedPostData, setEditedPostData] = useState(null);
  const [showMembers, setShowMembers] = useState(false);
  //memoize the function
  const onProfileOpenMemo = useCallback(
    (data) => {
      onProfileOpen(data);
    },
    [onProfileOpen],
  );
  //memoize this function
  const { data: group, isLoading, isError } = useGetGroup(groupId);
  const {
    data: allPosts,
    isLoading: isPostsLoading,
    isError: isPostsError,
    error: postsError,
  } = useGetGroupPosts(groupId);
  const createNewPostMutation = useCreatePost({
    onSuccess: () => {
      notifyCreatePostSuccess();
    },
    onError: () => {
      notifyCreatePostErr();
    },
  });
  const notifyCreatePostErr = () =>
    toast({
      type: "error",
      title: "Error",
      message: "Failed to create post",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  const notifyCreatePostSuccess = () =>
    toast({
      type: "success",
      title: "Success",
      message: "Post created successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  const deletePostMutation = useDeletePost({
    onSuccess: () => {
      notifyDeletePostSuccess();
    },
    onError: () => {
      notifyDeletePostErr();
    },
  });
  const editPostMutation = useUpdatePost({
    onSuccess: () => {
      notifyEditPostSuccess();
    },
    onError: () => {
      notifyEditPostErr();
    },
  });

  const notifyEditPostErr = () =>
    toast({
      type: "error",
      title: "Error",
      message: "Failed to edit post",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  const notifyEditPostSuccess = () =>
    toast({
      type: "success",
      title: "Success",
      message: "Post edited successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  const notifyDeletePostErr = () =>
    toast({
      type: "error",
      title: "Error",
      message: "Failed to delete post",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  const notifyDeletePostSuccess = () =>
    toast({
      type: "success",
      title: "Success",
      message: "Post deleted successfully",
      status: "success",
      duration: 5000,
      isClosable: true,
    });

  //create post

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const handleNewPost = (data) => {
    if (!group) return;
    //remove undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined || data[key] === null) {
        delete data[key];
      }
    });
    const payload = { groupId: group.id, ...data };
    console.log(payload);
    createNewPostMutation.mutate(payload);
    //createPost(payload);
  };

  const notifyPostErr = () =>
    toast({
      type: "error",
      title: "Error",
      message: `${createPostError.message}`,
    });

  if (!group || group.length === 0) return null;
  const { id, profile, ownerId, name, members, posts } = group;
  const { avatarUrl } = profile;
  //get current user to see it's admin to able edit group info
  let isAdmin = currentUser.id === ownerId;
  //console.log(members, "members");

  let membersCount = useMemo(
    () =>
      members.length > 1
        ? `${members.length} members`
        : `${members.length} member`,
    [members],
  );

  const handleDeletePost = (id) => {
    deletePostMutation.mutate(id);
  };

  const handleEditPost = (id) => {
    setEditedPost(id);
    const post = getPostById(allPosts, id);
    if (post) {
      setEditedPostData(post);
    }
  };
  const handleUpdateForm = (data) => {
    if (!data) {
      return;
    }
    //remove undefined values and null
    Object.keys(data).forEach((key) => {
      if (data[key] === null || data[key] === undefined) {
        delete data[key];
      }
    });
    const payload = { postId: editedPostData?.id, ...data };

    editPostMutation.mutate(payload);
    setEditedPost(null);
    setEditedPostData(null);
  };

  return (
    <div>
      <div className={header}>
        <button
          onClick={() =>
            onProfileOpen({ type: "group", group: group, isAdmin: isAdmin })
          }
          aria-label="show profile"
          title="show group profile"
        >
          <img
            src={`${avatarUrl}`}
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
        </button>

        <div className="flex flex-col">
          <p>{name}name</p>
          <button onClick={() => setShowMembers(true)}>
            Show Members
            <span>({membersCount})</span>
          </button>

          <MemberListModal
            isOpen={showMembers}
            onClose={() => setShowMembers(false)}
            members={members}
            currentUser={currentUser}
            onProfileOpen={onProfileOpen}
          />
        </div>
      </div>
      <div></div>
      <ul className="flex flex-col gap-2 justify-between p-2">
        {/* pass members not users later */}
        {allPosts &&
          allPosts?.map((post) => (
            <GroupPost
              key={post.id}
              post={post}
              currentUser={currentUser}
              groupId={groupId}
              users={users}
              isAdmin={isUserAdmin(currentUser.id, post.userId)}
              onProfileOpen={onProfileOpen}
              onDeletePost={handleDeletePost}
              onEditPost={handleEditPost}
            />
          ))}
      </ul>
      {editedPost && (
        <div>
          <button
            onClick={() => {
              setEditedPost(null);
              setEditedPostData(null);
            }}
          >
            Cancel edit
          </button>
          <ChatInput
            onSubmit={handleUpdateForm}
            editData={editedPostData?.text}
          />
        </div>
      )}

      {!editedPost && (
        <div>
          <ChatInput onSubmit={handleNewPost} />
        </div>
      )}
    </div>
  );
}

export default GroupPage;
