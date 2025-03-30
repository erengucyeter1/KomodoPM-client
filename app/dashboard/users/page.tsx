"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";

// User tipi
interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  authorization_rank: number;
}

export default function UsersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Sayfa yüklendiğinde kullanıcıları getir
    if (!loading) {
      const fetchUsers = async () => {
        try {
          setIsLoading(true);
          
          // API entegrasyonu - gerçek verileri çekme
          const response = await axiosInstance.get("/users");
          setUsers(response.data);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching users:", err);
          setError("Kullanıcılar yüklenirken bir hata oluştu.");
          setIsLoading(false);
          
          // API bağlantısı yoksa örnek veri göster (geliştirme sırasında)
          if (process.env.NODE_ENV === 'development') {
            const mockUsers = [
              { id: 1, username: "admin", name: "Admin", surname: "User", email: "admin@example.com", authorization_rank: 10 },
              { id: 2, username: "johndoe", name: "John", surname: "Doe", email: "john@example.com", authorization_rank: 5 },
              { id: 3, username: "janedoe", name: "Jane", surname: "Doe", email: "jane@example.com", authorization_rank: 3 },
            ];
            
            setUsers(mockUsers);
            setIsLoading(false);
          }
        }
      };

      fetchUsers();
    }
  }, [loading]);

  const viewUserDetails = (userId: number) => {
    router.push(`/dashboard/users/${userId}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#063554]">Tüm Kullanıcılar</h1>
        <Link 
          href="/dashboard/users/register" 
          className="bg-[#da8e0a] hover:bg-[#c07c09] text-white py-2 px-4 rounded flex items-center transition-colors"
        >
          <span className="mr-2">+</span> Yeni Kullanıcı Ekle
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#063554]"></div>
          <p className="mt-3 text-gray-500">Kullanıcılar yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Henüz kullanıcı bulunmamaktadır.</p>
          <Link 
            href="/dashboard/users/register" 
            className="inline-block mt-3 text-[#447494] hover:underline"
          >
            İlk kullanıcıyı ekleyin
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Kullanıcı Adı</th>
                <th className="py-3 px-4 text-left">Ad Soyad</th>
                <th className="py-3 px-4 text-left">E-posta</th>
                <th className="py-3 px-4 text-left">Yetki Seviyesi</th>
                <th className="py-3 px-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{user.username}</td>
                  <td className="py-3 px-4">{user.name} {user.surname}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.authorization_rank}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => viewUserDetails(user.id)}
                      className="bg-[#447494] hover:bg-[#336383] text-white px-3 py-1 rounded-md text-sm transition-colors"
                      title="Kullanıcı Detayları"
                    >
                      Detaylar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}