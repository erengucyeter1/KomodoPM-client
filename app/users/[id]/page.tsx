"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import PermissionsCard from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import UserForm from "@/components/features/users/UserForm";
import { withPermissions } from "@/hoc/withPermissions";
interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  authorization_rank: number;
}



export default withPermissions(UserDetailPage, ["see:user_details"]);

function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      fetchUser();
    }
  }, [authLoading, id]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get(`/users/${id}`);
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError("Kullanıcı bilgileri yüklenemedi.");
      
      // Geliştirme ortamında örnek veri
      if (process.env.NODE_ENV === 'development') {
        setCurrentUser({
          id: Number(id),
          username: "testuser",
          name: "Test",
          surname: "User",
          email: "test@example.com",
          authorization_rank: 5
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axiosInstance.delete(`/users/${id}`);
      router.push("/users");
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Kullanıcı silinirken bir hata oluştu.");
    }
  };

  if (authLoading || isLoading) {
    return <Loading text="Kullanıcı bilgileri yükleniyor..." />;
  }

  if (error && !currentUser) {
    return (
      <PermissionsCard>
        <Alert type="error" message={error} />
        <div className="mt-4">
          <PermissionButton variant="secondary" onClick={() => router.push("/users")}>
            Kullanıcılar Sayfasına Dön
          </PermissionButton>
        </div>
      </PermissionsCard>
    );
  }

  if (isEditMode && currentUser) {
    return (
      <PermissionsCard title="Kullanıcı Düzenle">
        <UserForm 
          permissionsRequired={['update:user']}
          initialData={currentUser} 
          isEditing={true} 
          onSuccess={() => {
            setIsEditMode(false);
            fetchUser();
          }} 
        />
      </PermissionsCard>
    );
  }

  return (
    <PermissionsCard
      permissionsRequired={['see:user_details']} 
      title="Kullanıcı Detayları" 
      actions={
        <div className="flex space-x-2">
          <PermissionButton
              permissionsRequired = {['update:user']}
            variant="secondary"
            onClick={() => setIsEditMode(true)}
          >
            Düzenle
          </PermissionButton>
          <PermissionButton
          permissionsRequired = {['delete:user']}
        
            variant="danger"
            onClick={handleDelete}
          >
            Sil
          </PermissionButton>
        </div>
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {currentUser && (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Kullanıcı Bilgileri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Kullanıcı Adı</p>
                <p className="font-medium">{currentUser.username}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{currentUser.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Ad</p>
                <p className="font-medium">{currentUser.name}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Soyad</p>
                <p className="font-medium">{currentUser.surname}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Yetki Seviyesi</p>
                <p className="font-medium">
                  {currentUser.authorization_rank >= 10 
                    ? "Admin" 
                    : currentUser.authorization_rank >= 5 
                    ? "Yönetici" 
                    : "Standart Kullanıcı"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <PermissionButton
              variant="secondary"
              onClick={() => router.push("/users")}
            >
              Kullanıcılar Listesine Dön
            </PermissionButton>
          </div>
        </div>
      )}
    </PermissionsCard>
  );
}