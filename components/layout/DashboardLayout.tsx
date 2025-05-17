"use client";

import React, { useState, useEffect } from "react";
import PermissionLink from "@/components/ui/link/PermissionLink";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/context/SocketContext"; // Corrected import path

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  requiredPermission?: number;
  permissions: string[];
  condition?: () => boolean; // Make condition a function to be evaluated on render
  extra_component?: React.ReactNode;
  onClick?: () => void;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const { hasNewMessages, clearNewMessageIndicator } = useSocket();

  // Define menuItems INSIDE the component so it has access to the latest hasNewMessages
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
      path: "/trailers",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="2" y1="18" x2="2" y2="28" />
          <line x1="0.5" y1="28" x2="3.5" y2="28" />
          <line x1="0" y1="18" x2="8" y2="18" />
          <polyline points="8,18 10,22 26,22" />
          <circle cx="20" cy="28" r="2.5" fill="currentColor" stroke="none" />
          <circle cx="26" cy="28" r="2.5" fill="currentColor" stroke="none" />
          <line x1="28" y1="22" x2="31" y2="22" />
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
      title: "Partnerler",
      path: "/partners",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="3" />
          <path d="M6 20c0-2 2-4 4-4s4 2 4 4" />
          <circle cx="22" cy="8" r="4" />
          <path d="M16 20c0-3 3-5 6-5s6 2 6 5" />
        </svg>
      ),
      permissions: ['see:partners']
    },
    {
      title: "Mesajlar",
      path: "/chat",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      condition: () => hasNewMessages, // Use a function that returns the current hasNewMessages
      extra_component: <span className="absolute top-0 right-0 block h-2 w-2 rounded-full ring-2 ring-white bg-green-500"></span>,
      permissions: ['see:chat'],
      onClick: () => { // Added onClick handler for chat link
        console.log("yeni msj: ", hasNewMessages);
        if (hasNewMessages) {
          clearNewMessageIndicator();
          
        }
      }
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // This useEffect is for debugging, you can remove it later
  useEffect(() => {
    console.log("DashboardLayout: hasNewMessages changed to", hasNewMessages);
  }, [hasNewMessages]);


  // The handleChatLinkClick is not needed if onClick is directly on the menu item
  // const handleChatLinkClick = () => {
  //   if (hasNewMessages) {
  //      clearNewMessageIndicator();
  //    }
  // };

  const showNavbar = true;
  const showSidebar = true;

  return (
    <div className="min-h-screen bg-gray-100">
      {showNavbar && (
        <nav className="bg-[#063554] shadow-md fixed w-full top-0 z-20">
          {/* ... (navbar content same as before) ... */}
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

      <div className="flex pt-16">
        {showSidebar && (
          <aside
            className={`${
              isSidebarOpen ? "w-64" : "w-20"
            } bg-[#447494] text-white h-[calc(100vh-64px)] transition-all duration-300 overflow-y-auto fixed z-10 top-16`}
          >
            <div className="py-4">
              <ul className="space-y-1">
                {menuItems.map((item) => {
                  if (!isMounted) {
                    return null;
                  }
                  const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                  const showCondition = item.condition ? item.condition() : false; // Evaluate condition function

                  return (
                    <li key={item.path}>
                      <PermissionLink
                        permissionsRequired={item.permissions}
                        href={item.path}
                        className={`flex items-center py-3 px-4 ${
                          isActive
                            ? "bg-[#063554] text-white"
                            : "text-white hover:bg-[#336383]"
                        } transition-colors rounded-md mx-2`}
                        onClick={item.onClick}
                      >
                        <div className="mr-3 relative">
                          {item.icon}
                          {/* Use the evaluated showCondition here */}
                          {showCondition && item.extra_component}
                        </div>
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