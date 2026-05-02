import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import GroupPost from "./GroupPost";
import {
  useGetGroup,
  useIsUserAdmin,
  useIsUserMember,
  useGetMembers,
  useJoinGroup,
  useLeaveGroup,
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

const header = `flex gap-4 p-2 bg-gray-700 px-2 `;
const imgStyle = `w-10 h-10 rounded-full shadow-md ring-1 ring-green-300 offset-2`;
const joinButton = `px-4 m-auto absolute left-1/2 bottom-0  py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition`;
const leaveButton = `px-4 m-auto  py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition`;
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
  const isOwner = group?.ownerId === currentUser?.id;
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
  const joinGroupMutation = useJoinGroup({
    onSuccess: () => notify("success", "Joined group successfully"),
    onError: () => notify("error", "Failed to join group"),
  });
  const leaveGroupMutation = useLeaveGroup({
    onSuccess: () => notify("success", "Left group successfully"),
    onError: () => notify("error", "Failed to leave group"),
  });
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
  const handleJoinGroup = useCallback(() => {
    if (!group) return;
    joinGroupMutation.mutate(group.id);
  }, [group, joinGroupMutation]);

  const handleLeaveGroup = useCallback(() => {
    if (!group) return;
    leaveGroupMutation.mutate(group.id);
  }, [group, leaveGroupMutation]);
  if (isLoading) return <div>Loading...</div>;
  if (isError || !group) return <div>Error</div>;

  const { profile, name, members } = group;
  const { avatarUrl } = profile;
  const isGroupMember = isMember?.member;

  return (
    <div className="flex flex-col relative overflow-y-scroll h-full">
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
          <button onClick={() => setShowMembers(true)} title="show members">
            Members <span>({membersCount})</span>
          </button>

          <MemberListModal
            isOpen={showMembers}
            onClose={() => setShowMembers(false)}
            members={members}
            currentUser={currentUser}
            onProfileOpen={onProfileOpen}
          />
        </div>
        {isGroupMember && !isOwner && (
          <button className={leaveButton} onClick={handleLeaveGroup}>
            Leave Group
          </button>
        )}
        {isOwner && (
          <button className={leaveButton} onClick={handleLeaveGroup}>
            Delete Group
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-2 justify-between p-2">
        {allPosts?.map((post) => (
          <GroupPost
            key={post.id}
            post={post}
            currentUser={currentUser}
            groupId={groupId}
            isMember={isGroupMember}
            users={members}
            isAdmin={isUserAdmin(currentUser.id, post.userId)}
            onProfileOpen={onProfileOpen}
            onDeletePost={handleDeletePost}
            onEditPost={handleEditPost}
          />
        ))}
      </ul>
      {!isGroupMember && (
        <button className={joinButton} onClick={handleJoinGroup}>
          Join Group
        </button>
      )}

      {isAdmin &&
        isGroupMember &&
        (editedPost ? (
          <div className="absolute bottom-0">
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
