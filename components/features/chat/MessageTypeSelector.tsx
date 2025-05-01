import { useState } from 'react';

export default function MessageTypeSelector({ onSelect, onClose }) {
  return (
    <div className="absolute bottom-16 left-4 bg-white shadow-lg rounded-md p-2 z-10 border border-gray-200">
      <div className="flex flex-col">
        <button 
          className="text-left px-3 py-2 hover:bg-gray-100 rounded"
          onClick={() => onSelect('permission_request')}
        >
          Değişiklik Talebi
        </button>
        {/* Add more message types here if needed */}
      </div>
    </div>
  );
}