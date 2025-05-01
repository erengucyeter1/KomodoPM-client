import React from 'react';

export default function EmptyStatePanel() {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8">
      <div className="mb-4 p-4 rounded-full bg-blue-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-12 w-12 text-[#063554]" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={1.5} 
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-[#063554] mb-2">Mesajlarınız</h2>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        Sol taraftan bir kullanıcı seçerek mesajlaşmaya başlayabilirsiniz. 
        Mesajlarınız güvenli bir şekilde saklanır ve gerçek zamanlı olarak iletilir.
      </p>
      <div className="text-sm text-gray-400">
        Komodo Project Management - Real-time Messaging
      </div>
    </div>
  );
}