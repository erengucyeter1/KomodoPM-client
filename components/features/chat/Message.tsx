import React from 'react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MessageProps {
  message: {
    content: string;
    createdAt: Date;
    isRead: boolean;
  };
  isOwnMessage: boolean;
}

export default function Message({ message, isOwnMessage }: MessageProps) {
  const messageTime = typeof message.createdAt === 'string' 
    ? new Date(message.createdAt) 
    : message.createdAt;

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-[#063554] text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <div className={`text-xs mt-1 flex items-center ${
          isOwnMessage ? 'text-blue-200 justify-end' : 'text-gray-500'
        }`}>
          {format(messageTime, 'HH:mm', { locale: tr })}
          
          {isOwnMessage && (
            <span className="ml-1">
              {message.isRead ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}