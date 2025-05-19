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
    senderDetailsForNewUser?: Omit<ChatUser, 'lastMessage'>;
  };
}

// Define a type for the user object, especially for lastMessage
interface ChatUser {
  id: number;
  username: string; // Or other user properties
  // ... other user properties
  lastMessage?: {
    content: string;
    timestamp: Date | string | null; // Allow null for timestamp
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
        console.log('Raw response from /users/chat for initial load:', response.data);

        const filteredUsers: any[] = response.data.filter( // Use any[] initially for flexibility from server
          (user: any) => user.id !== currentUser?.id
        );

        const usersWithProcessedLastMessage = filteredUsers.map((u): ChatUser => {
          // u.lastMessage is expected from the server with content, timestamp, and isRead
          // The server should explicitly set isRead: false for messages unread by the currentUser.
          if (u.lastMessage && typeof u.lastMessage.content === 'string' && u.lastMessage.timestamp && u.lastMessage.isRead === false) {
            // Unread message from server: use its details
            console.log(`User ${u.id} has an unread lastMessage from server:`, u.lastMessage);
            return {
              id: u.id,
              username: u.username,
              // Safely spread other potential user properties from 'u' if your ChatUser interface has them
              ...(u.name && { name: u.name }),
              ...(u.surname && { surname: u.surname }),
              // ... add other known ChatUser fields from 'u' here
              lastMessage: {
                  content: u.lastMessage.content,
                  timestamp: u.lastMessage.timestamp, // Ensure server sends string or Date compatible value
                  isRead: false,
              }
            };
          } else {
            // Message is read, no message, or incomplete/malformed lastMessage data from server.
            // Default to a state that represents "Yeni mesaj yok".
            if (u.lastMessage) {
              console.log(`User ${u.id} has a lastMessage from server, but it's considered read or is incomplete:`, u.lastMessage);
            } else {
              console.log(`User ${u.id} has no lastMessage provided by server or it's null.`);
            }
            return {
              id: u.id,
              username: u.username,
              ...(u.name && { name: u.name }),
              ...(u.surname && { surname: u.surname }),
              // ... add other known ChatUser fields from 'u' here
              lastMessage: { content: '', timestamp: null, isRead: true } 
            };
          }
        });
        console.log('Final users state after fetchUsers processing:', usersWithProcessedLastMessage);
        setUsers(usersWithProcessedLastMessage);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set to empty on error
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [currentUser?.id]);

  // Handle socket events for chat page
  useEffect(() => {
    if (!socket || !isSocketConnected || !currentUser) return;

    const handleDirectMessage = (newMessage: Message) => {
      if (selectedUser && 
          newMessage.senderId === selectedUser.id && 
          newMessage.recipientId === currentUser.id) {
        setMessages(prev => [...prev, newMessage]);
        socket.emit('markMessagesAsRead', {
          senderId: selectedUser.id,
          recipientId: currentUser.id
        });
        updateUserWithLastMessage(newMessage, true, true);
      }
    };

    const handleNewMessageNotificationForUserList = (notification: { message: Message, sender?: ChatUser }) => {
        const { message } = notification;
        const currentUserIdNumber = Number(currentUser.id);

        if (message.senderId !== currentUserIdNumber) { 
            setUsers((prevUsers) => {
                const existingUserIndex = prevUsers.findIndex(u => u.id === message.senderId);
                const newLastMessage = {
                    content: message.content,
                    timestamp: message.createdAt, 
                    isRead: selectedUser?.id === message.senderId, 
                };
                let userToMoveToTop: ChatUser;
                let updatedUsersList = [...prevUsers];
                if (existingUserIndex !== -1) {
                    userToMoveToTop = { ...prevUsers[existingUserIndex], lastMessage: newLastMessage };
                    updatedUsersList.splice(existingUserIndex, 1);
                } else if (notification.sender) {
                    userToMoveToTop = {
                        ...notification.sender,
                        id: message.senderId,
                        username: notification.sender.username || 'Unknown User',
                        lastMessage: newLastMessage,
                    };
                } else {
                    console.warn(`New message from unknown senderId ${message.senderId} and no sender details provided.`);
                    return prevUsers;
                }
                return [userToMoveToTop, ...updatedUsersList];
            });
        } else { 
            setUsers((prevUsers) => {
                const recipientIndex = prevUsers.findIndex(u => u.id === message.recipientId);
                if (recipientIndex === -1) return prevUsers; 
                const updatedRecipient = {
                    ...prevUsers[recipientIndex],
                    lastMessage: {
                        content: message.content,
                        timestamp: message.createdAt,
                        isRead: true, 
                    },
                };
                const newUsersList = [...prevUsers];
                newUsersList.splice(recipientIndex, 1);
                return [updatedRecipient, ...newUsersList];
            });
        }
    };
    socket.on('directMessage', handleDirectMessage);
    socket.on('newMessageNotification', handleNewMessageNotificationForUserList);
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
    socket.emit('joinDirectChat', { recipientId: selectedUser.id }, (response: any) => {
      if (response.success && response.messages) {
        setMessages(response.messages);
        socket.emit('markMessagesAsRead', { senderId: selectedUser.id, recipientId: currentUser.id });
        clearNewMessageIndicator();
        
        // Mark the selected user's last message as read in the users list
        // This should NOT reorder the list, just update isRead status.
        setUsers(prevUsers => prevUsers.map(u =>
            u.id === selectedUser.id 
            ? { ...u, lastMessage: u.lastMessage ? { ...u.lastMessage, isRead: true } : undefined }
            : u
        ));
      } else {
        console.error("Failed to join direct chat or load messages:", response.error);
        setMessages([]);
      }
      setIsLoadingMessages(false);
    });

    return () => {
      if (socket && selectedUser) {
        socket.emit('leaveDirectChat', { recipientId: selectedUser.id });
      }
      setMessages([]);
    };
  }, [selectedUser, socket, isSocketConnected, currentUser, clearNewMessageIndicator]);

  // Update user in list with last message info
  const updateUserWithLastMessage = useCallback((message: Message, isReadContextually: boolean, shouldReorder: boolean = true) => {
    const targetUserId = message.senderId === Number(currentUser?.id) ? message.recipientId : message.senderId;
    setUsers(prevUsers => {
      const userIndex = prevUsers.findIndex(u => u.id === targetUserId);
      if (userIndex === -1 && !message.metadata?.senderDetailsForNewUser) {
          console.warn("updateUserWithLastMessage: User not found and no senderDetailsForNewUser");
          return prevUsers; 
      }
      let updatedUser: ChatUser;
      const newList = [...prevUsers];
      if (userIndex !== -1) {
          updatedUser = {
            ...prevUsers[userIndex],
            lastMessage: {
              content: message.content,
              timestamp: message.createdAt,
              isRead: isReadContextually,
            },
          };
          if (shouldReorder) {
            newList.splice(userIndex, 1);
          }
      } else if (message.metadata?.senderDetailsForNewUser) { 
          updatedUser = {
              ...(message.metadata.senderDetailsForNewUser as Omit<ChatUser, 'lastMessage'>),
              id: targetUserId,
              lastMessage: {
                  content: message.content,
                  timestamp: message.createdAt,
                  isRead: isReadContextually,
              }
          };
      } else {
          return prevUsers;
      }
      if (shouldReorder) {
          return [updatedUser, ...newList];
      } else {
          newList[userIndex] = updatedUser;
          return newList;
      }
    });
  }, [currentUser?.id]);

  // Send message
  const sendMessage = useCallback((content: string, type: 'text' | 'permission_request' | 'system' = 'text', metadata: any = null) => {
    if (!socket || !isSocketConnected || !selectedUser || !currentUser) {
      return false;
    }
    const messageData: Message = {
      senderId: Number(currentUser.id),
      recipientId: Number(selectedUser.id),
      content, createdAt: new Date(), isRead: false, message_type: type, metadata,
    };
    socket.emit('sendDirectMessage', messageData);
    setMessages(prev => [...prev, messageData]);
    updateUserWithLastMessage(messageData, true, true);
    return true;
  }, [socket, isSocketConnected, selectedUser, currentUser, updateUserWithLastMessage]);

  return { users, selectedUser, setSelectedUser, messages, isSocketConnected, isLoadingUsers, isLoadingMessages, sendMessage };
}