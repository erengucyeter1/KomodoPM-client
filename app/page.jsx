'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';




export default function WelcomePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleNavigation = (path) => {
        setIsLoading(true);
        router.push(path);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Komodo Project Management</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Manage your projects efficiently with Komodo
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={() => handleNavigation('/auth/login')}
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Login to your account
                    </button>
                    
                    
                </div>

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>© {new Date().getFullYear()} Komodo Project Management</p>
                </div>
            </div>
        </div>
    );
}