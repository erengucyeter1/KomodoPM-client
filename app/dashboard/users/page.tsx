"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import UsersTable from "@/components/features/users/UsersTable";

interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  authorization_rank: number;
  permissions?: number[];
  roles?: number[]; // Add this to store roles
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/users");
      setUsers(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Kullanıcılar yüklenirken bir hata oluştu.");
      setIsLoading(false);
      
      // Geliştirme ortamında örnek veri göster
      if (process.env.NODE_ENV === 'development') {
        setUsers([
          { id: 1, username: "admin", name: "Admin", surname: "User", email: "admin@example.com", authorization_rank: 10 },
          { id: 2, username: "johndoe", name: "John", surname: "Doe", email: "john@example.com", authorization_rank: 5 },
          { id: 3, username: "janedoe", name: "Jane", surname: "Doe", email: "jane@example.com", authorization_rank: 3 },
        ]);
        setIsLoading(false);
      }
    }
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === updatedUser.id ? updatedUser : user
      )
    );
    setSuccess(`${updatedUser.name} ${updatedUser.surname} için roller başarıyla güncellendi.`);
    
    // 3 saniye sonra başarı mesajını kaldır
    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  return (
    <Card 
    userPermissions={user?.permissions}
    permissionsRequired={[13]}
      title="Tüm Kullanıcılar" 
      actions={
        <Link href="/dashboard/users/register">
          <Button 

          startIcon="+"
          permissionsRequired={[9]}
          userPermissions={user?.permissions}

          >
            Yeni Kullanıcı Ekle
            </Button>
        </Link>
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}
      {success && <Alert type="success" message={success} className="mb-4" />}
      
      <UsersTable
        users={users} 
        isLoading={isLoading} 
        onUserUpdate={handleUserUpdate}
        permissionsRequired={[13]}
        userPermissions={user?.permissions} // Pass user permissions to UsersTable
      />
    </Card>
  );
}