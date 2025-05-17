'use client';

import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/context/SocketContext'; // Import the global socket hook

// Tip tanımlamaları
interface Message {
  id?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: Date;
  isRead: boolean;
  message_type: 'text' | 'permission_request' | 'system';
  metadata?: {
    attemptId?: number;
    projectNumber?: string;
    expenseNumber?: string;
    oldAmount?: number;
    newAmount?: number;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

// Define a type for the user object, especially for lastMessage
interface ChatUser {
  id: number;
  username: string; // Or other user properties
  // ... other user properties
  lastMessage?: {
    content: string;
    timestamp: Date | string; // Consistent typing
    isRead: boolean;
  };
}

export function useChatService() {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const { user: currentUser } = useAuth();
  const { socket, isConnected: isSocketConnected, clearNewMessageIndicator } = useSocket();

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.id) return;
      setIsLoadingUsers(true);
      try {
        const response = await axiosInstance.get('/users/chat');
        const filteredUsers: ChatUser[] = response.data.filter(
          (user: any) => user.id !== currentUser?.id
        );
        // Initialize users with a placeholder for lastMessage if not present
        const usersWithLastMessage = filteredUsers.map(u => ({
            ...u,
            lastMessage: u.lastMessage || { content: '', timestamp: new Date(), isRead: true }
        }));
        setUsers(usersWithLastMessage);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [currentUser?.id]);

  // Handle socket events for chat page
  useEffect(() => {
    if (!socket || !isSocketConnected || !currentUser) return;

    // Listener for messages within the currently selected direct chat
    const handleDirectMessage = (newMessage: Message) => {
      // Only process if it's for the currently selected chat and not from self (already handled optimistically)
      if (selectedUser &&
          (newMessage.senderId === selectedUser.id && newMessage.recipientId === currentUser.id) ) {
        setMessages(prev => [...prev, newMessage]);
        // Mark message as read on server
        socket.emit('markMessagesAsRead', {
          senderId: selectedUser.id,
          recipientId: currentUser.id
        });
        // Update user list (last message, isRead status)
        updateUserWithLastMessage(newMessage, true); // true because chat is open
      }
    };

    // Listener for general new message notifications to update user list UI
    const handleNewMessageNotificationForUserList = (notification: { message: Message, sender?: ChatUser }) => {
        const { message } = notification;
        // Update the user list: new message content, timestamp, reorder
        // Check if message is from someone not the current user
        if (message.senderId !== currentUser.id) {
            setUsers((prevUsers) => {
                const userExists = prevUsers.find(u => u.id === message.senderId);
                let updatedUsers = prevUsers.map((user) => {
                    if (user.id === message.senderId) {
                        return {
                            ...user,
                            lastMessage: {
                                content: message.content,
                                timestamp: message.createdAt,
                                // If this chat is currently selected, it's read. Otherwise, unread.
                                isRead: selectedUser?.id === message.senderId,
                            },
                        };
                    }
                    return user;
                });

                // If new user, add to list (requires sender info, or fetch)
                // For simplicity, assuming sender is already in users list for now or handled by a separate user update mechanism
                // if (!userExists && notification.sender) {
                //   updatedUsers = [{...notification.sender, lastMessage: {content: message.content, timestamp: message.createdAt, isRead: false}}, ...updatedUsers];
                // }


                // Move user with new message to top
                const senderUser = updatedUsers.find((user) => user.id === message.senderId);
                if (senderUser) {
                    const otherUsers = updatedUsers.filter((user) => user.id !== message.senderId);
                    return [senderUser, ...otherUsers];
                }
                return updatedUsers;
            });
        } else { // Message sent by current user, update their chat with recipient
             setUsers((prevUsers) => {
                return prevUsers.map((user) => {
                    if (user.id === message.recipientId) { // Find the recipient in the user list
                        return {
                            ...user,
                            lastMessage: {
                                content: message.content,
                                timestamp: message.createdAt,
                                isRead: true, // Read for the sender
                            },
                        };
                    }
                    return user;
                });
            });
        }
    };

    socket.on('directMessage', handleDirectMessage); // For messages in the active chat window
    socket.on('newMessageNotification', handleNewMessageNotificationForUserList); // For updating user list

    return () => {
      socket.off('directMessage', handleDirectMessage);
      socket.off('newMessageNotification', handleNewMessageNotificationForUserList);
    };
  }, [socket, isSocketConnected, selectedUser, currentUser]);

  // Load messages when a user is selected & join chat room
  useEffect(() => {
    if (!selectedUser || !socket || !isSocketConnected || !currentUser) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    console.log(`Joining chat with ${selectedUser.username} (ID: ${selectedUser.id})`);
    socket.emit('joinDirectChat', { recipientId: selectedUser.id }, (response: any) => {
      if (response.success && response.messages) {
        setMessages(response.messages);
        socket.emit('markMessagesAsRead', { senderId: selectedUser.id, recipientId: currentUser.id });
        clearNewMessageIndicator(); // Clear global notification dot
        // Update selected user in the list to mark as read
        /*
        setUsers(prevUsers => prevUsers.map(u =>
            u.id === selectedUser.id ? { ...u, lastMessage: { ...u.lastMessage, isRead: true } } : u
        ));
        */
      } else {
        console.error("Failed to join direct chat or load messages:", response.error);
        setMessages([]);
      }
      setIsLoadingMessages(false);
    });

    return () => {
      if (socket && selectedUser) {
        console.log(`Leaving chat with ${selectedUser.username} (ID: ${selectedUser.id})`);
        socket.emit('leaveDirectChat', { recipientId: selectedUser.id });
      }
      setMessages([]);
    };
  }, [selectedUser, socket, isSocketConnected, currentUser, clearNewMessageIndicator]);

  // Update user in list with last message info
  const updateUserWithLastMessage = useCallback((message: Message, isReadContextually: boolean) => {
    const targetUserId = message.senderId === currentUser?.id ? message.recipientId : message.senderId;
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === targetUserId
          ? {
              ...user,
              lastMessage: {
                content: message.content,
                timestamp: message.createdAt,
                isRead: isReadContextually,
              },
            }
          : user
      )
    );
  }, [currentUser?.id]);

  // Send message
  const sendMessage = useCallback((content: string, type: 'text' | 'permission_request' | 'system' = 'text', metadata: any = null) => {
    if (!socket || !isSocketConnected || !selectedUser || !currentUser) {
      console.warn('Cannot send message: Socket not ready, user not selected, or current user not available.');
      return false;
    }

    const messageData: Message = {
      senderId: Number(currentUser.id),
      recipientId: Number(selectedUser.id),
      content,
      createdAt: new Date(),
      isRead: false,
      message_type: type,
      metadata,
    };

    socket.emit('sendDirectMessage', messageData);

    // Optimistic UI update
    setMessages(prev => [...prev, messageData]);
    updateUserWithLastMessage(messageData, true); // True because current user sent it

     // If the recipient was at the bottom or didn't have a recent message, move them to top
    setUsers(prevUsers => {
        const targetUser = prevUsers.find(u => u.id === selectedUser.id);
        if (targetUser) {
            const otherUsers = prevUsers.filter(u => u.id !== selectedUser.id);
            return [targetUser, ...otherUsers];
        }
        return prevUsers;
    });


    return true;
  }, [socket, isSocketConnected, selectedUser, currentUser, updateUserWithLastMessage]);

  return {
    users,
    selectedUser,
    setSelectedUser,
    messages,
    isSocketConnected,
    isLoadingUsers,
    isLoadingMessages,
    sendMessage,
  };
}