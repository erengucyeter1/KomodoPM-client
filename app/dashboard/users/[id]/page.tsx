"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
  authorization_ids: number[];
  createdAt?: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissionIDs?: number[];
}

export default function UserDetailPage() {
  const { user: currentUser, loading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const userId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [userRoles, setUserRoles] = useState<Role[]>([]);

  // Veri normalize eden yardımcı fonksiyon
  const normalizeRole = (role: Role): Role => {
    const permissionIDs = Array.isArray(role.permissionIDs)
      ? role.permissionIDs
      : [];

    return {
      ...role,
      permissionIDs
    };
  };

  // Roller yükleniyor
  useEffect(() => {
    if (!loading) {
      axiosInstance.get("/authorization/roles")
        .then((response) => {
          console.log("Roles fetched:", response.data);
          const normalizedRoles = Array.isArray(response.data)
            ? response.data.map(normalizeRole)
            : [];

          setRoles(normalizedRoles);
        })
        .catch((error) => {
          console.error("Error fetching roles:", error);
          setError("Roller yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        });
    }
  }, [loading]);

  // Kullanıcı detayları yükleniyor
  useEffect(() => {
    if (!loading && userId) {
      const fetchUserDetails = async () => {
        try {
          setIsLoading(true);
          const response = await axiosInstance.get(`/users/${userId}`);
          console.log("User details fetched:", response.data);
          setUser(response.data);
          setEditedUser(response.data);
          setIsLoading(false);
        } catch (err) {
          console.error("Error fetching user details:", err);
          setError("Kullanıcı bilgileri yüklenirken bir hata oluştu.");
          setIsLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [userId, loading]);

  // Kullanıcı rolleri güncellemesi - user ve roles değiştiğinde çalışır
  useEffect(() => {
    if (user && roles.length > 0 && Array.isArray(user.authorization_ids)) {
      console.log("Updating user roles. User IDs:", user.authorization_ids);
      console.log("Available roles:", roles);

      // Önceki userRoles'u temizle
      setUserRoles([]);

      // Kullanıcının rol ID'lerine göre eşleşen rolleri bul
      const matchedRoles = roles.filter(role =>
        user.authorization_ids.some(id => id === Number(role.id))
      );

      console.log("Matched roles:", matchedRoles);

      // Eşleşen tüm rolleri bir kerede güncelle
      setUserRoles(matchedRoles);
    }
  }, [user, roles]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser(user);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedUser) {
      setEditedUser({
        ...editedUser,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSave = async () => {
    if (!editedUser) return;

    try {
      setIsLoading(true);

      // API'ye güncelleme isteği gönder
      // Sayısal değerleri number tipine dönüştür
      const userData = {
        ...editedUser,
        authorization_rank: Number(editedUser.authorization_rank)
      };

      console.log("Sending update request with data:", userData);

      const response = await axiosInstance.patch(`/users/${userId}`, userData);
      setUser(response.data);
      setIsEditing(false);
      setIsLoading(false);
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Kullanıcı güncellenirken bir hata oluştu.");
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      setIsLoading(true);

      // API'ye silme isteği gönder
      await axiosInstance.delete(`/users/${userId}`);
      router.push("/dashboard/users");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Kullanıcı silinirken bir hata oluştu.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#063554]"></div>
        <p className="mt-3 text-gray-500">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
        <div className="flex justify-center">
          <Link
            href="/dashboard/users"
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Kullanıcı Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-10">
        <p className="text-gray-500">Kullanıcı bulunamadı.</p>
        <Link
          href="/dashboard/users"
          className="inline-block mt-3 text-[#447494] hover:underline"
        >
          Kullanıcı Listesine Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#063554]">
          Kullanıcı Detayları: {user.name} {user.surname}
        </h1>
        <div className="flex space-x-2">
          <Link
            href="/dashboard/users"
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
          >
            Listeye Dön
          </Link>
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded transition-colors"
              >
                Kaydet
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors"
              >
                İptal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEdit}
                className="bg-[#447494] hover:bg-[#336383] text-white py-2 px-4 rounded transition-colors"
              >
                Düzenle
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
              >
                Sil
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-[#063554] mb-4">Temel Bilgiler</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kullanıcı Adı
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editedUser?.username || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ad
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser?.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Soyad
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="surname"
                  value={editedUser?.surname || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.surname}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-posta
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={editedUser?.email || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-[#063554] mb-4">Yetki ve Departman</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Yetki Seviyesi
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="authorization_rank"
                  value={editedUser?.authorization_rank || 0}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900">{user.authorization_rank}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Roller
              </label>
              {isEditing ? (
                <div className="space-y-2">
                  {roles.map(role => (
                    <div key={role.id} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`role-${role.id}`}
                        checked={editedUser?.authorization_ids?.includes(Number(role.id))}
                        onChange={(e) => {
                          if (!editedUser) return;

                          // authorization_ids null ise boş bir array yarat
                          const currentIds = editedUser.authorization_ids || [];

                          const newAuthIds = e.target.checked
                            ? [...currentIds, Number(role.id)]
                            : currentIds.filter(id => id !== Number(role.id));

                          setEditedUser({
                            ...editedUser,
                            authorization_ids: newAuthIds
                          });
                        }}
                        className="mr-2 h-4 w-4 text-[#da8e0a] focus:ring-[#da8e0a] border-gray-300 rounded"
                      />
                      <label htmlFor={`role-${role.id}`} className="text-sm text-gray-700">
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {userRoles && userRoles.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {userRoles.map(role => (
                        <li key={role.id} className="text-gray-900">{role.name}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-900">Belirtilmemiş</p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kayıt Tarihi
              </label>
              <p className="text-gray-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleString('tr-TR')
                  : "Belirtilmemiş"
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Kullanıcının projeleri ve aktiviteleri burada gösterilebilir */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-[#063554] mb-4">Kullanıcı Aktiviteleri</h2>
        <p className="text-gray-500">Bu kullanıcının aktiviteleri henüz kaydedilmemiş.</p>
      </div>
    </div>
  );
}