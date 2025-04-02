"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import TextInput from "@/components/ui/form/TextInput";

interface Permission {
  id: number;
  name: string;
  description: string;
}

export default function PermissionsPage() {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [isAddingPermission, setIsAddingPermission] = useState(false);
  const [isEditingPermission, setIsEditingPermission] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formErrors, setFormErrors] = useState({
    name: "",
  });

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading]);

  const fetchPermissions = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/authorization/permissions");
      setPermissions(response.data);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError("İzinler yüklenirken bir hata oluştu.");
      
      if (process.env.NODE_ENV === 'development') {
        setPermissions([
          { id: 1, name: "Kullanıcı Görüntüleme", description: "Kullanıcıları görüntüleme izni" },
          { id: 2, name: "Kullanıcı Ekleme", description: "Yeni kullanıcı ekleme izni" },
          { id: 3, name: "Kullanıcı Düzenleme", description: "Mevcut kullanıcıları düzenleme izni" },
          { id: 4, name: "Kullanıcı Silme", description: "Kullanıcıları silme izni" },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'name' && !value.trim()) {
      setFormErrors(prev => ({
        ...prev,
        name: "İzin adı zorunludur"
      }));
    } else {
      setFormErrors(prev => ({
        ...prev,
        name: ""
      }));
    }
  };

  const handleAddPermission = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormErrors({
        name: "İzin adı zorunludur"
      });
      return;
    }
    
    try {
      // İzin ekle
      await axiosInstance.post("/authorization/permissions", formData);
      
      // Form verilerini temizle
      setFormData({
        name: "",
        description: ""
      });
      
      // İzin ekleme modunu kapat
      setIsAddingPermission(false);
      
      // Tüm izinleri veritabanından tekrar çek
      await fetchPermissions();
    } catch (err) {
      console.error("Error adding permission:", err);
      setError("İzin eklenirken bir hata oluştu.");
    }
  };

  const handleDeletePermission = async (id: number) => {
    if (!confirm("Bu izni silmek istediğinizden emin misiniz?")) {
      return;
    }
    
    try {
      await axiosInstance.delete(`/authorization/permissions/${id}`);
      
      setPermissions(permissions.filter(permission => permission.id !== id));
    } catch (err) {
      console.error("Error deleting permission:", err);
      setError("İzin silinirken bir hata oluştu.");
      
      if (process.env.NODE_ENV === 'development') {
        setPermissions(permissions.filter(permission => permission.id !== id));
      }
    }
  };

  const handleUpdatePermission = async (id: number) => {
    const permissionToEdit = permissions.find(p => p.id === id);
    
    if (!permissionToEdit) {
      setError("Düzenlenecek izin bulunamadı.");
      return;
    }
    
    setFormData({
      name: permissionToEdit.name,
      description: permissionToEdit.description || "",
    });
    
    setEditingPermission(permissionToEdit);
    setIsAddingPermission(false);
    setIsEditingPermission(true);
  };

  const handleUpdatePermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingPermission) return;
    
    if (!formData.name.trim()) {
      setFormErrors({
        name: "İzin adı zorunludur"
      });
      return;
    }
    
    try {
      console.log("Güncelleme için gönderilecek veri:", {
        id: editingPermission.id,
        ...formData
      });
      
      const updatedPermissions = permissions.map(permission => 
        permission.id === editingPermission.id 
          ? { ...permission, ...formData } 
          : permission
      );
      
      setPermissions(updatedPermissions);
      
      setFormData({
        name: "",
        description: ""
      });
      
      setIsEditingPermission(false);
      setEditingPermission(null);
    } catch (err) {
      console.error("Error updating permission:", err);
      setError("İzin güncellenirken bir hata oluştu.");
    }
  };

  if (authLoading || isLoading) {
    return <Loading text="İzinler yükleniyor..." />;
  }

  return (
    <Card 
      title="İzin Yönetimi" 
      actions={
        !isAddingPermission && !isEditingPermission && (
          <Button 
          userPermissions={user?.permissions}
          permissionsRequired={[15]}
          onClick={() => setIsAddingPermission(true)}>
            Yeni İzin Ekle
          </Button>
        )
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {/* İzin Ekleme/Düzenleme Formu */}
      {(isAddingPermission || isEditingPermission) && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {isEditingPermission ? "İzin Düzenle" : "Yeni İzin Ekle"}
          </h3>
          
          <form onSubmit={isEditingPermission ? handleUpdatePermissionSubmit : handleAddPermission}>
            <div className="space-y-4">
              <TextInput
                id="name"
                name="name"
                label="İzin Adı"
                value={formData.name}
                onChange={handleChange}
                error={formErrors.name}
                required
              />
              
              <div className="mb-4">
                <label 
                  htmlFor="description" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Açıklama
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#da8e0a] focus:border-transparent"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={() => {
                    setIsAddingPermission(false);
                    setIsEditingPermission(false);
                    setEditingPermission(null);
                    setFormData({ name: "", description: "" });
                  }}
                >
                  İptal
                </Button>
                <Button type="submit">
                  {isEditingPermission ? "Güncelle" : "Kaydet"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İzin Adı
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Henüz izin bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{permission.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{permission.description || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="secondary"
                          size="xs"
                          className="px-2 py-1 text-xs"
                          userPermissions={user?.permissions}
                          permissionsRequired={[17]}
                          onClick={() => handleUpdatePermission(permission.id)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="xs"
                          className="px-2 py-1 text-xs"
                          userPermissions={user?.permissions}
                          permissionsRequired={[16]}
                          onClick={() => handleDeletePermission(permission.id)}
                        >
                          Sil
                        </Button>
                       
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </div>
    </Card>
  );
}