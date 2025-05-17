'use client';

import UsersList from '@/components/features/chat/UsersList';
import ChatPanel from '@/components/features/chat/ChatPanel';
import EmptyStatePanel from '@/components/features/chat/EmptyStatePanel';
import PermissionsCard from '@/components/ui/card/Card';
import { useChatService } from '@/hooks/useChatService';
import Loading from '@/components/ui/feedback/Loading';
import { withPermissions } from '@/hoc/withPermissions';

export default withPermissions(ChatPage, ['see:chat']);

function ChatPage() {
  const { 
    users, 
    selectedUser, 
    setSelectedUser, 
    messages, 
    isSocketConnected,
    isLoadingUsers,
    isLoadingMessages,
    sendMessage
  } = useChatService();

  if (isLoadingUsers || !isSocketConnected) {
    return <Loading text={isLoadingUsers ? "Kullanıcılar yükleniyor..." : "Mesajlaşma hizmetine bağlanılıyor..."} />;
  }

  return (
    <PermissionsCard className="h-[calc(100vh-12rem)] p-0 overflow-hidden">
      <div className="flex h-full">
        {/* Sol Sütun - Kullanıcı Listesi */}
        <div className="w-1/3 border-r border-gray-200 h-full">
          <UsersList 
            users={users} 
            selectedUser={selectedUser} 
            onSelectUser={setSelectedUser}
            isConnected={isSocketConnected}
          />
        </div>
        
        {/* Sağ Sütun - Sohbet Paneli */}
        <div className="w-2/3 h-full">
          {selectedUser ? (
            <ChatPanel 
              user={selectedUser}
              messages={messages}
              isConnected={isSocketConnected}
              onSendMessage={sendMessage}
              isLoadingMessages={isLoadingMessages}
            />
          ) : (
            <EmptyStatePanel />
          )}
        </div>
      </div>
    </PermissionsCard>
  );
}