// client/context/SocketContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSound } from '@/hooks/useNotification';
import { getToken } from '@/hooks/useAuth';

// Define the shape of the message for notifications
// This should match the Message interface in useChatService or be a subset
interface NotificationMessage {
  id?: string;
  senderId: number;
  recipientId: number;
  content: string;
  createdAt: Date; // Ensure this is consistently Date or string
  isRead: boolean;
  message_type: 'text' | 'permission_request' | 'system';
  metadata?: any;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  hasNewMessages: boolean;
  clearNewMessageIndicator: () => void;
  // If needed, add a way to subscribe to specific events globally or provide an emitter
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const { user: currentUser } = useAuth(); // Assuming useAuth provides both user and token
  const token = getToken();
  const playNotificationSound = useNotificationSound();

  useEffect(() => {
    console.log('SocketProvider useEffect called, token:', token, 'currentUser:', currentUser);
    if (!token || !currentUser) {
      if (socketInstance) {
        console.log('Global socket: No token or user, disconnecting.');
        socketInstance.disconnect();
        setSocketInstance(null);
        setIsConnected(false);
      }
      return;
    }

    if (socketInstance?.connected) {
        console.log('Global socket: Already connected.');
        return;
    }

    console.log('Global socket: Attempting to connect...');
    const newSocket = io('http://localhost:3000', { // Your server URL
      withCredentials: true,
      transports: ['websocket'],
      auth: { token },
      // Consider adding reconnection options if needed
      // reconnectionAttempts: 5,
      // reconnectionDelay: 3000,
    });

    newSocket.on('connect', () => {
      console.log('Global socket: Connected successfully.');
      setIsConnected(true);
      setSocketInstance(newSocket);
      // You could emit an event here if your backend needs to know the user is globally connected
      // newSocket.emit('user_online', { userId: currentUser.id });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Global socket: Disconnected.', reason);
      setIsConnected(false);
      // Optionally setSocketInstance(null) if you want to force re-creation on next attempt
    });

    newSocket.on('connect_error', (error) => {
      console.error('Global socket: Connection error.', error);
      setIsConnected(false);
      // Potentially handle different types of errors, e.g., auth error
    });

    // Listen for global new message notifications
    // This event should be emitted by your server to the recipient
    newSocket.on('newMessageNotification', (message: NotificationMessage) => {
      console.log('Global newMessageNotification received:', message);
      // Ensure the notification is for the current user and not from themselves
      if (message.recipientId === currentUser.id && message.senderId !== currentUser.id) {
        // Check if chat page is active with this sender, if so, it might be handled there
        // For simplicity, we always set hasNewMessages true and play sound
        // The chat page itself can clear this flag when it opens the specific chat.
        if(hasNewMessages === false){
          playNotificationSound();
        }
        setHasNewMessages(true);
      }
    });

    // Set the socket instance immediately to allow other hooks/components to use it
    // even before 'connect' event, though they should check 'isConnected'
    setSocketInstance(newSocket);


    return () => {
      console.log('Global socket: Cleaning up connection.');
      newSocket.disconnect();
      setSocketInstance(null);
      setIsConnected(false);
    };
  }, [token, currentUser]); // Rerun when token or user changes

  const clearNewMessageIndicator = useCallback(() => {
    setHasNewMessages(false);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketInstance, isConnected, hasNewMessages, clearNewMessageIndicator }}>
      {children}
    </SocketContext.Provider>
  );
};