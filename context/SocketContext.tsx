'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { useNotificationSound } from '@/hooks/useNotification';
import { getToken } from '@/hooks/useAuth';
import { User } from '@/types/UserInfoInterfaces';



// Define the shape of the message for notifications
interface NotificationMessage {
  id: number;
  senderId: string; // Was number, now string based on example "6"
  recipientId: string; // Was number, now string based on example "5"
  content: string;
  createdAt: string; // Was Date, now string e.g., "2025-05-17T13:13:37.981Z"
  updatedAt: string; // New field
  isRead: boolean;
  message_type: 'text' | 'permission_request' | 'system';
  metadata?: any;
  sender: User; // New nested sender object
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
    newSocket.on('newMessageNotification', (eventData: any) => { // Using 'any' for robust initial debugging
      console.log('--- newMessageNotification START ---');
      console.log('Raw eventData received by socket event:', eventData);

      if (!eventData || typeof eventData.message === 'undefined') {
        console.error('CRITICAL ERROR: eventData itself or eventData.message is missing or not the expected structure. eventData:', eventData);
        console.log('--- newMessageNotification END (halted due to missing data structure) ---');
        return;
      }
      
      console.log('Confirmed: eventData contains a "message" property.');
      const actualMessage = eventData.message;
      console.log('Extracted actualMessage object:', actualMessage);

      if (actualMessage && typeof actualMessage === 'object' && actualMessage !== null) {
        console.log('Keys present in actualMessage:', Object.keys(actualMessage));
      } else {
        console.warn('WARNING: actualMessage is not a valid object or is null. actualMessage:', actualMessage);
        // If actualMessage is not an object, we cannot proceed to read its properties.
        console.log('--- newMessageNotification END (halted due to invalid actualMessage) ---');
        return;
      }

      // Check currentUser status
      if (!currentUser) {
        console.error('CRITICAL ERROR: currentUser object is not available at the time of notification.');
        console.log('--- newMessageNotification END (halted due to missing currentUser) ---');
        return;
      }
      console.log('currentUser object appears to be available:', currentUser);

      if (typeof currentUser.id === 'undefined') {
        console.error('CRITICAL ERROR: currentUser.id is undefined.');
        console.log('--- newMessageNotification END (halted due to missing currentUser.id) ---');
        return;
      }
      console.log('currentUser.id is available:', currentUser.id, '(type:', typeof currentUser.id, ')');

      // Now, attempt to access properties on actualMessage
      const recipientIdFromMessage = actualMessage.recipientId;
      const senderIdFromMessage = actualMessage.senderId;

      console.log('Value of actualMessage.recipientId:', recipientIdFromMessage, '(type:', typeof recipientIdFromMessage, ')');
      console.log('Value of actualMessage.senderId:', senderIdFromMessage, '(type:', typeof senderIdFromMessage, ')');
      
      // If recipientId or senderId are still undefined here, it means they truly don't exist
      // on actualMessage with those exact names (check the 'Keys present in actualMessage' log above).

      const currentUserIdStr = String(currentUser.id);

      if (String(recipientIdFromMessage) === currentUserIdStr && String(senderIdFromMessage) !== currentUserIdStr) {
        console.log('Condition MET: Notification is for current user and not from self.');
        console.log('Value of hasNewMessages before attempting to play sound:', hasNewMessages);
        if (hasNewMessages === false) { // Check current state before playing sound
          console.log('Attempting to play notification sound because hasNewMessages is false.');
          playNotificationSound();
          console.log("Notification sound played! (or at least the function was called)");
        } else {
          console.log('Notification sound NOT played because hasNewMessages was already true.');
        }
        setHasNewMessages(true);
      } else {
        console.log('Condition NOT MET for showing notification. Debug details:');
        console.log(`  - Parsed recipientIdFromMessage: ${recipientIdFromMessage} (type: ${typeof recipientIdFromMessage})`);
        console.log(`  - Parsed senderIdFromMessage: ${senderIdFromMessage} (type: ${typeof senderIdFromMessage})`);
        console.log(`  - Current user ID (for comparison): ${currentUserIdStr}`);
        console.log(`  - Check 1 (recipientId === currentUserIdStr): ${String(recipientIdFromMessage) === currentUserIdStr}`);
        console.log(`  - Check 2 (senderId !== currentUserIdStr): ${String(senderIdFromMessage) !== currentUserIdStr}`);
      }
      console.log('--- newMessageNotification END (normal completion) ---');
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