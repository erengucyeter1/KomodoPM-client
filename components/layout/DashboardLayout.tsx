"use client";

import React, { useState, useEffect } from "react";
import PermissionLink from "@/components/ui/link/PermissionLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: number; // Optional permission required to see this menu item
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  // Determine if the sidebar should be shown at all
  // Only show on exactly /dashboard path
  const showSidebar = pathname === "/dashboard";

  // Menu items with icons
  const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      permissions: []
    },
    {
      title: "Kullanıcılar",
      path: "/dashboard/users",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      permissions: ['see:users']
    },
    {
      title: "Projeler",
      path: "/dashboard/projects",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      permissions: ['see:projects']

    },
    
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navbar */}
      <nav className="bg-[#063554] shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {showSidebar && (
                  <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-white focus:outline-none mr-4"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <PermissionLink href="/dashboard" className="text-white text-xl font-bold">
                  Komodo PM
                </PermissionLink>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <div className="text-white mr-4">
                      <div className="text-sm font-medium">
                        {user?.name} {user?.surname}
                      </div>
                      <div className="text-xs opacity-75">{user?.email}</div>
                    </div>
                    <button
                      onClick={logout}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                    >
                      Çıkış
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar - only show if on main dashboard page */}
        {showSidebar && (
          <aside
            className={`${
              isSidebarOpen ? "w-64" : "w-20"
            } bg-[#447494] text-white h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto fixed z-10`}
          >
            <div className="py-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  // Check if user has required permission to see this menu item
                  if (item.requiredPermission && user?.authorization_rank < item.requiredPermission) {
                    return null; // Don't render this menu item
                  }
                  
                  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  
                  return (
                    <li key={item.path}>
                      <PermissionLink
                        permissionsRequired={item.permissions}
                        userPermissions={user?.permissions}
                        href={item.path}
                        className={`flex items-center py-3 px-4 ${
                          isActive
                            ? "bg-[#063554] text-white"
                            : "text-white hover:bg-[#336383]"
                        } transition-colors rounded-md mx-2`}
                      >
                        <div className="mr-3">{item.icon}</div>
                        <span className={isSidebarOpen ? "block" : "hidden"}>
                          {item.title}
                        </span>
                      </PermissionLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        )}

        {/* Main content - adjust margin based on sidebar visibility */}
        <main
          className={`flex-1 ${
            showSidebar && isSidebarOpen ? "ml-64" : showSidebar ? "ml-20" : "ml-0"
          } transition-all duration-300 p-6`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}