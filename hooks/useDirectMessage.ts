'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getToken } from '@/hooks/useAuth';

interface SendMessageOptions {
  content: string;
  recipientId: number;
  message_type?: 'text' | 'permission_request' | 'system';
  metadata?: {
    attemptId?: number;
    projectNumber?: string;
    expenseNumber?: string;
    measurementUnit?: string;
    productDescription?: string;
    oldAmount?: number;
    newAmount?: number;
    status?: 'pending' | 'approved' | 'rejected';
  };
}

export function useDirectMessageSender() {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token) return;

    const socket = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected for direct messaging');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from direct messaging');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const sendMessage = useCallback((options: SendMessageOptions) => {
    if (!socketRef.current || !isConnected) {
      console.warn('Socket not ready or disconnected');
      return false;
    }

    socketRef.current.emit('sendDirectMessage', {
      recipientId: options.recipientId,
      content: options.content,
      message_type: options.message_type || 'text',
      metadata: options.metadata || null,
    });

    return true;
  }, [isConnected]);

  return { sendMessage, isConnected };
}
