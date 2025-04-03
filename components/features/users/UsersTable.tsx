import React, { useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/table/DataTable";
import Button from "@/components/ui/button/Button";
import RoleAssignModal from "@/components/features/users/RoleAssignModal";
import { hasRequiredPermissions } from "@/lib/permissions/utils";
import {forbiddenWarning} from "@/lib/permissions/messageComponents";
import{useAuth} from "@/hooks/useAuth"; 

interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  authorization_rank: number;
  permissions?: number[];
}

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onUserUpdate?: (updatedUser: User) => void;
}

export default function UsersTable({ users, isLoading, onUserUpdate ,  permissionsRequired,
  userPermissions}: UsersTableProps) {


  // Check if the user has the required permissions to view this component

  if (!hasRequiredPermissions(permissionsRequired, userPermissions)) {
    return forbiddenWarning(); // If no permissions, render nothing
  }
  

  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const { user } = useAuth(); // Get the current user from the auth context

  const handleRoleEdit = (user: User) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRoleAssigned = (updatedUser: User) => {
    setIsRoleModalOpen(false);
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }
  };

  const columns = [
    { title: "Kullanıcı Adı", key: "username" },
    {
      title: "Ad Soyad",
      key: "fullName",
      render: (tempUser: User) => `${tempUser.name} ${tempUser.surname}`, // Use row data
    },
    { title: "E-posta", key: "email" },
    { 
      title: "Yetki Seviyesi", 
      key: "authorization_rank",
      render: (tempUser: User) => {
        return tempUser.authorization_rank;
      }
    },
    {
      title: "İşlemler",
      key: "actions",
      className: "text-center",
      render: (tempUser: User) => (
        <div className="flex space-x-2 justify-center">
          <Button
              permissionsRequired ={['see:user_details']}
              userPermissions = {user?.permissions}
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/dashboard/users/${tempUser.id}`)}
          >
            Detaylar
          </Button>
          <Button
          permissionsRequired ={['see:user_roles']}
          userPermissions = {user?.permissions}
            variant="primary"
            size="sm"
            onClick={() => handleRoleEdit(tempUser)}
          >
            Roller
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={users}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="Henüz kullanıcı bulunmamaktadır."
      />

      {selectedUser && (
        <RoleAssignModal
          isOpen={isRoleModalOpen}
          onClose={() => setIsRoleModalOpen(false)}
          user={selectedUser}
          onRoleAssigned={handleRoleAssigned}
        />
      )}
    </>
  );
}