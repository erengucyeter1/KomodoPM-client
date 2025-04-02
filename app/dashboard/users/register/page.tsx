"use client";

import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/card/Card";
import UserForm from "@/components/features/users/UserForm";
import Loading from "@/components/ui/feedback/Loading";

export default function RegisterUserPage() {
  const { loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Card 
      title="Yeni Kullanıcı Tanımla" 
      subtitle="Komodo Proje Yönetim Sistemine yeni kullanıcı ekleyin"
    >
      <UserForm />
    </Card>
  );
}