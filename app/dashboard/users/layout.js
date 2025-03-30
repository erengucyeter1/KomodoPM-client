"use client";

import { usePathname } from "next/navigation";
import UsersSidebar from "@/components/layout/UsersSidebar";

export default function UsersLayout({ children }) {
  const pathname = usePathname();
  
  // Register sayfasında sidebar gösterme
  if (pathname.includes("/register")) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex">
      <UsersSidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}