import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCommentsForPost,
  createComment,
  deleteComment,
  getCommentsWithTelegramStyle,
  updateComment,
} from "../services/commentService.js";

const postCommentsKey = (postId, nested) => [
  "posts",
  postId,
  "comments",
  nested,
];

function useGetComments(postId, nested = true, options = {}) {
  return useQuery({
    queryKey: postCommentsKey(postId, nested),
    queryFn: () => getCommentsForPost(postId, nested),
    enabled: !!postId,
    ...options,
  });
}

function useCreateComment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onMutate: async ({ postId, ...commentData }) => {
      await queryClient.cancelQueries(postCommentsKey(postId));

      const previousComments = queryClient.getQueryData(
        postCommentsKey(postId),
      );

      const optimisticComment = {
        ...commentData,
        id: Date.now().toString(),
        optimistic: true,
      };

      queryClient.setQueryData(postCommentsKey(postId), (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postCommentsKey(variables.postId),
        context.previousComments,
      );
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      const comment = result;
      if (!comment) return;

      queryClient.setQueryData(
        postCommentsKey(variables.postId),
        (old = []) => [...old.filter((item) => !item.optimistic), comment],
      );
      queryClient.invalidateQueries(postCommentsKey(variables.postId));
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postCommentsKey(variables.postId));
    },
  });
}

function useDeleteComment(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onMutate: async ({ commentId, postId }) => {
      await queryClient.cancelQueries(postCommentsKey(postId));

      const previousComments = queryClient.getQueryData(
        postCommentsKey(postId),
      );

      queryClient.setQueryData(postCommentsKey(postId), (old = []) =>
        old.filter((comment) => comment.id !== commentId),
      );

      return { previousComments };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        postCommentsKey(variables.postId),
        context.previousComments,
      );
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(postCommentsKey(variables.postId));
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postCommentsKey(variables.postId));
    },
  });
}
function useThreadedComments(options = {}) {
  return useQuery({
    queryFn: getCommentsWithTelegramStyle,
    ...options,
  });
}
function useUpdateComment(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateComment,
    onSuccess: (result, variables, context) => {
      options.onSuccess?.(result, variables, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
    onSettled: (result, error, variables) => {
      queryClient.invalidateQueries(postCommentsKey(variables.postId));
    },
  });
}
export {
  useGetComments,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useThreadedComments,
};
