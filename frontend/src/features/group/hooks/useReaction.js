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
function useAddReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, emoji }) => addReactionToPost(postId, { emoji }),

    onMutate: async ({ postId, emoji }) => {
      const queryKey = postReactionsKey(postId);
      await queryClient.cancelQueries({ queryKey });

      const previousReactions = queryClient.getQueryData(queryKey) ?? [];

      const optimisticReaction = {
        emoji,
        id: `optimistic-${Date.now()}`,
        optimistic: true,
      };

      // Handle updating safely
      queryClient.setQueryData(queryKey, (old = []) => [
        ...old,
        optimisticReaction,
      ]);

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postReactionsKey(variables.postId),
        context?.previousReactions,
      );
    },
    onSettled: (data, error, variables) => {
      // Force background re-synchronization frame
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      queryClient.invalidateQueries({
        queryKey: postReactionsKey(variables.postId),
      });
    },
  });
}
function useDeleteReaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }) => deleteReaction(postId),

    onMutate: async ({ postId, emoji }) => {
      const queryKey = postReactionsKey(postId);
      await queryClient.cancelQueries({ queryKey });

      const previousReactions = queryClient.getQueryData(queryKey) ?? [];

      // Optimistically filter out the target active emoji reaction icon
      queryClient.setQueryData(queryKey, (old = []) =>
        old.filter((reaction) => reaction.emoji !== emoji),
      );

      return { previousReactions };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postReactionsKey(variables.postId),
        context?.previousReactions,
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });

      queryClient.invalidateQueries({
        queryKey: postReactionsKey(variables.postId),
      });
    },
  });
}

export { useGetReactions, useAddReaction, useDeleteReaction };
