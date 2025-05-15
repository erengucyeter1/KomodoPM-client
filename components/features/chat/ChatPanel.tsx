import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import MessageItem from './MessageItem';
import PermissionButton from "@/components/ui/button/Button";


interface ChatPanelProps {
  user: any;
  messages: any[];
  isConnected: boolean;
  onSendMessage: (content: string, type: string, metadata?: any) => boolean;
}

export default function ChatPanel({ 
  user, 
  messages, 
  isConnected,
  onSendMessage 
}: ChatPanelProps) {
  const { user: currentUser } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  


  // Mesajlar güncellendiğinde otomatik olarak en alta kaydır
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage, 'text');
      setNewMessage('');
    }
  };

  

  

  const handleApprove = (messageId: string) => {
    // Onaylama işlemi
  };

  const handleReject = (messageId: string) => {
    // Reddetme işlemi
  };

  return (
    <div className="flex flex-col h-full">
      {/* Sohbet Başlığı */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#063554] text-white flex items-center justify-center mr-3">
            {user.name?.charAt(0)}{user.surname?.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-[#063554]">{`${user.name} ${user.surname}`}</h2>
            <p className="text-xs text-gray-500">
              @{user.username}
            </p>
          </div>
        </div>
      </div>
      
      {/* Mesaj Listesi */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            Henüz mesaj yok. Bir mesaj göndererek sohbeti başlatabilirsiniz.
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem
              key={message.id || index}
              message={message}
              currentUserId={currentUser!.id}  // hoc sayesinde null olamaz
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Mesaj Gönderme Formu */}
      <div className="p-4 border-t border-gray-200 flex items-center relative">

        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isConnected ? "Mesajınızı yazın..." : "Bağlantı bekleniyor..."}
          className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected}
        />
        <PermissionButton
          onClick={handleSendMessage}
          disabled={!isConnected || !newMessage.trim()}
          className="ml-2 px-4 py-2 bg-[#063554] hover:bg-[#052a43] text-white rounded-md disabled:bg-gray-400"
          permissionsRequired={['send:message']}
        >
          Gönder
        </PermissionButton>
      </div>
    </div>
  );
}