"use client";

import React, { useState, useEffect } from "react";
import PermissionLink from "@/components/ui/link/PermissionLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: number;
  permissions: string[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (pathname.startsWith("/auth")) {
    return <>{children}</>;
  }
  const showNavbar = true;
  const showSidebar = true;

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
      path: "/users",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      permissions: ['see:users']
    },
    {
      title: "Projeler",
      path: "/projects",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      permissions: ['see:projects']
    },
    {
      title: "Römorklar",
      path: "/projects/trailers",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17h2m10 0h2M3 17h1m16 0h1M6 10V5h12v10M6 5H4a1 1 0 00-1 1v11h1m16 0h1V6a1 1 0 00-1-1h-2M4 15h16M6 15v2m12-2v2" />
        </svg>
            ),
      permissions: ['see:trailers']
    },
    {
      title: "Faturalar",
      path: "/invoice/new",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
            ),
      permissions: ['see:invoices']
    },
    {
      title: "Mesajlar",
      path: "/chat",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      permissions: ['see:chat']
    },
    {
      title: "Stok",
      path: "/stock",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      permissions: ['see:stock']
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Üst Navbar - Sabitlendi */}
      {showNavbar && (
        <nav className="bg-[#063554] shadow-md fixed w-full top-0 z-20">
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
      )}

      {/* Sidebar ve Ana İçerik Kapsayıcısı - Navbar için üstten padding eklendi */}
      <div className="flex pt-16">
        {/* Sidebar - Sabitlendi ve navbar'ın altına konumlandırıldı */}
        {showSidebar && (
          <aside
            className={`${
              isSidebarOpen ? "w-64" : "w-20"
            } bg-[#447494] text-white h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto fixed z-10 top-16`}
          >
            <div className="py-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  // Check if user has required permission to see this menu item
                  if (item.requiredPermission && user?.authorization_rank < item.requiredPermission) {
                    return null; // Don't render this menu item
                  }

                  if (!isMounted) {
                    return null; // Sunucuda veya ilk client render'da (hydration öncesi)
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

        {/* Main content - Sol margin ayarları sidebar genişliğine göre devam ediyor */}
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