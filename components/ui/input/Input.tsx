import React from 'react';

export function Input({ id, value, onChange, placeholder, className, type = 'text' }) {
  return (
    <input
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border rounded px-3 py-2 ${className}`}
      type={type}
    />
  );
}