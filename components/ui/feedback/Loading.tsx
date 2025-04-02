import React from "react";

interface LoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Loading({ 
  text = "Yükleniyor...", 
  size = "md", 
  className = "" 
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className={`text-center py-10 ${className}`}>
      <div className={`inline-block animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-[#063554]`}></div>
      {text && <p className="mt-3 text-gray-500">{text}</p>}
    </div>
  );
}