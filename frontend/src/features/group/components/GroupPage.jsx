import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import GroupPost from "./GroupPost";
import {
  useGetGroup,
  useIsUserAdmin,
  useIsUserMember,
} from "../hooks/useGroups";
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
import { useUsers } from "../../private-chat/userContext";

const header = `bg-gray-700 p-4 `;
const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-green-300 offset-2`;
function isUserAdmin(userId, postId) {
  return userId === postId;
}
function getPostById(posts, id) {
  return posts.find((post) => post.id === id);
}

function GroupPage({ currentUser, onProfileOpen }) {
  const groupId = useParams().id;

  const [editedPost, setEditedPost] = useState(null);
  const [editedPostData, setEditedPostData] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  const { data: group, isLoading, isError } = useGetGroup(groupId);
  const { data: allPosts } = useGetGroupPosts(groupId);
  const { data: isMember } = useIsUserMember(groupId, currentUser?.id);
  //const { data: userIsAdmin } = useIsUserAdmin(groupId, currentUser?.id);
  const { data: users } = useUsers();

  const notify = useCallback((type, message) => {
    toast({
      type,
      title: type === "success" ? "Success" : "Error",
      message,
      status: type,
      duration: 5000,
      isClosable: true,
    });
  }, []);

  const createNewPostMutation = useCreatePost({
    onSuccess: () => notify("success", "Post created successfully"),
    onError: () => notify("error", "Failed to create post"),
  });

  const deletePostMutation = useDeletePost({
    onSuccess: () => notify("success", "Post deleted successfully"),
    onError: () => notify("error", "Failed to delete post"),
  });

  const editPostMutation = useUpdatePost({
    onSuccess: () => notify("success", "Post edited successfully"),
    onError: () => notify("error", "Failed to edit post"),
  });
  //add join group ,leave group mutation

  const isAdmin = useMemo(
    () => currentUser.id === group?.ownerId,
    [currentUser.id, group?.ownerId],
  );
  const membersCount = useMemo(() => {
    if (!group?.members) return "0 members";
    return group.members.length > 1
      ? `${group.members.length} members`
      : `${group.members.length} member`;
  }, [group?.members]);

  // Handlers (stable)
  const handleNewPost = useCallback(
    (data) => {
      if (!group) return;
      const payload = { groupId: group.id, ...cleanData(data) };
      createNewPostMutation.mutate(payload);
    },
    [group, createNewPostMutation],
  );

  const handleDeletePost = useCallback(
    (id) => {
      deletePostMutation.mutate(id);
    },
    [deletePostMutation],
  );

  const handleEditPost = useCallback(
    (id) => {
      setEditedPost(id);
      const post = getPostById(allPosts, id);
      if (post) setEditedPostData(post);
    },
    [allPosts],
  );

  const handleUpdateForm = useCallback(
    (data) => {
      if (!data) return;
      const payload = { postId: editedPostData?.id, ...cleanData(data) };
      editPostMutation.mutate(payload);
      setEditedPost(null);
      setEditedPostData(null);
    },
    [editedPostData, editPostMutation],
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError || !group) return <div>Error</div>;

  const { profile, name, members } = group;
  const { avatarUrl } = profile;

  return (
    <div>
      <div className={header}>
        <button
          onClick={() => onProfileOpen({ type: "group", group, isAdmin })}
          aria-label="show profile"
          title="show group profile"
        >
          <img
            src={avatarUrl}
            alt="profile"
            className={imgStyle}
            loading="lazy"
          />
        </button>

        <div className="flex flex-col">
          <p>{name}</p>
          <button onClick={() => setShowMembers(true)}>
            Show Members <span>({membersCount})</span>
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

      <ul className="flex flex-col gap-2 justify-between p-2">
        {allPosts?.map((post) => (
          <GroupPost
            key={post.id}
            post={post}
            currentUser={currentUser}
            groupId={groupId}
            users={users?.users}
            isAdmin={isUserAdmin(currentUser.id, post.userId)}
            onProfileOpen={onProfileOpen}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        ))}
      </ul>
      {!isMember?.member && <button>Join Group</button>}

      {isAdmin &&
        (editedPost ? (
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
        ) : (
          <ChatInput onSubmit={handleNewPost} />
        ))}
    </div>
  );
}

// Utility: remove null/undefined
function cleanData(data) {
  const copy = { ...data };
  Object.keys(copy).forEach((key) => {
    if (copy[key] == null) delete copy[key];
  });
  return copy;
}

export default GroupPage;
