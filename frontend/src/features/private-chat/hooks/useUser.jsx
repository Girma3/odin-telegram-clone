import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getAllUsers,
  deleteUserById,
} from "../services/userService.js";
import {
  profilesKey,
  profileKey,
  profileByUserKey,
} from "../../profile/hooks/useProfile.js";
import { useNavigate } from "react-router-dom";

const queryKey = ["users"];
const userKey = (id) => ["user", id];
const userByUsernameKey = (username) => ["user", "username", username];
const userByEmailKey = (email) => ["user", "email", email];

function useGetUserById(userId, options = {}) {
  return useQuery({
    queryKey: userKey(userId),
    queryFn: () => getUserById(userId),
    ...options,
  });
}

function useGetUserByUsername(username, options = {}) {
  return useQuery({
    queryKey: userByUsernameKey(username),
    queryFn: () => getUserByUsername(username),
    ...options,
  });
}

function useGetUserByEmail(email, options = {}) {
  return useQuery({
    queryKey: userByEmailKey(email),
    queryFn: () => getUserByEmail(email),
    ...options,
  });
}

function useGetAllUsers(options = {}) {
  return useQuery({
    queryKey: queryKey,
    queryFn: getAllUsers,
    ...options,
  });
}

function useDeleteUser(options = {}) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    // 1. Unpack the object here and pass only userId to your API function
    mutationFn: ({ userId }) => deleteUserById(userId),

    onSuccess: async (result, variables, context) => {
      // variables contains { userId, profileId } sent from mutateAsync
      const { userId, profileId } = variables || {};

      // 2. Cancel active queries first to prevent race conditions
      if (profileId) {
        await queryClient.cancelQueries({ queryKey: profileKey(profileId) });
      }
      if (userId) {
        await queryClient.cancelQueries({ queryKey: profileByUserKey(userId) });
      }

      // 3. Invalidate specific, targeted query keys
      if (userId) {
        await queryClient.invalidateQueries({
          queryKey: profileByUserKey(userId),
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["profiles"] });
      await queryClient.clear();
      navigate("/auth", { replace: true });

      // 4. Trigger user-provided callback
      if (options.onSuccess) {
        await options.onSuccess(result, variables, context);
      }
    },
    onError: options.onError,
  });
}

export {
  useGetUserById,
  useGetUserByUsername,
  useGetUserByEmail,
  useGetAllUsers,
  useDeleteUser,
};
