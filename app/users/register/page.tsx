"use client";

import { useAuth } from "@/hooks/useAuth";
import PermissionsCard from "@/components/ui/card/Card";
import UserForm from "@/components/features/users/UserForm";
import Loading from "@/components/ui/feedback/Loading";
import { withPermissions } from "@/hoc/withPermissions";

export default withPermissions(RegisterUserPage, ["create:user"]);


function RegisterUserPage() {
  const { user,loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <PermissionsCard 
      permissionsRequired={['create:user']}
      title="Yeni Kullanıcı Tanımla" 
      subtitle="Komodo Proje Yönetim Sistemine yeni kullanıcı ekleyin"
    >
      <UserForm permissionsRequired={['create:user']} />
    </PermissionsCard>
  );
}