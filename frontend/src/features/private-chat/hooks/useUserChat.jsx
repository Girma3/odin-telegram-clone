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
} from "../services/chatService";

const conversationsKey = ["conversations"];
const unreadKey = ["unread"];
const conversationKey = (userId) => ["conversation", userId];
const chatKey = (chatId) => ["chat", chatId];

// Get all conversations
function useGetConversations(options = {}) {
  return useQuery({
    queryKey: conversationsKey,
    queryFn: getConversations,
    ...options,
  });
}

// Get unread message count
function useGetUnreadMessages(options = {}) {
  return useQuery({
    queryKey: unreadKey,
    queryFn: getUnreadMessages,
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

// Send a private message
function useSendPrivateMessage(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendPrivateMessage,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(conversationsKey);
      options.onSuccess?.(result, variables, context);
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
//edit
function useEdit(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editChat,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(conversationsKey);
      options.onSuccess?.(result, variables, context);
    },
    onError: (err, variables, context) => {
      options.onError?.(err, variables, context);
    },
    onSettled: (result, error, variables, context) => {
      queryClient.invalidateQueries(conversationsKey);
    },
  });
}

// Delete a private message
function useDeleteChat(options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChat,
    onSuccess: (result, variables, context) => {
      queryClient.invalidateQueries(conversationsKey);
      queryClient.invalidateQueries(unreadKey);
      options.onSuccess?.(result, variables, context);
    },
  });
}

export {
  useGetConversations,
  useGetUnreadMessages,
  useGetConversation,
  useMarkConversationRead,
  useGetChat,
  useSendPrivateMessage,
  useMarkMessageAsRead,
  useEdit,
  useDeleteChat,
};
