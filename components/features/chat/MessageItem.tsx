import React from 'react';
import PermissionRequestMessage from './PermissionRequestMessage';

interface MessageItemProps {
  message: any;
  currentUserId: number;
}

export default function MessageItem({ message, currentUserId }: MessageItemProps) {
  const isOwnMessage = message.senderId === currentUserId;
  
  // For debugging
  console.log("Message:", message);
  console.log("Message type:", message.message_type);
  
  if (message.message_type === 'permission_request') {
    return (
      <PermissionRequestMessage 
        messageId={message.id}
        data={message.metadata}
        isOwnMessage={isOwnMessage}
      />
    );
  }
  
  // Regular text message
  return (
    <div className={`max-w-[80%] rounded-lg p-3 my-1 ${isOwnMessage ? 'self-end bg-[#063554] text-white' : 'self-start bg-gray-200 text-gray-800'}`}>
      <p>{message.content}</p>
      <div className="text-xs mt-1 opacity-70">
        {new Date(message.createdAt).toLocaleTimeString()}
      </div>
    </div>
  );
}