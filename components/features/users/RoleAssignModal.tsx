import React, { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import Modal from "@/components/ui/modal/Modal";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";

interface User {
  id: number;
  username: string;
  name: string;
  surname: string;
  email: string;
  authorization_rank: number;
  permissions?: number[];
  roles?: number[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions?: number[];
}

interface RoleAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onRoleAssigned: (updatedUser: User) => void;
}

export default function RoleAssignModal({
  isOpen,
  onClose,
  user,
  onRoleAssigned,
}: RoleAssignModalProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Kullanıcının sahip olduğu roller
  const [userRoles, setUserRoles] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      fetchUserRoles();
    }
  }, [isOpen, user.id]);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/authorization/roles");
      setRoles(response.data);
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Roller yüklenirken bir hata oluştu.");
      
      // Geliştirme ortamında örnek data
      if (process.env.NODE_ENV === 'development') {
        setRoles([
          { id: "1", name: "Admin", description: "Tam yetki", permissions: [1, 2, 3, 4, 5] },
          { id: "2", name: "Manager", description: "Yönetici rolü", permissions: [1, 2, 3] },
          { id: "3", name: "User", description: "Standart kullanıcı", permissions: [1] },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRoles = async () => {
    try {
      const response = await axiosInstance.get(`/users/${user.id}/roles`);
      
      const roleIds = response.data.roles || [];
      
      // Number tipindeki ID'leri string'e dönüştür
      const roleIdsAsStrings = roleIds.map(id => id.toString());
      
      setUserRoles(roleIdsAsStrings);
      setSelectedRoles(roleIdsAsStrings);
    } catch (err) {
      console.error("Error fetching user roles:", err);
      
      // Geliştirme ortamında örnek data
      if (process.env.NODE_ENV === 'development') {
        // Kullanıcı authorization_rank'e göre varsayılan roller atayalım
        const defaultRoles = user.authorization_rank >= 10 
          ? ["1"] 
          : user.authorization_rank >= 5 
            ? ["2"] 
            : ["3"];
        setUserRoles(defaultRoles);
        setSelectedRoles(defaultRoles);
      }
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev => {
      if (prev.includes(roleId)) {
        return prev.filter(id => id !== roleId);
      } else {
        return [...prev, roleId];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      
      // Make sure username is a string and roles are properly formatted numbers
      const updateUserRolesDto = {
        username: user.username,
        roles: selectedRoles.map(roleId => Number(roleId)) // Use Number() for explicit conversion
      };
      
      console.log('Sending role update payload:', updateUserRolesDto);
      
      // Make the request to update roles
      const response = await axiosInstance.patch('/users/roles/update', updateUserRolesDto);
      console.log('Role update success:', response.data);
      
      // Collect permissions from selected roles
      let allPermissions: number[] = [];
      selectedRoles.forEach(roleId => {
        const role = roles.find(r => r.id === roleId);
        if (role && role.permissions) {
          allPermissions = [...allPermissions, ...role.permissions];
        }
      });
      
      // Remove duplicates
      allPermissions = [...new Set(allPermissions)];
      
      // Update user object with new roles and permissions
      const updatedUser = {
        ...user,
        permissions: allPermissions,
        roles: selectedRoles.map(id => parseInt(id, 10))
      };
      
      onRoleAssigned(updatedUser);
      onClose();
    } catch (err: any) {
      console.error("Error saving user roles:", err);
      
      // Enhanced error handling with more details
      let errorMessage = "Roller kaydedilirken bir hata oluştu.";
      
      // Try to extract the specific error message from the response if available
      if (err.response && err.response.data) {
        console.error("Error response data:", err.response.data);
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          errorMessage = err.response.data.error;
        }
      }
      
      setError(errorMessage);
      
      // Development mode fallback
      if (process.env.NODE_ENV === 'development') {
        // Simulate success in development mode
        console.log('Development mode: Simulating successful role update');
        
        let allPermissions: number[] = [];
        selectedRoles.forEach(roleId => {
          const role = roles.find(r => r.id === roleId);
          if (role && role.permissions) {
            allPermissions = [...allPermissions, ...role.permissions];
          }
        });
        
        allPermissions = [...new Set(allPermissions)];
        
        const updatedUser = {
          ...user,
          permissions: allPermissions,
          roles: selectedRoles.map(id => parseInt(id, 10))
        };
        
        onRoleAssigned(updatedUser);
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`${user.name} ${user.surname} için Rol Atama`}
    >
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      {isLoading ? (
        <Loading text="Roller yükleniyor..." />
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">
            Lütfen kullanıcıya atamak istediğiniz rolleri seçin:
          </p>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {roles.map(role => (
              <div 
                key={role.id} 
                className="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  id={`role-${role.id}`}
                  checked={selectedRoles.includes(role.id)}
                  onChange={() => handleRoleToggle(role.id)}
                  className="h-4 w-4 text-[#da8e0a] focus:ring-[#da8e0a] border-gray-300 rounded"
                />
                <label htmlFor={`role-${role.id}`} className="flex-1 cursor-pointer">
                  <div className="font-medium">{role.name}</div>
                  {role.description && (
                    <div className="text-sm text-gray-500">{role.description}</div>
                  )}
                </label>
              </div>
            ))}
          </div>
          
          <div className="pt-4 border-t flex justify-end space-x-2">
            <Button 
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button
              onClick={handleSave}
              isLoading={isSaving}
            >
              Rolleri Kaydet
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}