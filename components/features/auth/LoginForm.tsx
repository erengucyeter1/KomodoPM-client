import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import TextInput from "@/components/ui/form/TextInput";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(credentials.username, credentials.password);
      if (success) {
        router.push("/dashboard");
      } else {
        setError("Giriş başarısız. Kullanıcı adı veya şifre hatalı.");
      }
    } catch (err) {
      setError("Giriş işlemi sırasında bir hata oluştu.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <Alert type="error" message={error} />}

      <TextInput
        id="username"
        name="username"
        label="Kullanıcı Adı"
        value={credentials.username}
        onChange={handleChange}
        required
        autoFocus
      />

      <TextInput
        id="password"
        name="password"
        type="password"
        label="Şifre"
        value={credentials.password}
        onChange={handleChange}
        required
      />

      <PermissionButton type="submit" isLoading={loading} className="w-full">
        Giriş Yap
      </PermissionButton>
    </form>
  );
}