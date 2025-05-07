import React from 'react';

interface AlertMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export const AlertMessage: React.FC<AlertMessageProps> = ({ type, message }) => {
  const colors = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  };

  return (
    <div className={`${colors[type]} px-4 py-3 rounded mb-4 border`}>
      {message}
    </div>
  );
};