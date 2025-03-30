"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/utils/axios"

interface LoginData {
    username: string;
    password: string;
}

export default function LoginPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<LoginData>({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // Exactly match the required format
            const loginPayload = {
                username: formData.username,
                password: formData.password
            };

            // Send the formatted data
            const response = await axiosInstance.post("/auth/login", loginPayload);

            // Store the token from response
            if (response.data && response.data.accessToken) {
                localStorage.setItem('token', response.data.accessToken);
                localStorage.setItem('user', JSON.stringify(response.data.userInfo));
                setLoading(false);
                router.push("/dashboard");
            } else {
                throw new Error("No token received");
            }

        } catch (err) {
            setLoading(false);
            setError("Invalid username or password. Please try again.");
            console.error("Login error:", err);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#063554] p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#447494] p-6 text-white">
                    <h2 className="text-2xl font-bold text-center">Welcome Back</h2>
                    <p className="text-center mt-1 text-sm opacity-80">
                        Log in to Komodo Project Management
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 text-[#447494] focus:ring-[#da8e0a] border-gray-300 rounded"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" className="font-medium text-[#447494] hover:text-[#063554]">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#da8e0a] hover:bg-[#c07c09] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#da8e0a] transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    <div className="text-sm text-center mt-4">
                        <p className="text-gray-600">
                            Don't have an account?{" "}
                            <Link href="/auth/register" className="text-[#447494] hover:text-[#063554] font-medium">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}