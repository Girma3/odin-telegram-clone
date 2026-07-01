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

function useDeletePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,
    onMutate: async (postId) => {
      // 1. Cancel all ongoing fetches for related keys to protect our snapshot
      await queryClient.cancelQueries({ queryKey: postsKey });
      await queryClient.cancelQueries({ queryKey: postKey(postId) });

      const previousPost = queryClient.getQueryData(postKey(postId));
      const previousFeed = queryClient.getQueryData(postsKey);

      // Keep track of the full group array state before mutating
      let previousGroupFeed = null;
      if (previousPost?.groupId) {
        const groupKey = groupPostsKey(previousPost.groupId);
        await queryClient.cancelQueries({ queryKey: groupKey });
        previousGroupFeed = queryClient.getQueryData(groupKey);
      }

      // 2. Perform optimistic UI updates instantly
      queryClient.setQueryData(postsKey, (old = []) =>
        old.filter((post) => post.id !== postId),
      );

      if (previousPost?.groupId) {
        queryClient.setQueryData(
          groupPostsKey(previousPost.groupId),
          (old = []) => old.filter((post) => post.id !== postId),
        );
      }

      // !!! REMOVED: queryClient.removeQueries(postKey(postId)) was dropped from here.
      // Wiping data early leaves React Query with a broken hook layout reference.

      return { previousPost, previousFeed, previousGroupFeed };
    },
    onError: (err, postId, context) => {
      // 3. Complete and accurate rollbacks if server fails
      if (context?.previousPost) {
        queryClient.setQueryData(postKey(postId), context.previousPost);
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(postsKey, context.previousFeed);
      }
      if (context?.previousPost?.groupId && context?.previousGroupFeed) {
        queryClient.setQueryData(
          groupPostsKey(context.previousPost.groupId),
          context.previousGroupFeed,
        );
      }
      options.onError?.(err, postId, context);
    },
    onSuccess: (result, postId, context) => {
      // 4. Clean up memory ONLY on guaranteed network success
      queryClient.removeQueries({ queryKey: postKey(postId) });
      options.onSuccess?.(result, postId, context);
    },
    onSettled: (result, error, postId, context) => {
      // 5. Run smart background validation without blocking layout UI thread
      queryClient.invalidateQueries({
        queryKey: postsKey,
        refetchType: "none",
      });
      if (context?.previousPost?.groupId) {
        queryClient.invalidateQueries({
          queryKey: groupPostsKey(context.previousPost.groupId),
          refetchType: "none",
        });
      }
    },
  });
}

function useUpdatePost(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePost,
    onMutate: async ({ postId, ...postData }) => {
      await queryClient.cancelQueries({ queryKey: postKey(postId) });
      await queryClient.cancelQueries({ queryKey: postsKey });

      const previousPost = queryClient.getQueryData(postKey(postId));
      const previousFeed = queryClient.getQueryData(postsKey);

      let previousGroupFeed = null;
      if (previousPost?.groupId) {
        const groupKey = groupPostsKey(previousPost.groupId);
        await queryClient.cancelQueries({ queryKey: groupKey });
        previousGroupFeed = queryClient.getQueryData(groupKey);
      }

      // Optimistic Single Post Update
      queryClient.setQueryData(postKey(postId), (old) => ({
        ...old,
        ...postData,
      }));

      // Optimistic Feed Update
      queryClient.setQueryData(postsKey, (old = []) =>
        old.map((post) =>
          post.id === postId ? { ...post, ...postData } : post,
        ),
      );

      // Optimistic Group Feed Update
      if (previousPost?.groupId) {
        queryClient.setQueryData(
          groupPostsKey(previousPost.groupId),
          (old = []) =>
            old.map((post) =>
              post.id === postId ? { ...post, ...postData } : post,
            ),
        );
      }

      return { previousPost, previousFeed, previousGroupFeed };
    },
    onError: (err, variables, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(
          postKey(variables.postId),
          context.previousPost,
        );
      }
      if (context?.previousFeed) {
        queryClient.setQueryData(postsKey, context.previousFeed);
      }
      if (context?.previousPost?.groupId && context?.previousGroupFeed) {
        queryClient.setQueryData(
          groupPostsKey(context.previousPost.groupId),
          context.previousGroupFeed,
        );
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      const post = result;
      if (!post) return;

      // Overwrite optimistic values with actual data returned from server database
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
    onSettled: (result) => {
      if (result?.id) {
        queryClient.invalidateQueries({
          queryKey: postKey(result.id),
          refetchType: "none",
        });
      }
      if (result?.groupId) {
        queryClient.invalidateQueries({
          queryKey: groupPostsKey(result.groupId),
          refetchType: "none",
        });
      }
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
