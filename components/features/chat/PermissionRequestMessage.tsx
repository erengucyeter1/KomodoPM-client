import React from 'react';

interface PermissionRequestMessageProps {
  data: {
    projectNumber: string;
    expenseNumber: string;
    oldAmount: number;
    newAmount: number;
    status: 'pending' | 'approved' | 'rejected';
  };
  isOwnMessage: boolean;
  onApprove: () => void;
  onReject: () => void;
}

export default function PermissionRequestMessage({ 
  data, 
  isOwnMessage, 
  onApprove, 
  onReject 
}: PermissionRequestMessageProps) {
  if (!data) {
    return <p>Hatalı değişiklik talebi</p>;
  }

  const { projectNumber, expenseNumber, oldAmount, newAmount, status } = data;
  
  return (
    <div className={`max-w-[80%] my-1 ${isOwnMessage ? 'self-end ml-auto' : 'self-start'}`}>
      <div className="border-2 border-gray-200 rounded-md p-3 bg-white text-gray-800">
        <div className="font-bold mb-2">Değişiklik Talebi</div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <div className="text-xs text-gray-500">Proje No</div>
            <div>{projectNumber}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Gider No</div>
            <div>{expenseNumber}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Eski Miktar</div>
            <div className="line-through">{oldAmount} ₺</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Yeni Miktar</div>
            <div className="font-semibold">{newAmount} ₺</div>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className={`px-2 py-1 rounded text-sm ${
            status === 'approved' ? 'bg-green-100 text-green-800' : 
            status === 'rejected' ? 'bg-red-100 text-red-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {status === 'approved' ? 'Onaylandı' : 
             status === 'rejected' ? 'Reddedildi' : 'Beklemede'}
          </div>
          
          {!isOwnMessage && status === 'pending' && (
            <div className="flex space-x-2">
              <button 
                onClick={onReject}
                className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
              >
                Reddet
              </button>
              <button 
                onClick={onApprove}
                className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
              >
                Onayla
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="text-xs mt-1 ml-2 text-gray-500">
        {/* Timestamp can be added here if needed */}
      </div>
    </div>
  );
}