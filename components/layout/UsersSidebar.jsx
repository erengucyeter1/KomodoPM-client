"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function UsersSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeMenuItem, setActiveMenuItem] = useState("");

  // Menu items
  const menuItems = [
    { id: "all-users", label: "Tüm Kullanıcılar", icon: "👥", path: "/dashboard/users" },
    //{ id: "add-user", label: "Yeni Kullanıcı", icon: "➕", path: "/dashboard/users/register" },
    { id: "roles", label: "Kullanıcı Rolleri", icon: "🏷️", path: "/dashboard/users/roles" },
    { id: "permissions", label: "Kullanıcı İzinleri", icon: "🔑", path: "/dashboard/users/permissions" },
  ];

  useEffect(() => {
    // Path'e göre aktif menü öğesini belirle
    if (pathname.includes("/permissions")) {
      setActiveMenuItem("permissions");
    } else if (pathname.includes("/roles")) {
      setActiveMenuItem("roles");
    } else if (pathname.includes("/register")) {
      setActiveMenuItem("add-user");
    } else {
      setActiveMenuItem("all-users");
    }
  }, [pathname]);

  const handleMenuClick = (menuId, path) => {
    setActiveMenuItem(menuId);
    if (path) {
      router.push(path);
    }
  };

  return (
    <div className="w-64 bg-[#063554] text-white min-h-screen shadow-lg">
      <div className="p-5 border-b border-[#447494]">
        <h2 className="text-xl font-bold">Kullanıcı Yönetimi</h2>
      </div>
      <nav className="mt-5">
        <ul>
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                className={`flex items-center w-full px-5 py-3 hover:bg-[#447494] transition-colors ${activeMenuItem === item.id ? "bg-[#447494]" : ""
                  }`}
                onClick={() => handleMenuClick(item.id, item.path)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}