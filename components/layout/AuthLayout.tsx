import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#063554] p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-[#447494] p-6 text-white">
          <h2 className="text-2xl font-bold text-center">{title}</h2>
          {subtitle && (
            <p className="text-center mt-1 text-sm opacity-80">{subtitle}</p>
          )}
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}