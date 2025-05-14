import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import TextInput from "@/components/ui/form/TextInput";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import {forbiddenWarning} from "@/lib/permissions/messageComponents";
import {hasRequiredPermissions} from "@/lib/permissions/utils";

interface UserFormData {
  username: string;
  password: string;
  name: string;
  surname: string;
  email: string;
  id?: number;
}

interface UserFormProps {
  initialData?: Partial<UserFormData>;
  isEditing?: boolean;
  permissionsRequired: string[];
  onSuccess?: () => void;
}

export default function UserForm({
  initialData = {},
  isEditing = false,
  onSuccess,
  permissionsRequired,

}: UserFormProps) {

  if (!hasRequiredPermissions(permissionsRequired)) {
    return forbiddenWarning();// İzin yoksa hiçbir şey gösterme
  }


  const router = useRouter();
  const [formData, setFormData] = useState<UserFormData>({
    username: initialData.username || "",
    password: initialData.password || "",
    name: initialData.name || "",
    surname: initialData.surname || "",
    email: initialData.email || "",
  });


  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = isEditing
        ? { ...formData }
        : {
            ...formData,
            permissions: [1], // Default user authorization
            authorization_rank: 1, // Lowest rank by default
          };

      // Remove password if empty in edit mode
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      const endpoint = isEditing
        ? `/users/${initialData.id}`
        : "/auth/register";
      
      const method = isEditing ? "patch" : "post";

      const response = await axiosInstance[method](endpoint, payload);

      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/users");
      }
    } catch (err) {
      setLoading(false);
      setError("İşlem başarısız oldu. Lütfen tekrar deneyin.");
      console.error("Form submission error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert type="error" message={error} />}

      <TextInput
        id="username"
        name="username"
        label="Kullanıcı Adı"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <TextInput
        id="password"
        name="password"
        type="password"
        label={isEditing ? "Şifre (değiştirmek için doldurun)" : "Şifre"}
        value={formData.password}
        onChange={handleChange}
        required={!isEditing}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInput
          id="name"
          name="name"
          label="Ad"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <TextInput
          id="surname"
          name="surname"
          label="Soyad"
          value={formData.surname}
          onChange={handleChange}
          required
        />
      </div>

      <TextInput
        id="email"
        name="email"
        type="email"
        label="E-posta"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <div className="flex gap-4 pt-2">
        <PermissionButton

          type="button"
          variant="secondary"
          onClick={() => router.push("/users")}
        >
          İptal
        </PermissionButton>

        <PermissionButton type="submit" isLoading={loading}>
          {isEditing ? "Kullanıcıyı Güncelle" : "Kullanıcı Oluştur"}
        </PermissionButton>
      </div>
    </form>
  );
}