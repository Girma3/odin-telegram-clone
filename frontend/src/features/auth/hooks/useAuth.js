import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  clearTokens,
} from "../services/authService.js";

const authQueryKey = ["currentUser"];

function useLogin(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (result, variables, context) => {
      const user = result?.user || null;
      if (user) {
        queryClient.setQueryData(authQueryKey, user);
      }
      if (options.onSuccess) {
        options.onSuccess(result, variables, context);
        queryClient.invalidateQueries(authQueryKey);
      }
    },
    onError: options.onError,
  });
}

function useSignup(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signup,
    onSuccess: (result, variables, context) => {
      const user = result?.user || null;
      if (user) {
        queryClient.setQueryData(authQueryKey, user);
      }
      if (options.onSuccess) {
        options.onSuccess(result, variables, context);
      }
    },
    onError: options.onError,
  });
}

function useLogout(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, context) => {
      clearTokens();
      queryClient.removeQueries(authQueryKey);
      if (options.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: options.onError,
  });
}

function useGetCurrentUser(options = {}) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    staleTime: Infinity,
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: false,

    // If backend returns { user: null }, we keep it clean
    select: (data) => data?.user || null,

    // Do NOT clear tokens here — refresh logic already handled in fetchWithAuth
    onError: (err) => {
      console.warn("Auth error:", err.message);
    },

    enabled: options.enabled ?? true,
    ...options,
  });
}

export { useSignup, useLogin, useLogout, useGetCurrentUser };
