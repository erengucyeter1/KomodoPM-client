'use client';

import { io, Socket } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import { getToken } from '@/hooks/useAuth'

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const token = getToken(); // Token alınıyor
  useEffect(() => {
    // Önceki socket bağlantısını temizle
    if (socketRef.current) {
      console.log('Cleaning up existing socket');
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  
    console.log('Initializing new socket connection');



    const socketInstance = io('http://localhost:3000', {
      withCredentials: true,
      transports: ['websocket'],
      auth: {
        token,
      }
    });
    
    socketRef.current = socketInstance;
  
    // Bağlantı olaylarını dinle
    socketInstance.on('connect', () => {
      console.log('Connected to server with ID:', socketInstance.id);
      setConnected(true);
    });
  
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server');
      setConnected(false);
    });
  
    // ÖNEMLİ: Tek bir dinleyici eklemek için önce mevcut dinleyiciyi kaldır
    socketInstance.off('MYmessage');
    
    // Sonra yeni dinleyici ekle
    socketInstance.on('MYmessage', (msg) => {
      console.log('MYmessage received:', msg);
      setMessages(prev => [...prev, msg]);
    });
  
    // Temizleme fonksiyonu
    return () => {
      console.log('Cleaning up socket connection on unmount');
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('MYmessage');
        socketRef.current.disconnect();
      }
    };
  }, []); // Boş dependency array - yalnızca bir kez çalışır dependency array - yalnızca bir kez çalışır

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!socketRef.current || !connected) {
      console.warn('Cannot send message: Socket not connected');
      return;
    }
    
    const input = document.getElementById('input') as HTMLInputElement;
    const message = input.value.trim();
    
    if (!message) return;
    
    console.log('Sending message:', message);
    socketRef.current.emit('MYmessage', message);
    input.value = '';
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Bağlantı durumu göstergesi */}
      <div className="mb-4">
        <span className={`inline-block w-3 h-3 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
        <span>{connected ? 'Connected' : 'Disconnected'}</span>
      </div>
      
      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet</p>
        ) : (
          <ul>
            {messages.map((msg, index) => (
              <li key={index} className="mb-2 p-2 bg-gray-100 rounded">{msg}</li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Mesaj gönderme formu */}
      <form id="form" onSubmit={handleSubmit} className="flex space-x-2">
        <input 
          id="input" 
          autoComplete="off" 
          placeholder="Enter new message..." 
          className="flex-1 border rounded p-2"
          disabled={!connected}
        />
        <button 
          type="submit" 
          disabled={!connected}
          className="bg-blue-500 text-white p-2 rounded disabled:bg-gray-400"
        >
          Send
        </button>
      </form>
    </div>
  );
}