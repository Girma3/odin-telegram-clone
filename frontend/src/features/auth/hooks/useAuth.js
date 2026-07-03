import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  clearTokens,
} from "../services/authService.js";
import { useNavigate } from "react-router-dom";

const authQueryKey = ["currentUser"];

function useLogin(options = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (result, variables, context) => {
      const user = result?.user || null;

      //  Clear all data EXCEPT your auth key
      // this stops data leaks without destroying  route listeners
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "currentUser",
      });

      if (user) {
        //inject the logged-in user into the active cache
        queryClient.setQueryData(authQueryKey, user);
      }

      //force a quick background sync validation check
      queryClient.invalidateQueries({ queryKey: authQueryKey });

      options.onSuccess?.(result, variables, context);
      navigate("/", { replace: true });
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

      // Clear layout caches for a fresh, empty account setup
      queryClient.clear();

      options.onSuccess?.(result, variables, context);

      // Sync fresh account data state with the server
      queryClient.invalidateQueries({ queryKey: authQueryKey });
    },
    onError: options.onError,
  });
}

function useLogout(options = {}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: (data, variables, context) => {
      //  wipe local storage auth tokens
      clearTokens();
      queryClient.setQueryData(authQueryKey, null);
      queryClient.invalidateQueries({ queryKey: authQueryKey });

      queryClient.clear();
      //  Run optional navigation/cleanup callbacks (e.g., navigate("/login"))
      options.onSuccess?.(data, variables, context);
      navigate("/auth", { replace: true });
    },
    onError: options.onError,
  });
}

function useGetCurrentUser(options = {}) {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 5, //5 min
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: true,

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

export { useSignup, useLogin, useLogout, useGetCurrentUser, authQueryKey };
