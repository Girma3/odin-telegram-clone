import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReactions,
  addReactionToPost,
  deleteReaction,
} from "../services/reactionService.js";

const postReactionsKey = (postId) => ["posts", postId, "reactions"];

function useGetReactions(postId, options = {}) {
  return useQuery({
    queryKey: postReactionsKey(postId),
    queryFn: () => getReactions(postId),
    enabled: !!postId,
    ...options,
  });
}

function useAddReaction(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, ...reactionData }) =>
      addReactionToPost(postId, reactionData),
    onMutate: async ({ postId, ...reactionData }) => {
      await queryClient.cancelQueries(postReactionsKey(postId));

      const previousReactions = queryClient.getQueryData(
        postReactionsKey(postId),
      );

      const optimisticReaction = {
        ...reactionData,
        id: Date.now().toString(),
        optimistic: true,
      };

      queryClient.setQueryData(postReactionsKey(postId), (old = []) => [
        ...old,
        optimisticReaction,
      ]);

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postReactionsKey(variables.postId),
        context.previousReactions,
      );
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      queryClient.setQueryData(
        postReactionsKey(variables.postId),
        (old = []) => [...old.filter((item) => !item.optimistic), result],
      );
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postReactionsKey(variables.postId));
    },
  });
}

function useDeleteReaction(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }) => deleteReaction(postId),
    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries(postReactionsKey(postId));

      const previousReactions = queryClient.getQueryData(
        postReactionsKey(postId),
      );

      queryClient.setQueryData(postReactionsKey(postId), (old = []) =>
        old.filter((reaction) => !reaction.optimistic),
      );

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postReactionsKey(variables.postId),
        context.previousReactions,
      );
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postReactionsKey(variables.postId));
    },
  });
}

export { useGetReactions, useAddReaction, useDeleteReaction };
