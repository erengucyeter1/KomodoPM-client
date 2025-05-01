import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UsersListProps {
  users: any[];
  selectedUser: any | null;
  onSelectUser: (user: any) => void;
  isConnected: boolean;
}

export default function UsersList({ 
  users, 
  selectedUser, 
  onSelectUser,
  isConnected
}: UsersListProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Başlık */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[#063554]">Mesajlar</h2>
        <div className="flex items-center">
          <span 
            className={`inline-block w-2 h-2 rounded-full mr-2 ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-500">
            {isConnected ? 'Bağlı' : 'Bağlantı kesik'}
          </span>
        </div>
      </div>
      
      {/* Kullanıcı Listesi */}
      <div className="overflow-y-auto flex-1">
        {users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            Mesajlaşabileceğiniz kullanıcı bulunmamaktadır.
          </div>
        ) : (
          <ul>
            {users.map(user => (
              <li key={user.id}>
                <button
                  onClick={() => onSelectUser(user)}
                  className={`w-full text-left p-4 flex items-start hover:bg-gray-50 transition-colors ${
                    selectedUser?.id === user.id ? 'bg-blue-50' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#063554] text-white flex items-center justify-center mr-3 flex-shrink-0">
                    {user.name?.charAt(0)}{user.surname?.charAt(0)}
                  </div>
                  
                  {/* Kullanıcı Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="font-medium text-gray-900 truncate">{`${user.name} ${user.surname}`}</h3>
                      {user.lastMessage && (
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(user.lastMessage.timestamp), {
                            addSuffix: true,
                            locale: tr
                          })}
                        </span>
                      )}
                    </div>
                    
                    {user.lastMessage ? (
                      <p className={`text-sm truncate ${
                        !user.lastMessage.isRead ? 'font-semibold text-[#063554]' : 'text-gray-500'
                      }`}>
                        {user.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        Henüz mesaj yok
                      </p>
                    )}
                  </div>
                  
                  {/* Okunmamış mesaj belirteci */}
                  {user.lastMessage && !user.lastMessage.isRead && (
                    <div className="w-3 h-3 rounded-full bg-[#da8e0a] self-center ml-2"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}