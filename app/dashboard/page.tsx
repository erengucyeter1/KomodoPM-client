"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check if user is authenticated
        const token = localStorage.getItem("token");
        const userInfo = localStorage.getItem("user");

        if (!token) {
            router.push("/auth/login");
            return;
        }

        if (userInfo) {
            try {
                const userData = JSON.parse(userInfo);
                setUserName(userData.name || userData.username || "User");
            } catch (e) {
                console.error("Error parsing user data", e);
            }
        }

        setIsLoading(false);

        // Dışarı tıklandığında menüyü kapat
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/auth/login");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#063554]">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-[#447494] mb-4">Dashboard</h2>
                    <p className="text-gray-600">
                        Welcome to your dashboard. Content will be added soon.
                    </p>
                </div>
            </main>
        </div>
    );
}