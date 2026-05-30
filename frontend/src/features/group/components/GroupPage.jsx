import { useLocation, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import GroupPost from "./GroupPost";
import {
  useGetGroup,
  useIsUserMember,
  useJoinGroup,
  useLeaveGroup,
} from "../hooks/useGroups";
import ChatInput from "../../chat/components/ChatInput";
import {
  useCreatePost,
  useDeletePost,
  useGetGroupPosts,
  useUpdatePost,
} from "../hooks/usePosts";
import { useCallback, useMemo, useState } from "react";
import { MemberListModal } from "./MemberProfile";
import { RiGroupLine } from "react-icons/ri";
import { FiLogOut, FiUserPlus } from "react-icons/fi";

const toastNotify = (type, message) => {
  if (type === "success") {
    toast.success(message);
  } else {
    toast.error(message);
  }
};

function GroupPage({ currentUser, onProfileOpen }) {
  const { id: groupId } = useParams();
  const location = useLocation();
  const { groupData } = location.state || {};

  // Queries
  const {
    data: fetchGroup,
    isLoading: isGroupLoading,
    isSuccess: isGroupSuccess,
  } = useGetGroup(groupId);
  const { data: allPosts, isLoading: isLoadingPosts } =
    useGetGroupPosts(groupId);
  const { data: isMemberData } = useIsUserMember(groupId, currentUser?.id);

  const group = fetchGroup || groupData;
  const isGroupMember = !!isMemberData?.member;
  const isOwner = group?.ownerId === currentUser?.id;
  const isAdmin = currentUser?.id === group?.ownerId;

  // Local UI State
  const [editedPost, setEditedPost] = useState(null);
  const [editedPostData, setEditedPostData] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  // Mutations
  const joinGroupMutation = useJoinGroup();
  const leaveGroupMutation = useLeaveGroup();
  const createNewPostMutation = useCreatePost();
  const editPostMutation = useUpdatePost();
  const deletePostMutation = useDeletePost();

  // Safely derive group data fields with defensive fallbacks
  const profile = group?.profile || {};
  const avatarUrl = profile?.avatarUrl || "";
  const groupName = group?.name || "Group Thread";
  const membersList = group?.members || [];

  const membersCountText = useMemo(() => {
    const count = membersList.length;
    return `${count} ${count === 1 ? "member" : "members"}`;
  }, [membersList]);

  // Handlers
  const handleNewPost = useCallback(
    async (data) => {
      if (!group?.id) return;
      const payload = { groupId: group.id, ...data };

      try {
        await createNewPostMutation.mutateAsync(payload);
        toastNotify("success", "Post created successfully");
      } catch (error) {
        toastNotify("error", "Failed to create post");
      }
    },
    [group?.id, createNewPostMutation],
  );

  const handleUpdateForm = useCallback(
    async (data) => {
      if (!editedPostData?.id) return;
      const payload = { postId: editedPostData.id, ...data };

      try {
        await editPostMutation.mutateAsync(payload);
        toastNotify("success", "Post updated successfully");
        setEditedPost(null);
        setEditedPostData(null);
      } catch (error) {
        toastNotify("error", "Error updating post");
      }
    },
    [editedPostData?.id, editPostMutation],
  );

  // const handleNewPost = useCallback(
  //   (data) => {
  //     if (!group?.id) return;
  //     const payload = { groupId: group.id, ...data };
  //     createNewPostMutation.mutate(payload, {
  //       onSuccess: () => toastNotify("success", "Post created successfully"),
  //       onError: () => toastNotify("error", "Failed to create post"),
  //     });
  //   },
  //   [group?.id, createNewPostMutation],
  // );
  // const handleUpdateForm = useCallback(
  //   async (data) => {
  //     if (!editedPostData?.id) return;

  //     const payload = { postId: editedPostData.id, ...data };
  //     try{
  //       await editPostMutation.mutateAsync(payload);
  //     }catch(e){
  //       console.log(e);
  //     }
  //     // editPostMutation.mutate(payload, {
  //     //   onSuccess: () => toastNotify("success", "Post updated successfully"),
  //     //   onError: () => toastNotify("error", "Error updating post"),
  //     //   onSettled: () => {
  //     //     setEditedPost(null);
  //     //     setEditedPostData(null);
  //     //   },
  //   //   });
  //   // },
  //   [editedPostData, editPostMutation],
  // );
  const handleDeletePost = useCallback(
    (postId) => {
      deletePostMutation.mutate(postId, {
        onSuccess: () => toastNotify("success", "Post deleted successfully"),
        onError: () => toastNotify("error", "Error deleting post"),
      });
    },
    [deletePostMutation],
  );
  console.log(allPosts);
  const handleEditPost = useCallback(
    (postId) => {
      setEditedPost(postId);
      const post = allPosts?.find((p) => p.id === postId);
      if (post) setEditedPostData(post);
    },
    [allPosts],
  );

  const handleJoinGroup = useCallback(() => {
    if (!group?.id) return;
    joinGroupMutation.mutate(group.id, {
      onSuccess: () => toastNotify("success", "Joined group successfully"),
      onError: () => toastNotify("error", "Error joining group"),
    });
  }, [group?.id, joinGroupMutation]);

  const handleLeaveGroup = useCallback(() => {
    if (!group?.id) return;
    if (isOwner) {
      return toastNotify(
        "error",
        "Owners must reassign permissions before leaving.",
      );
    }
    leaveGroupMutation.mutate(group.id, {
      onSuccess: () => toastNotify("success", "Left group successfully"),
      onError: () => toastNotify("error", "Error leaving group"),
    });
  }, [group?.id, isOwner, leaveGroupMutation]);

  // Loading Shield State
  if (isGroupLoading || !currentUser) {
    return (
      <div className="flex h-[60vh] items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-8 text-center bg-zinc-950 text-zinc-400">
        Group could not be found or has been removed.
      </div>
    );
  }

  return (
    <div className="flex flex-col max-w-2xl mx-auto w-full h-[calc(100vh-2rem)] bg-zinc-950 text-zinc-100 rounded-2xl shadow-2xl border border-zinc-900 overflow-hidden my-4">
      <ToastContainer theme="dark" position="top-center" autoClose={4000} />

      {/* Modern Dashboard Header Banner */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-zinc-900/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={() => onProfileOpen?.({ type: "group", group, isAdmin })}
            aria-label="Show group details"
            className="relative shrink-0 active:scale-95 transition-transform group"
          >
            <img
              src={avatarUrl || "/placeholder-group.png"}
              alt={`${groupName} profile`}
              className="w-11 h-11 rounded-full shadow-md object-cover border border-zinc-800"
              loading="lazy"
            />
            <div className="absolute inset-0 rounded-full bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs">
              👀
            </div>
          </button>
          {/* show members */}
          {showMembers && (
            <MemberListModal
              isOpen={showMembers}
              onClose={() => setShowMembers(false)}
              members={membersList}
              admin={isAdmin ? currentUser?.id : null}
              currentUser={currentUser?.id}
              onProfileOpen={onProfileOpen}
            />
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="text-base font-bold tracking-tight text-zinc-100 truncate">
              {groupName}
            </h1>
            <button
              onClick={() => setShowMembers(true)}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-400 font-medium transition-colors w-max mt-0.5"
            >
              <RiGroupLine className="text-sm" />
              <span>{membersCountText}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Action Buttons Placement */}
        {isGroupMember && !isOwner && (
          <button
            onClick={handleLeaveGroup}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 text-xs font-semibold rounded-xl border border-zinc-800 hover:border-rose-900/40 transition duration-200"
          >
            <FiLogOut />
            <span>Leave</span>
          </button>
        )}
      </div>

      {/* Scrollable Post Feed Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-none">
        {isLoadingPosts ? (
          <div className="space-y-4 py-6">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="h-32 bg-zinc-900/40 border border-zinc-800/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : allPosts?.length > 0 ? (
          <div className="flex flex-col gap-2 justify-between">
            {allPosts.map((post) => (
              <GroupPost
                key={post.id}
                groupMembers={membersList}
                post={post}
                currentUser={currentUser}
                groupId={groupId}
                isMember={isGroupMember}
                isAdmin={currentUser?.id === post.userId}
                onProfileOpen={onProfileOpen}
                onDeletePost={handleDeletePost}
                onEditPost={handleEditPost}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-zinc-900 rounded-2xl bg-zinc-900/10">
            <p className="text-sm text-zinc-500 font-medium">
              No posts in this group yet
            </p>
            <p className="text-xs text-zinc-600 mt-1">
              Start the conversation by sharing a thought below.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Action Area (Sticky Input or Join Button CTA) */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-xl">
        {!isGroupMember ? (
          <button
            onClick={handleJoinGroup}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-white text-zinc-950 text-sm font-semibold rounded-xl shadow-lg shadow-black/20 active:scale-[0.99] transition duration-150"
          >
            <FiUserPlus className="text-base" />
            <span>Join Group to Participate</span>
          </button>
        ) : editedPost ? (
          <div className="space-y-2 rounded-xl bg-violet-950/10 border border-violet-500/20 p-3 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between text-xs font-semibold text-violet-400 px-1">
              <span>Editing Active Post</span>
              <button
                onClick={() => {
                  setEditedPost(null);
                  setEditedPostData(null);
                }}
                className="hover:underline text-zinc-500 hover:text-zinc-300"
              >
                Cancel edit
              </button>
            </div>
            <ChatInput
              onSubmit={handleUpdateForm}
              editChat={editedPostData?.text}
            />
          </div>
        ) : (
          <ChatInput onSubmit={handleNewPost} />
        )}
      </div>
      {editedPost ? (
        <p>
          You are currently editing a post. Make your changes and submit to
          update `
        </p>
      ) : null}
    </div>
  );
}

export default GroupPage;
