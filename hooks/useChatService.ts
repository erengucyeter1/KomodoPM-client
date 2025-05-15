'use client';

import { useState, useEffect, useRef, useCallback, use } from 'react';
import { io, Socket } from 'socket.io-client';
import axiosInstance from '@/utils/axios';
import { useAuth } from '@/hooks/useAuth';
import {useNotificationSound} from '@/hooks/useNotification';
import { getToken } from '@/hooks/useAuth';

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

export function useChatService() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const token = getToken();
  const { user: currentUser } = useAuth();
  const playNotificationSound = useNotificationSound();

  // Kullanıcıları yükle
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/users/chat');
        // Kendimizi listeden çıkaralım
        const filteredUsers = response.data.filter(
          (user: any) => user.id !== currentUser?.id
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser?.id]);

  // WebSocket bağlantısını kur
  useEffect(() => {
    if (!token) return;

    const socketInstance = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      auth: { token }
    });
    
    socketRef.current = socketInstance;
    
    socketInstance.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
      setIsLoading(false);
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });
    
    socketInstance.on('directMessage', (newMessage: Message) => {
      // Sadece aktif sohbetten mesaj geliyorsa göster
      if (selectedUser && 
          (newMessage.senderId === selectedUser.id || 
           newMessage.recipientId === selectedUser.id)) {
        setMessages(prev => [...prev, newMessage]);
      }
      
      // Mesaj geldiğinde kullanıcıların son mesaj bilgisini güncelle
      updateUserWithLastMessage(newMessage);
    });

    // Yeni mesaj bildirimi dinleme
    socketInstance.on('newMessageNotification', ({ message }) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user.id === message.senderId) {
            return {
              ...user,
              lastMessage: {
                content: message.content,
                timestamp: message.createdAt,
                isRead: false,
              },
            };
          }
          return user;
        });

        // Yeni mesaj gönderen kullanıcıyı en üste taşı
        playNotificationSound(); // Bildirim sesi çal
        const senderUser = updatedUsers.find((user) => user.id === message.senderId);
        const otherUsers = updatedUsers.filter((user) => user.id !== message.senderId);
        return senderUser ? [senderUser, ...otherUsers] : updatedUsers;



      });
    });
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token, selectedUser]);

  // Kullanıcı seçildiğinde mesajları yükle
  useEffect(() => {
    if (!selectedUser || !socketRef.current || !isConnected) return;
    
    // Özel sohbete katılma isteği gönder
    socketRef.current.emit('joinDirectChat', { 
      recipientId: selectedUser.id 
    }, (response: any) => {
      if (response.success && response.messages) {
        setMessages(response.messages);
      }
    });
  }, [selectedUser, isConnected]);

  // Son mesaja göre kullanıcı listesini güncelle
  const updateUserWithLastMessage = useCallback((message: Message) => {
    setUsers(prevUsers => {
      return prevUsers.map(user => {
        if (user.id === message.senderId || user.id === message.recipientId) {
          return {
            ...user,
            lastMessage: {
              content: message.content,
              timestamp: message.createdAt,
              isRead: message.isRead
            }
          };
        }
        return user;
      });
    });
  }, []);

  // Mesaj gönderme fonksiyonu
  const sendMessage = useCallback((content: string, type: string = 'text', metadata: any = null) => {
    if (!socketRef.current || !isConnected || !selectedUser) {
      return false;
    }
    
    socketRef.current.emit('sendDirectMessage', {
      recipientId: selectedUser.id,
      content,
      message_type: type,
      metadata
    });
    
    return true;
  }, [isConnected, selectedUser]);

  // İzin isteğine yanıt verme fonksiyonu
  const respondToPermissionRequest = useCallback((messageId: string, approved: boolean) => {
    if (!socketRef.current || !isConnected) {
      return false;
    }
    
    console.log("Responding to permission request:", messageId, approved);
    socketRef.current.emit('respondToPermissionRequest', {
      messageId,
      approved
    });
    
    return true;
  }, [isConnected]);

  return {
    users,
    selectedUser,
    setSelectedUser,
    messages,
    isConnected,
    isLoading,
    sendMessage,
    respondToPermissionRequest
  };
}