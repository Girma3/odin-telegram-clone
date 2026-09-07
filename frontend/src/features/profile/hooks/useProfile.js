import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProfile,
  getProfile,
  getProfileByUserId,
  getProfiles,
  updateProfile,
  deleteProfile,
} from "../services/profileService.js";

const profileKey = (id) => ["profile", id];
const profilesKey = ["profiles"];
const profileByUserKey = (userId) => ["profiles", "byUser", userId];

// Get all profiles
function useGetProfiles(options = {}) {
  return useQuery({
    queryKey: profilesKey,
    queryFn: getProfiles,
    ...options,
  });
}
function useGetProfileByUser(userId, options = {}) {
  return useQuery({
    queryKey: profileByUserKey(userId),
    queryFn: () => getProfileByUserId(userId),
    enabled: !!userId, // only run when userId is provided
    ...options,
  });
}

// Get single profile
function useGetProfile(profileId, options = {}) {
  return useQuery({
    queryKey: profileKey(profileId),
    queryFn: () => getProfile(profileId),
    ...options,
  });
}

// Create profile
function useCreateProfile(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProfile,
    onMutate: async (newProfile) => {
      await queryClient.cancelQueries(profilesKey);

      const previousProfiles = queryClient.getQueryData(profilesKey);

      // Optimistically add new profile with a temp ID
      const optimisticProfile = {
        ...newProfile,
        id: Date.now(),
        optimistic: true,
      };
      queryClient.setQueryData(profilesKey, (old = []) => [
        ...old,
        optimisticProfile,
      ]);

      return { previousProfiles };
    },
    onError: (err, newProfile, context) => {
      // Rollback
      queryClient.setQueryData(profilesKey, context.previousProfiles);
      options.onError?.(err, newProfile, context);
    },
    onSuccess: (result, variables, context) => {
      const profile = result?.profile;
      if (profile) {
        queryClient.setQueryData(profileKey(profile.id), profile);
        queryClient.setQueryData(profilesKey, (old = []) =>
          old.map((p) => (p.optimistic ? profile : p)),
        );
      }
      options.onSuccess?.(result, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries(profilesKey);
    },
  });
}

// Update profile
function useUpdateProfile(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onMutate: async (updatedProfile) => {
      await queryClient.cancelQueries(profilesKey);

      const previousProfiles = queryClient.getQueryData(profilesKey);

      queryClient.setQueryData(profilesKey, (old = []) =>
        old.map((p) =>
          p.id === updatedProfile.id ? { ...p, ...updatedProfile } : p,
        ),
      );

      return { previousProfiles };
    },
    onError: (err, updatedProfile, context) => {
      queryClient.setQueryData(profilesKey, context.previousProfiles);
      options.onError?.(err, updatedProfile, context);
    },
    onSuccess: (result, variables, context) => {
      const profile = result;
      if (profile) {
        queryClient.setQueryData(profileKey(profile.id), profile);
      }
      queryClient.invalidateQueries(profilesKey);
      options.onSuccess?.(result, variables, context);
    },
    onSettled: () => {
      queryClient.invalidateQueries(profilesKey);
    },
  });
}

// Delete profile
function useDeleteProfile(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfile, // Assumes object: { id, userId }

    onMutate: async ({ profileId, userId }) => {
      // cancel all active queries for these keys to prevent racing states
      await queryClient.cancelQueries({ queryKey: profilesKey });
      if (profileId)
        await queryClient.cancelQueries({ queryKey: profileKey(profileId) });
      if (userId)
        await queryClient.cancelQueries({ queryKey: profileByUserKey(userId) });

      // snapshot the current master list for rollback safety
      const previousProfiles = queryClient.getQueryData(profilesKey);

      // optimistically update the master list array
      queryClient.setQueryData(profilesKey, (old = []) => {
        if (!Array.isArray(old)) return [];
        return old.filter((p) => p.id !== profileId);
      });

      return { previousProfiles };
    },

    onError: (err, variables, context) => {
      // Rollback the master list if the server request fails
      if (context?.previousProfiles) {
        queryClient.setQueryData(profilesKey, context.previousProfiles);
      }
      options.onError?.(err, variables, context);
    },

    onSuccess: (data, variables, context) => {
      // 4. MEMORY PURGE: Remove individual cache items entirely
      // This stops other components from reading deleted data from cache
      if (variables.profileId) {
        queryClient.removeQueries({
          queryKey: profileKey(variables.profileId),
        });
      }
      if (variables.userId) {
        queryClient.removeQueries({
          queryKey: profileByUserKey(variables.userId),
        });
      }

      options.onSuccess?.(data, variables, context);
    },

    onSettled: (data, error, variables) => {
      //  Invalidate master list to ensure it syncs perfectly with server reality
      queryClient.invalidateQueries({ queryKey: profilesKey });

      options.onSettled?.(data, error, variables);
    },
  });
}

export {
  useGetProfiles,
  useGetProfile,
  useGetProfileByUser,
  useCreateProfile,
  useUpdateProfile,
  useDeleteProfile,
  profileKey,
  profilesKey,
  profileByUserKey,
};
