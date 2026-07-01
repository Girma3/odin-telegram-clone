import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGroup,
  joinGroup,
  leaveGroup,
  getGroupByUserId,
  getAllGroups,
  getGroupByName,
  getGroup,
  addMemberToGroup,
  getMembers,
  getPosts,
  removeMemberFromGroup,
  updateGroup,
  deleteGroup,
  isUserGroupAdmin,
  isUserGroupMember,
} from "../services/groupService.js";

const groupKey = (id) => ["group", id];
const groupsKey = ["groups"];
const groupByNameKey = (name) => ["groups", "byName", name];
const groupMembersKey = (groupId) => ["groups", groupId, "members"];
const groupPostsKey = (groupId) => ["groups", groupId, "posts"];

// Get all groups
function useGetAllGroups(options = {}) {
  return useQuery({
    queryKey: groupsKey,
    queryFn: getAllGroups,
    ...options,
  });
}

// Get group by name
function useGetGroupByName(name, options = {}) {
  return useQuery({
    queryKey: groupByNameKey(name),
    queryFn: () => getGroupByName(name),
    enabled: !!name,
    ...options,
  });
}

function useGetGroupByUserId(userId, options = {}) {
  return useQuery({
    queryKey: groupKey(userId),
    queryFn: () => getGroupByUserId(userId),
    enabled: !!userId,
    ...options,
  });
}
function useGetGroup(groupId, options = {}) {
  return useQuery({
    queryKey: groupKey(groupId),
    queryFn: () => {
      return getGroup(groupId);
    },
    enabled: !!groupId,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: false,
    ...options,
  });
}

// Get group members
function useGetMembers(groupId, options = {}) {
  return useQuery({
    queryKey: groupMembersKey(groupId),
    queryFn: () => getMembers(groupId),
    enabled: !!groupId,
    ...options,
  });
}

// Get group posts
function useGetPosts(groupId, options = {}) {
  return useQuery({
    queryKey: groupPostsKey(groupId),
    queryFn: () => getPosts(groupId),
    enabled: !!groupId,
    ...options,
  });
}

// Create group
function useCreateGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onMutate: async (newGroup) => {
      await queryClient.cancelQueries(groupsKey);

      const previousGroups = queryClient.getQueryData(groupsKey);

      const optimisticGroup = {
        ...newGroup,
        id: Date.now(),
        optimistic: true,
      };
      queryClient.setQueryData(groupsKey, (old = []) => [
        ...old,
        optimisticGroup,
      ]);

      return { previousGroups };
    },
    onError: (err, newGroup, context) => {
      queryClient.setQueryData(groupsKey, context.previousGroups);
      options.onError?.(err, newGroup, context);
    },
    onSuccess: (result, variables, context) => {
      const group = result?.group;
      if (group) {
        queryClient.setQueryData(groupKey(group.id), group);
        queryClient.setQueryData(groupsKey, (old = []) =>
          old.map((g) => (g.optimistic ? group : g)),
        );
      }
      options.onSuccess?.(result, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries(groupsKey);
    },
  });
}

// Join group
function useJoinGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: joinGroup,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(groupsKey);
      queryClient.invalidateQueries(groupKey(variables));
      queryClient.invalidateQueries(groupMembersKey(variables));
      options.onSuccess?.(result, variables, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
  });
}

// Leave group
function useLeaveGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: leaveGroup,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(groupsKey);
      queryClient.invalidateQueries(groupKey(variables));
      queryClient.invalidateQueries(groupMembersKey(variables));
      options.onSuccess?.(result, variables, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
  });
}

// Update group
function useUpdateGroup(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGroup,
    onMutate: async ({ groupId, ...groupData }) => {
      // 1. Cancel active queries to protect the snapshot
      await queryClient.cancelQueries({ queryKey: groupsKey });
      await queryClient.cancelQueries({ queryKey: groupKey(groupId) });

      const previousGroups = queryClient.getQueryData(groupsKey);
      const previousGroup = queryClient.getQueryData(groupKey(groupId));

      // 2. Perform optimistic updates instantly
      queryClient.setQueryData(groupsKey, (old = []) =>
        old.map((g) => (g.id === groupId ? { ...g, ...groupData } : g)),
      );

      queryClient.setQueryData(groupKey(groupId), (old) => ({
        ...old,
        ...groupData,
      }));

      return { previousGroups, previousGroup };
    },
    onError: (err, variables, context) => {
      // 3. Rollback on failure
      if (context?.previousGroups) {
        queryClient.setQueryData(groupsKey, context.previousGroups);
      }
      if (context?.previousGroup) {
        queryClient.setQueryData(
          groupKey(variables.groupId),
          context.previousGroup,
        );
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      // 4. FIXED: Automatically handle both flat payloads and nested object payloads safely
      const group = result?.group || result;

      if (group?.id) {
        queryClient.setQueryData(groupKey(group.id), group);

        // Also keep the main feed array synchronized with the genuine backend data
        queryClient.setQueryData(groupsKey, (old = []) =>
          old.map((g) => (g.id === group.id ? group : g)),
        );
      }

      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, error, variables) => {
      // 5. Silent background updates to eliminate UI stuttering
      const groupId = result?.group?.id || result?.id || variables.groupId;

      queryClient.invalidateQueries({
        queryKey: groupsKey,
        refetchType: "none",
      });
      if (groupId) {
        queryClient.invalidateQueries({
          queryKey: groupKey(groupId),
          refetchType: "none",
        });
      }
    },
  });
}

// Delete group
function useDeleteGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGroup,
    onMutate: async (groupId) => {
      await queryClient.cancelQueries(groupsKey);

      const previousGroups = queryClient.getQueryData(groupsKey);

      queryClient.setQueryData(groupsKey, (old = []) =>
        old.filter((g) => g.id !== groupId),
      );

      return { previousGroups };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(groupsKey, context.previousGroups);
      options.onError?.(err, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries(groupsKey);
    },
  });
}

// Add member to group
function useAddMemberToGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }) => addMemberToGroup(groupId, userId),
    onSuccess: (result, { groupId }, context) => {
      queryClient.invalidateQueries(groupMembersKey(groupId));
      queryClient.invalidateQueries(groupKey(groupId));
      options.onSuccess?.(result, { groupId }, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
  });
}

// Remove member from group
function useRemoveMemberFromGroup(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, userId }) => removeMemberFromGroup(groupId, userId),
    onSuccess: (result, { groupId }, context) => {
      queryClient.invalidateQueries(groupMembersKey(groupId));
      queryClient.invalidateQueries(groupKey(groupId));
      options.onSuccess?.(result, { groupId }, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
  });
}
//check user is admin
// API functions

// Hooks (useQuery for reads)
function useIsUserMember(groupId, userId, options = {}) {
  return useQuery({
    queryKey: ["isMember", groupId, userId],
    queryFn: () => isUserGroupMember(groupId, userId),
    ...options,
  });
}

function useIsUserAdmin(groupId, userId, options = {}) {
  return useQuery({
    queryKey: ["isAdmin", groupId, userId],
    queryFn: () => isUserGroupAdmin(groupId, userId),
    ...options,
  });
}

export {
  useGetAllGroups,
  useGetGroupByUserId,
  useGetGroupByName,
  useGetGroup,
  useGetMembers,
  useGetPosts,
  useCreateGroup,
  useJoinGroup,
  useLeaveGroup,
  useUpdateGroup,
  useDeleteGroup,
  useAddMemberToGroup,
  useRemoveMemberFromGroup,
  useIsUserAdmin,
  useIsUserMember,
};
