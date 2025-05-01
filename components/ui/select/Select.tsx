import React from 'react';

export function Select({ value, onValueChange, children }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="border rounded px-3 py-2 w-full"
    >
      {children}
    </select>
  );
}
