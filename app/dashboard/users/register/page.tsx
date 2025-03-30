"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";

interface FormData {
    username: string;
    password: string;
    name: string;
    surname: string;
    email: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        username: "",
        password: "",
        name: "",
        surname: "",
        email: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Yetkilendirme kontrolü
    useEffect(() => {
        // Local storage'dan kullanıcı bilgilerini al
        const userInfoString = localStorage.getItem("user");

        if (!userInfoString) {
            // Kullanıcı girişi yapılmamışsa login sayfasına yönlendir
            router.push("/auth/login");
            return;
        }

        try {
            const userInfo = JSON.parse(userInfoString);

            // Admin yetkisi (0) yoksa dashboard'a yönlendir
            if (!userInfo.authorization_ids || !userInfo.authorization_ids.includes(0)) {
                router.push("/dashboard");
                return;
            }
        } catch (error) {
            console.error("Error parsing user info:", error);
            router.push("/auth/login");
        }
    }, [router]);

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
            const registerPayload = {
                username: formData.username,
                password: formData.password,
                name: formData.name,
                surname: formData.surname,
                email: formData.email,
                // Varsayılan değerler sunucu tarafında atanacak
                authorization_ids: [1], // Temel kullanıcı yetkisi
                authorization_rank: 1,  // En düşük rank
            };

            console.log("Sending registration data:", registerPayload);

            // Send the formatted data
            const response = await axiosInstance.post("/auth/register", registerPayload);

            // Handle response
            if (response.status === 201) {
                setLoading(false);
                router.push("/dashboard");
            } else {
                throw new Error("User registration failed");
            }
        } catch (err) {
            setLoading(false);
            setError("Registration failed. Please try again.");
            console.error("Registration error:", err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#063554] p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-[#447494] p-6 text-white">
                    <h2 className="text-2xl font-bold text-center">Yeni Kullanıcı Tanımla</h2>
                    <p className="text-center mt-1 text-sm opacity-80">
                        Komodo Proje yönetim sistemine yeni kullanıcı ekleyin
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Kullanıcı Adı
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
                            Şifre
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

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Ad
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                                Soyad
                            </label>
                            <input
                                id="surname"
                                name="surname"
                                type="text"
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                                value={formData.surname}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            E-posta
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    {error && (
                        <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#447494]"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-[#da8e0a] hover:bg-[#c07c09] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#da8e0a] transition-colors disabled:bg-opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "İşleniyor..." : "Kullanıcı Ekle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}