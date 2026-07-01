import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getConversations,
  getUnreadMessages,
  getConversation,
  markConversationRead,
  getChat,
  sendPrivateMessage,
  markMessageAsRead,
  deleteChat,
  editChat,
  getUnreadChatCount,
} from "../services/chatService";

const chatKey = (chatId) => ["chat", chatId];

const conversationsKey = ["conversations"];
const conversationKey = (chatId) => ["conversations", chatId];
const unreadKey = ["unread"];

// Get all conversations
function useGetConversations(options = {}) {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: getConversations,
    ...options,
  });
}

// Get all unread message count
function useGetUnreadMessages(options = {}) {
  return useQuery({
    queryKey: unreadKey,
    queryFn: getUnreadMessages,
    ...options,
  });
} //get unread chat bn two users
function useGetUnreadChatCount(userId, options = {}) {
  return useQuery({
    queryKey: ["unreadChat", userId],
    queryFn: () => getUnreadChatCount(userId),
    enabled: !!userId,
    ...options,
  });
}

// Get conversation with a specific user
function useGetConversation(userId, options = {}) {
  return useQuery({
    queryKey: conversationKey(userId),
    queryFn: () => getConversation(userId),
    enabled: !!userId,
    ...options,
  });
}

// Mark conversation as read
function useMarkConversationRead(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markConversationRead,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(conversationsKey);
      queryClient.invalidateQueries(unreadKey);
      options.onSuccess?.(result, variables, context);
    },
  });
}

// Get single chat message by ID
function useGetChat(chatId, options = {}) {
  return useQuery({
    queryKey: chatKey(chatId),
    queryFn: () => getChat(chatId),
    enabled: !!chatId,
    ...options,
  });
}

//  SEND MESSAGE MUTATION
function useSendPrivateMessage(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendPrivateMessage,
    onMutate: async (newMsgPayload) => {
      const chatId = newMsgPayload.receiverId;
      const targetKey = conversationKey(chatId);

      // Cancel outgoing fetches so they don't overwrite our optimistic placement
      await queryClient.cancelQueries({ queryKey: targetKey });
      const previousMessages = queryClient.getQueryData(targetKey);

      // Create a temporary local message shell to insert immediately
      const optimisticMsg = {
        id: `temp-${Date.now()}`,
        ...newMsgPayload,
        created: new Date().toISOString(),
        read: false,
      };

      // Push message into UI cache layout instantly
      queryClient.setQueryData(targetKey, (old = []) => [
        ...old,
        optimisticMsg,
      ]);

      return { previousMessages, chatId };
    },
    onError: (err, newMsgPayload, context) => {
      // Rollback UI instantly if the user's internet drops or connection fails
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationKey(context.chatId),
          context.previousMessages,
        );
      }
      options.onError?.(err, newMsgPayload, context);
    },
    onSuccess: (result, newMsgPayload, context) => {
      const targetKey = conversationKey(context.chatId);

      // Swap out the temporary shell with the genuine message tracking ID from the database
      queryClient.setQueryData(targetKey, (old = []) =>
        old.map((msg) =>
          msg.id.toString().startsWith("temp-") ? result : msg,
        ),
      );

      options.onSuccess?.(result, newMsgPayload, context);
    },
    onSettled: (result, error, newMsgPayload, context) => {
      // Revalidate conversation arrays quietly in the background without layout locking
      queryClient.invalidateQueries({
        queryKey: conversationsKey,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: conversationKey(context.chatId),
        refetchType: "none",
      });
    },
  });
}

//  EDIT MESSAGE MUTATION
function useEdit(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editChat,
    onMutate: async ({ chatId: messageId, data: payload }) => {
      const chatId = payload.receiverId;
      const targetKey = conversationKey(chatId);

      await queryClient.cancelQueries({ queryKey: targetKey });
      const previousMessages = queryClient.getQueryData(targetKey);

      // Optimistically overwrite the specific message text instantly
      queryClient.setQueryData(targetKey, (old = []) =>
        old.map((msg) => (msg.id === messageId ? { ...msg, ...payload } : msg)),
      );

      return { previousMessages, chatId };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationKey(context.chatId),
          context.previousMessages,
        );
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, error, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: conversationsKey,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: conversationKey(context.chatId),
        refetchType: "none",
      });
    },
  });
}

// DELETE MESSAGE MUTATION
function useDeleteChat(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteChat,
    onMutate: async ({ messageId, chatId }) => {
      const targetKey = conversationKey(chatId);

      await queryClient.cancelQueries({ queryKey: targetKey });
      const previousMessages = queryClient.getQueryData(targetKey);

      // Remove the targeted message bubble from the screen instantly
      queryClient.setQueryData(targetKey, (old = []) =>
        old.filter((msg) => msg.id !== messageId),
      );

      return { previousMessages, chatId };
    },
    onError: (err, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          conversationKey(context.chatId),
          context.previousMessages,
        );
      }
      options.onError?.(err, variables, context);
    },
    onSuccess: (result, variables, context) => {
      options.onSuccess?.(result, variables, context);
    },
    onSettled: (result, error, variables, context) => {
      queryClient.invalidateQueries({
        queryKey: conversationsKey,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: unreadKey,
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: conversationKey(context.chatId),
        refetchType: "none",
      });
    },
  });
}

// Mark single message as read
function useMarkMessageAsRead(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markMessageAsRead,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(unreadKey);
      options.onSuccess?.(result, variables, context);
    },
  });
}
function getUnreadChatWithUserCount(userId, currentUserId, chats) {
  const chatsWithUser = chats.filter(
    (chat) =>
      chat.senderId === userId &&
      chat.receiverId === currentUserId &&
      !chat.read,
  );

  return chatsWithUser.length;
}
function useUnreadCount(userId, currentUserId, privateChats) {
  const {
    data: unreadMessages,
    isSuccess,
    isLoading,
  } = useGetUnreadChatCount(currentUserId); //sender is current user
  if (!isLoading && !isSuccess) return 0;
  if (!privateChats) return 0;
  //local calculation
  const localUnreadCount =
    privateChats.length > 0
      ? getUnreadChatWithUserCount(userId, currentUserId, privateChats)
      : 0;
  if (!isLoading && !isSuccess) {
    return localUnreadCount;
  }

  return unreadMessages ? unreadMessages.unreadChatCount : localUnreadCount;
}

export {
  useGetConversations,
  useGetUnreadMessages,
  useGetUnreadChatCount,
  useGetConversation,
  useMarkConversationRead,
  useGetChat,
  useSendPrivateMessage,
  useMarkMessageAsRead,
  useEdit,
  useDeleteChat,
  useUnreadCount,
};
