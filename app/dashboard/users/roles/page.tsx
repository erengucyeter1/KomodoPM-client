"use client";

import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";

// Tip tanımlamaları
interface Role {
  id: string;
  name: string;
  description: string;
  permissionIDs?: number[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface EditedRole extends Role {
  selectedPermissions: number[];
}

export default function RolesPage() {
  const { user, loading } = useAuth(true); // Admin yetkisi gerekli
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [openRoleId, setOpenRoleId] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<EditedRole | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Yeni rol ekleme state'i
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<{
    name: string;
    description: string;
    selectedPermissions: number[];
  }>({
    name: "",
    description: "",
    selectedPermissions: []
  });

  // Rol verilerini normalize eden yardımcı fonksiyon
  const normalizeRole = (role: Role): Role => {
    // permissionIDs veya permissionIDs'den birini kullan, hiçbiri yoksa boş dizi
    const permissionIDs = Array.isArray(role.permissionIDs)
      ? role.permissionIDs
      : Array.isArray(role.permissionIDs)
        ? role.permissionIDs
        : [];

    return {
      ...role,
      permissionIDs
    };
  };

  useEffect(() => {
    if (!loading) {
      // API'den rolleri çek
      axiosInstance.get("/authorization/roles")
        .then((response) => {

          // API yanıtını normalize et
          const normalizedRoles = Array.isArray(response.data)
            ? response.data.map(normalizeRole)
            : [];

          setRoles(normalizedRoles);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching roles:", error);
          setError("Roller yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
          setIsLoading(false);
        });

      // API'den izinleri çek
      axiosInstance.get("/authorization/permissions")
        .then((response) => {
          console.log("Permissions API response:", response.data);
          setPermissions(response.data);
        })
        .catch((error) => {
          console.error("Error fetching permissions:", error);
          setError("İzinler yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
        });

      // Dropdown dışına tıklanınca kapanması için
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setOpenRoleId(null);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [loading]);

  const toggleRoleDropdown = (roleId: string) => {
    setOpenRoleId(openRoleId === roleId ? null : roleId);
  };

  const startEditing = (role: Role) => {
    // Role'ü normalize ederek permissionIDs'in dizi olduğundan emin ol
    const normalizedRole = normalizeRole(role);

    setEditingRoleId(normalizedRole.id);
    setEditedRole({
      ...normalizedRole,
      selectedPermissions: [...(normalizedRole.permissionIDs || [])]
    });
    setOpenRoleId(null);
  };

  const cancelEditing = () => {
    setEditingRoleId(null);
    setEditedRole(null);
  };

  const handlePermissionChange = (permissionId: number, isNewRole = false) => {
    if (isNewRole) {
      setNewRole(prev => {
        const currentPermissions = [...prev.selectedPermissions];
        if (currentPermissions.includes(permissionId)) {
          return {
            ...prev,
            selectedPermissions: currentPermissions.filter(id => id !== permissionId)
          };
        } else {
          return {
            ...prev,
            selectedPermissions: [...currentPermissions, permissionId]
          };
        }
      });
    } else {
      setEditedRole(prev => {
        if (!prev) return prev;
        const currentPermissions = [...prev.selectedPermissions];
        if (currentPermissions.includes(permissionId)) {
          return {
            ...prev,
            selectedPermissions: currentPermissions.filter(id => id !== permissionId)
          };
        } else {
          return {
            ...prev,
            selectedPermissions: [...currentPermissions, permissionId]
          };
        }
      });
    }
  };

  const saveRole = () => {
    if (!editedRole) return;

    // API'ye kaydetme işlemi - Backend'in beklediği her iki format da gönderiliyor
    axiosInstance.put(`/authorization/roles/${editedRole.id}`, {
      name: editedRole.name,
      description: editedRole.description,
      permissionIDs: editedRole.selectedPermissions, // Küçük harf "i"
    })
      .then(response => {
        console.log("Role updated successfully:", response.data);

        // UI'yi güncelle
        setRoles(prevRoles => prevRoles.map(role => {
          if (role.id === editedRole.id) {
            return {
              ...role,
              name: editedRole.name,
              description: editedRole.description,
              permissionIDs: editedRole.selectedPermissions
            };
          }
          return role;
        }));

        setEditingRoleId(null);
        setEditedRole(null);
        setError("");
      })
      .catch(error => {
        console.error("Error updating role:", error);
        setError("Rol güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
      });
  };

  const handleAddRole = () => {
    setIsAddingRole(true);
    setError("");
  };

  const cancelAddRole = () => {
    setIsAddingRole(false);
    setNewRole({
      name: "",
      description: "",
      selectedPermissions: []
    });
    setError("");
  };

  const saveNewRole = () => {
    // Validation
    if (!newRole.name.trim()) {
      setError("Rol adı boş olamaz");
      return;
    }

    // API'ye kaydetme işlemi - Her iki formatta da parametreleri gönder
    const roleToAdd = {
      name: newRole.name,
      description: newRole.description,
      permissionIDs: newRole.selectedPermissions,
    };

    axiosInstance.post("/authorization/roles", roleToAdd)
      .then(response => {
        console.log("Role added successfully:", response.data);

        // API'den gelen yanıtı normalize et
        const normalizedRole = normalizeRole(response.data);

        // API'den gelen yeni rol verisini ekle
        setRoles(prevRoles => [...prevRoles, normalizedRole]);
        setIsAddingRole(false);
        setNewRole({
          name: "",
          description: "",
          selectedPermissions: []
        });
        setError("");
      })
      .catch(error => {
        console.error("Error adding role:", error);
        setError("Rol eklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
      });
  };

  const deleteRole = (roleId: string) => {
    if (!window.confirm("Bu rolü silmek istediğinize emin misiniz?")) {
      return;
    }

    axiosInstance.delete(`/authorization/roles/${roleId}`)
      .then(response => {
        console.log("Role deleted successfully:", response.data);

        // UI'yi güncelle
        setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
        setOpenRoleId(null);
        setError("");
      })
      .catch(error => {
        console.error("Error deleting role:", error);
        setError("Rol silinirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
      });
  };

  // İzinleri göstermek için yardımcı fonksiyon
  const getPermissionIds = (role: Role): number[] => {
    if (Array.isArray(role.permissionIDs) && role.permissionIDs.length > 0) {
      return role.permissionIDs;
    }
    if (Array.isArray(role.permissionIDs) && role.permissionIDs.length > 0) {
      return role.permissionIDs;
    }
    return [];
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
        <h1 className="text-2xl font-bold text-[#063554]">Kullanıcı Rolleri</h1>
        <button
          onClick={handleAddRole}
          className="bg-[#da8e0a] hover:bg-[#c07c09] text-white py-2 px-4 rounded flex items-center transition-colors"
        >
          <span className="mr-2">+</span> Yeni Rol Ekle
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

      {/* Yeni Rol Ekleme Formu */}
      {isAddingRole && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Yeni Rol Ekle</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rol Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newRole.name}
                onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                placeholder="Rol adını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Açıklama
              </label>
              <textarea
                value={newRole.description}
                onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                placeholder="Rol açıklamasını girin"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İzinler
              </label>
              <div className="border border-gray-300 rounded-md p-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {newRole.selectedPermissions.length > 0 ? (
                    permissions
                      .filter(p => newRole.selectedPermissions.includes(p.id))
                      .map(p => (
                        <span
                          key={`new-role-perm-${p.id}`}
                          className="bg-[#447494] text-white px-2 py-1 rounded-full text-xs flex items-center"
                        >
                          {p.name}
                          <button
                            type="button"
                            onClick={() => handlePermissionChange(p.id, true)}
                            className="ml-1 text-white hover:text-gray-200"
                          >
                            ×
                          </button>
                        </span>
                      ))
                  ) : (
                    <span className="text-gray-500 text-xs">İzin seçin...</span>
                  )}
                </div>

                <div className="max-h-32 overflow-y-auto border-t border-gray-200 pt-2">
                  {permissions
                    .filter(p => !newRole.selectedPermissions.includes(p.id))
                    .map(p => (
                      <div
                        key={`new-role-perm-option-${p.id}`}
                        onClick={() => handlePermissionChange(p.id, true)}
                        className="p-1 hover:bg-gray-100 cursor-pointer text-sm rounded-md"
                      >
                        {p.name}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={cancelAddRole}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={saveNewRole}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#da8e0a] hover:bg-[#c07c09]"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {roles.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>Henüz rol bulunmamaktadır.</p>
          <button
            onClick={handleAddRole}
            className="inline-block mt-3 text-[#447494] hover:underline"
          >
            İlk rolü ekleyin
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left">Rol Adı</th>
                <th className="py-3 px-4 text-left">Açıklama</th>
                <th className="py-3 px-4 text-left">İzinler</th>
                <th className="py-3 px-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={`role-${role.id}`} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    {editingRoleId === role.id && editedRole ? (
                      <input
                        type="text"
                        value={editedRole.name}
                        onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      role.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingRoleId === role.id && editedRole ? (
                      <input
                        type="text"
                        value={editedRole.description}
                        onChange={(e) => setEditedRole({ ...editedRole, description: e.target.value })}
                        className="px-2 py-1 border rounded w-full"
                      />
                    ) : (
                      role.description
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingRoleId === role.id && editedRole ? (
                      <div className="relative">
                        <div className="border border-gray-300 rounded-md p-2">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {editedRole.selectedPermissions.length > 0 ? (
                              permissions
                                .filter(p => editedRole.selectedPermissions.includes(p.id))
                                .map(p => (
                                  <span
                                    key={`edit-role-${role.id}-perm-${p.id}`}
                                    className="bg-[#447494] text-white px-2 py-1 rounded-full text-xs flex items-center"
                                  >
                                    {p.name}
                                    <button
                                      type="button"
                                      onClick={() => handlePermissionChange(p.id)}
                                      className="ml-1 text-white hover:text-gray-200"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))
                            ) : (
                              <span className="text-gray-500 text-xs">İzin seçin...</span>
                            )}
                          </div>

                          <div className="max-h-32 overflow-y-auto border-t border-gray-200 pt-2">
                            {permissions
                              .filter(p => !editedRole.selectedPermissions.includes(p.id))
                              .map(p => (
                                <div
                                  key={`edit-role-${role.id}-option-${p.id}`}
                                  onClick={() => handlePermissionChange(p.id)}
                                  className="p-1 hover:bg-gray-100 cursor-pointer text-sm rounded-md"
                                >
                                  {p.name}
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Güvenli bir şekilde izinleri göster */}
                        {getPermissionIds(role).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {getPermissionIds(role).map(id => {
                              const permission = permissions.find(p => p.id === id);
                              return permission ? (
                                <span
                                  key={`role-${role.id}-perm-${id}`}
                                  className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs"
                                >
                                  {permission.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">İzin yok</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center relative">
                    {editingRoleId === role.id ? (
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={saveRole}
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
                      <div className="relative" ref={openRoleId === role.id ? dropdownRef : null}>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={() => toggleRoleDropdown(role.id)}
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

                        {openRoleId === role.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                            <div className="py-1">
                              <button
                                key={`edit-btn-${role.id}`}
                                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                                onClick={() => startEditing(role)}
                              >
                                Düzenle
                              </button>
                              <button
                                key={`delete-btn-${role.id}`}
                                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                onClick={() => deleteRole(role.id)}
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