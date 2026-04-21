import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getAllUsers,
  deleteUserById,
} from "../services/userService.js";

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
  return useMutation({
    mutationFn: deleteUserById,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(queryKey);
      if (options.onSuccess) {
        options.onSuccess(result, variables, context);
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