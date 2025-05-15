"use client";


"use client";


import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import PermissionsCard from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import TextInput from "@/components/ui/form/TextInput";
import {usePermissions} from "@/hooks/usePermissions";
import { withPermissions } from "@/hoc/withPermissions";

// Tip tanımlamaları
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

interface Permission {
  id: number;
  name: string;
  description: string;
  selectedPermissions: number[];
}

interface EditedRole extends Role {
  selectedPermissions: number[];
}

export default withPermissions(RolesPage, ["see:roles"]);

function RolesPage() {

  usePermissions(['see:roles']);

  const { user, isLoading: authLoading } = useAuth(); // Admin yetkisi gerekli
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
    // permissions veya permissions'den birini kullan, hiçbiri yoksa boş dizi
    const permissions = Array.isArray(role.permissions)
      ? role.permissions
      : [];

    return {
      ...role,
      permissions
    };
  };

  useEffect(() => {
    if (!authLoading) {
      fetchRolesAndPermissions();
      
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
  }, [authLoading]);

  const fetchRolesAndPermissions = async () => {
    try {
      setIsLoading(true);
      
      // Parallel API calls for better performance
      const [rolesResponse, permissionsResponse] = await Promise.all([
        axiosInstance.get("/authorization/roles"),
        axiosInstance.get("/authorization/permissions")
      ]);

      // API yanıtını normalize etmeye gerek yok, roller direkt kullanılabilir.
      // const normalizedRoles = Array.isArray(rolesResponse.data)
      //   ? rolesResponse.data.map(normalizeRole) // normalizeRole artık kullanılmıyor
      //   : [];
      // setRoles(normalizedRoles);

      setRoles(Array.isArray(rolesResponse.data) ? rolesResponse.data : []);
      setPermissions(permissionsResponse.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(`Veriler yüklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRoleDropdown = (roleId: string) => {
    setOpenRoleId(openRoleId === roleId ? null : roleId);
  };

  const startEditing = (role: Role) => {
    // Role.permissions artık Permission[] tipinde olduğu için ID'leri map'lememiz gerekiyor.
    setEditingRoleId(role.id);
    setEditedRole({
      ...role,
      selectedPermissions: role.permissions ? role.permissions.map(p => p.id) : []
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

  const saveRole = async () => {
    if (!editedRole) return;

    try {
      // API'ye kaydetme işlemi
      const roleToUpdate = {
        name: editedRole.name,
        description: editedRole.description,
        permissions: editedRole.selectedPermissions, // This is number[]
      };
      const response = await axiosInstance.put(`/authorization/roles/${editedRole.id}`, roleToUpdate);
      const updatedRoleFromAPI: Role = response.data; // Backend returns the full Role object

      // UI'yi güncelle
      setRoles(prevRoles => prevRoles.map(r => {
        if (r.id === updatedRoleFromAPI.id) {
          return updatedRoleFromAPI; // Replace with the full updated object
        }
        return r;
      }));

      setEditingRoleId(null);
      setEditedRole(null);
      setError("");
      fetchRolesAndPermissions(); // Re-fetch data to refresh the table
    } catch (error: any) {
      console.error("Error updating role:", error);
      setError(`Rol güncellenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
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

  const saveNewRole = async () => {
    // Validation
    if (!newRole.name.trim()) {
      setError("Rol adı boş olamaz");
      return;
    }

    try {
      // API'ye kaydetme işlemi
      const roleToAdd = {
        name: newRole.name,
        description: newRole.description,
        permissions: newRole.selectedPermissions, // This is number[]
      };

      const response = await axiosInstance.post("/authorization/roles", roleToAdd);
      const newRoleFromAPI: Role = response.data; // Backend returns the full Role object

      // API'den gelen yeni rol verisini ekle
      setRoles(prevRoles => [...prevRoles, newRoleFromAPI]);
      setIsAddingRole(false);
      setNewRole({
        name: "",
        description: "",
        selectedPermissions: []
      });
      setError("");
      fetchRolesAndPermissions(); // Re-fetch data to refresh the table
    } catch (error: any) {
      console.error("Error adding role:", error);
      setError(`Rol eklenirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  };

  const deleteRole = async (roleId: string) => {
    if (!window.confirm("Bu rolü silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/authorization/roles/${roleId}`);

      // UI'yi güncelle
      setRoles(prevRoles => prevRoles.filter(role => role.id !== roleId));
      setOpenRoleId(null);
      setError("");
    } catch (error: any) {
      console.error("Error deleting role:", error);
      setError(`Rol silinirken bir hata oluştu: ${error.message || "Bilinmeyen hata"}`);
    }
  };

  // İzinleri göstermek için yardımcı fonksiyon
  const getpermissions = (role: Role): Permission[] => {
    if (Array.isArray(role.permissions) && role.permissions.length > 0) {
      return role.permissions;
    }
    return [];
  };

  if (authLoading || isLoading) {
    return <Loading text="Roller ve izinler yükleniyor..." />;
  }

  return (
    <PermissionsCard 
      title="Kullanıcı Rolleri" 
      actions={
        <PermissionButton 
          onClick={handleAddRole}
          startIcon="+"
          permissionsRequired= {['add:role']}
        >
          Yeni Rol Ekle
        </PermissionButton>
      }
    >
      {error && (
        <Alert 
          type="error" 
          message={error} 
          className="mb-4"
          onClose={() => setError("")}
        />
      )}

      {/* Yeni Rol Ekleme Formu */}
      {isAddingRole && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="text-lg font-semibold mb-3">Yeni Rol Ekle</h2>
          <div className="space-y-3">
            <TextInput
              id="new-role-name"
              name="name"
              label="Rol Adı"
              value={newRole.name}
              onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
              placeholder="Rol adını girin"
              required
            />

            <div className="mb-4">
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
              <PermissionButton
                variant="secondary"
                onClick={cancelAddRole}
              >
                İptal
              </PermissionButton>
              <PermissionButton
                onClick={saveNewRole}
              >
                Kaydet
              </PermissionButton>
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
                      <TextInput
                        id={`edit-role-name-${role.id}`}
                        name="name"
                        label=""
                        value={editedRole.name}
                        onChange={(e) => setEditedRole({ ...editedRole, name: e.target.value })}
                        className="mb-0"
                      />
                    ) : (
                      role.name
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingRoleId === role.id && editedRole ? (
                      <textarea
                        id={`edit-role-desc-${role.id}`}
                        value={editedRole.description}
                        onChange={(e) => setEditedRole(prev => prev ? { ...prev, description: e.target.value } : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                        rows={1}
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
                        {role.permissions && role.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {role.permissions.map(permission => {
                              return permission ? (
                                <span
                                  key={`role-${role.id}-perm-${permission.id}`}
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
                        <PermissionButton
                          variant="success"
                          size="sm"
                          onClick={saveRole}
                          title="Kaydet"
                        >
                          ✓
                        </PermissionButton>
                        <PermissionButton
                          variant="danger"
                          size="sm"
                          onClick={cancelEditing}
                          title="İptal"
                        >
                          ✕
                        </PermissionButton>
                      </div>
                    ) : (
                      <div className="relative" ref={openRoleId === role.id ? dropdownRef : null}>
                        <PermissionButton
                          className="text-gray-500    hover:text-gray-700"
                          onClick={() => toggleRoleDropdown(role.id)}
                          variant="ghost"

                          permissionsRequired={['delete:role','update:role']}
                          requirementType = "some"
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
                        </PermissionButton>

                        {openRoleId === role.id && (
                        <div className="absolute right-1 mt-2 w-32 bg-white rounded-md shadow-lg z-10">
                          <div className="py-1 flex flex-col items-center justify-center gap-2 p-2">
                            <PermissionButton
                              key={`edit-btn-${role.id}`}
                              permissionsRequired={['update:role']}
                              variant="ghost"
                              onClick={() => startEditing(role)}
                              className="w-full text-center justify-center"
                            >
                              Düzenle
                            </PermissionButton>
                            <PermissionButton
                              key={`delete-btn-${role.id}`}
                              permissionsRequired={['delete:role']}
                              variant="danger"
                              onClick={() => deleteRole(role.id)}
                              className="w-full text-center justify-center"
                                >
                                  Sil
                                </PermissionButton>
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
    </PermissionsCard>
  );
}