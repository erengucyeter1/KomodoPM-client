import React from 'react';

export function Label({ htmlFor, children, className }) {
  return (
    <label htmlFor={htmlFor} className={`block text-sm font-medium ${className}`}>
      {children}
    </label>
  );
}