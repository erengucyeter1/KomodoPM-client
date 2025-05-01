import React, { useState } from 'react';

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={className}>{children}</div>
  );
}

export function TabsList({ children, className }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, onClick, className }) {
  return (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }) {
  return <div className={className}>{children}</div>;
}