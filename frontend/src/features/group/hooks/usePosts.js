import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllPosts,
  getPostsByUser,
  getGroupPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
} from "../services/PostService.js";

const postsKey = ["posts", "feed"];
const userPostsKey = (userId) => ["posts", "user", userId];
const groupPostsKey = (groupId) => ["posts", "group", groupId];
const postKey = (postId) => ["posts", postId];

function useGetAllPosts(options = {}) {
  return useQuery({
    queryKey: postsKey,
    queryFn: getAllPosts,
    ...options,
  });
}

function useGetPostsByUser(userId, options = {}) {
  return useQuery({
    queryKey: userPostsKey(userId),
    queryFn: () => getPostsByUser(userId),
    enabled: !!userId,
    ...options,
  });
}

function useGetGroupPosts(groupId, options = {}) {
  return useQuery({
    queryKey: groupPostsKey(groupId),
    queryFn: () => getGroupPosts(groupId),
    enabled: !!groupId,
    ...options,
  });
}

function useGetPost(postId, options = {}) {
  return useQuery({
    queryKey: postKey(postId),
    queryFn: () => getPost(postId),
    enabled: !!postId,
    ...options,
  });
}

function useCreatePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      const { groupId } = newPost;
      await queryClient.cancelQueries(postsKey);
      if (groupId) await queryClient.cancelQueries(groupPostsKey(groupId));

      const previousFeed = queryClient.getQueryData(postsKey);
      const previousGroupPosts = groupId
        ? queryClient.getQueryData(groupPostsKey(groupId))
        : undefined;

      const optimisticPost = {
        ...newPost,
        id: Date.now().toString(),
        optimistic: true,
      };

      queryClient.setQueryData(postsKey, (old = []) => [
        optimisticPost,
        ...old,
      ]);

      if (groupId) {
        queryClient.setQueryData(groupPostsKey(groupId), (old = []) => [
          optimisticPost,
          ...old,
        ]);
      }

      return { previousFeed, previousGroupPosts };
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(postsKey, context.previousFeed);
      if (newPost.groupId) {
        queryClient.setQueryData(
          groupPostsKey(newPost.groupId),
          context.previousGroupPosts,
        );
      }
      options.onError?.(err, newPost, context);
    },
    onSuccess: (result, variables, context) => {
      const post = result;
      if (!post) return;

      queryClient.setQueryData(postsKey, (old = []) => [
        post,
        ...old.filter((item) => !item.optimistic),
      ]);

      if (post.groupId) {
        queryClient.setQueryData(groupPostsKey(post.groupId), (old = []) => [
          post,
          ...old.filter((item) => !item.optimistic),
        ]);
      }

      queryClient.setQueryData(postKey(post.id), post);
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postsKey);
      if (variables?.groupId) {
        queryClient.invalidateQueries(groupPostsKey(variables.groupId));
      }
      if (variables?.userId) {
        queryClient.invalidateQueries(userPostsKey(variables.userId));
      }
    },
  });
}

function useUpdatePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onMutate: async ({ postId, ...postData }) => {
      await queryClient.cancelQueries(postKey(postId));

      const previousPost = queryClient.getQueryData(postKey(postId));
      const previousFeed = queryClient.getQueryData(postsKey);

      queryClient.setQueryData(postKey(postId), (old) => ({
        ...old,
        ...postData,
      }));

      queryClient.setQueryData(postsKey, (old = []) =>
        old.map((post) =>
          post.id === postId ? { ...post, ...postData } : post,
        ),
      );

      return { previousPost, previousFeed };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(postKey(variables.postId), context.previousPost);
      queryClient.setQueryData(postsKey, context.previousFeed);
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      const post = result;
      if (!post) return;

      queryClient.setQueryData(postKey(post.id), post);
      queryClient.setQueryData(postsKey, (old = []) =>
        old.map((item) => (item.id === post.id ? post : item)),
      );

      if (post.groupId) {
        queryClient.setQueryData(groupPostsKey(post.groupId), (old = []) =>
          old.map((item) => (item.id === post.id ? post : item)),
        );
      }
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, variables) => {
      queryClient.invalidateQueries(postKey(variables.postId));
      queryClient.invalidateQueries(postsKey);
      if (result?.groupId) {
        queryClient.invalidateQueries(groupPostsKey(result.groupId));
      }
    },
  });
}

function useDeletePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      await queryClient.cancelQueries(postKey(postId));

      const previousPost = queryClient.getQueryData(postKey(postId));
      const previousFeed = queryClient.getQueryData(postsKey);

      queryClient.setQueryData(postsKey, (old = []) =>
        old.filter((post) => post.id !== postId),
      );

      if (previousPost?.groupId) {
        queryClient.setQueryData(
          groupPostsKey(previousPost.groupId),
          (old = []) => old.filter((post) => post.id !== postId),
        );
      }

      queryClient.removeQueries(postKey(postId));

      return { previousPost, previousFeed };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(postKey(variables), context.previousPost);
      queryClient.setQueryData(postsKey, context.previousFeed);
      if (context.previousPost?.groupId) {
        queryClient.setQueryData(
          groupPostsKey(context.previousPost.groupId),
          (old = []) => [...old, context.previousPost],
        );
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, postId, context) => {
      options.onSuccess?.(result, postId, context);
    },
    onSettled: (result, postId) => {
      queryClient.invalidateQueries(postsKey);
      queryClient.invalidateQueries(postKey(postId));
    },
  });
}

export {
  useGetAllPosts,
  useGetPostsByUser,
  useGetGroupPosts,
  useGetPost,
  useCreatePost,
  useUpdatePost,
  useDeletePost,
};
