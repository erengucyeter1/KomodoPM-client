"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";

interface Permission {
  id: number;
  name: string;
  description: string;
}

export default function PermissionsPage() {
  const { user, loading } = useAuth(true); // Admin yetkisi gerekli
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openPermissionId, setOpenPermissionId] = useState<number | null>(null);
  const [editingPermissionId, setEditingPermissionId] = useState<number | null>(null);
  const [editedPermission, setEditedPermission] = useState<Permission | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Yeni izin ekleme state'i
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [newPermission, setNewPermission] = useState({
    name: "",
    description: ""
  });

  // API'den verileri çek
  const fetchPermissions = () => {
    setIsLoading(true);
    axiosInstance.get("/authorization/permissions")
      .then((response) => {
        console.log("Permissions API response:", response.data);
        setPermissions(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching permissions:", error);
        setError("İzinleri yüklerken bir hata oluştu. " + error.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (!loading) {
      fetchPermissions();

      // Dropdown dışına tıklanınca kapanması için
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpenPermissionId(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [loading]);

  const togglePermissionDropdown = (permissionId: number) => {
    setOpenPermissionId(openPermissionId === permissionId ? null : permissionId);
  };

  const startEditing = (permission: Permission) => {
    setEditingPermissionId(permission.id);
    setEditedPermission({ ...permission });
    setOpenPermissionId(null);
  };

  const cancelEditing = () => {
    setEditingPermissionId(null);
    setEditedPermission(null);
  };

  const savePermission = () => {
    if (!editedPermission) return;

    // API'ye güncelleme işlemi
    axiosInstance.patch(`/authorization/permissions/${editedPermission.id}`, {
      name: editedPermission.name,
      description: editedPermission.description
    })
      .then(response => {
        console.log("Permission updated successfully:", response.data);

        // API yanıtını kullanarak state'i güncelle
        const updatedPermissions = permissions.map(permission =>
          permission.id === editedPermission.id ? response.data : permission
        );

        setPermissions(updatedPermissions);
        setEditingPermissionId(null);
        setEditedPermission(null);
        setError("");
      })
      .catch(error => {
        console.error("Error updating permission:", error);
        setError(`İzin güncellenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
      });
  };

  const handleAddPermission = () => {
    setIsAddingPermission(true);
    setError("");
  };

  const cancelAddPermission = () => {
    setIsAddingPermission(false);
    setNewPermission({
      name: "",
      description: ""
    });
    setError("");
  };

  const saveNewPermission = () => {
    // Validation
    if (!newPermission.name.trim()) {
      setError("İzin adı boş olamaz");
      return;
    }

    // API'ye kaydetme işlemi
    axiosInstance.post("/authorization/permission/new", {
      name: newPermission.name,
      description: newPermission.description
    })
      .then(response => {
        console.log("Permission added successfully:", response.data);

        // API'den gelen yeni izin verisini ekle
        setPermissions([...permissions, response.data]);
        setIsAddingPermission(false);
        setNewPermission({
          name: "",
          description: ""
        });
        setError("");
      })
      .catch(error => {
        console.error("Error adding permission:", error);
        setError(`İzin eklenirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
      });
  };

  const deletePermission = (permissionId: number) => {
    if (!window.confirm("Bu izni silmek istediğinize emin misiniz?")) {
      return;
    }

    // API'den silme işlemi
    axiosInstance.delete(`/authorization/permissions/${permissionId}`)
      .then(response => {
        console.log("Permission deleted successfully:", response.data);

        // Silinen izni state'den çıkar
        const updatedPermissions = permissions.filter(
          permission => permission.id !== permissionId
        );

        setPermissions(updatedPermissions);
        setOpenPermissionId(null);
        setError("");
      })
      .catch(error => {
        console.error("Error deleting permission:", error);
        setError(`İzin silinirken bir hata oluştu: ${error.response?.data?.message || error.message}`);
      });
  };

  if (loading || isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#063554]"></div>
        <p className="mt-3 text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#063554]">Kullanıcı İzinleri</h1>
        <button
          onClick={handleAddPermission}
          className="bg-[#da8e0a] hover:bg-[#c07c09] text-white py-2 px-4 rounded flex items-center transition-colors"
        >
          <span className="mr-2">+</span> Yeni İzin Ekle
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900 font-bold"
            title="Kapat"
          >
            &times;
          </button>
        </div>
      )}

      {/* Yeni İzin Ekleme Formu */}
      {isAddingPermission && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Yeni İzin Ekle</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İzin Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newPermission.name}
                onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                placeholder="İzin adını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={newPermission.description}
                onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                placeholder="İzin açıklamasını girin"
                rows={2}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelAddPermission}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={saveNewPermission}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#da8e0a] hover:bg-[#c07c09]"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {permissions.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Henüz izin bulunmamaktadır.</p>
          <button
            onClick={handleAddPermission}
            className="inline-block mt-3 text-[#447494] hover:underline"
          >
            İlk izni ekleyin
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">ID</th>
                <th className="py-3 px-4 text-left">İzin Adı</th>
                <th className="py-3 px-4 text-left">Açıklama</th>
                <th className="py-3 px-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={`permission-${permission.id}`} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{permission.id}</td>
                  <td className="py-3 px-4">
                    {editingPermissionId === permission.id && editedPermission ? (
                      <input
                        type="text"
                        value={editedPermission.name}
                        onChange={(e) => setEditedPermission({ ...editedPermission, name: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      permission.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingPermissionId === permission.id && editedPermission ? (
                      <textarea
                        value={editedPermission.description}
                        onChange={(e) => setEditedPermission({ ...editedPermission, description: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                        rows={2}
                      />
                    ) : (
                      permission.description
                    )}
                  </td>
                  <td className="py-3 px-4 text-center relative">
                    {editingPermissionId === permission.id ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={savePermission}
                          className="text-green-500 hover:text-green-700"
                          title="Kaydet"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-500 hover:text-red-700"
                          title="İptal"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="relative" ref={openPermissionId === permission.id ? dropdownRef : null}>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => togglePermissionDropdown(permission.id)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                            />
                          </svg>
                        </button>

                        {openPermissionId === permission.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                key={`edit-${permission.id}`}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => startEditing(permission)}
                              >
                                Düzenle
                              </button>
                              <button
                                key={`delete-${permission.id}`}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                onClick={() => deletePermission(permission.id)}
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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