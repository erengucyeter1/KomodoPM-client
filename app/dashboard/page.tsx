"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card/Card";
import Loading from "@/components/ui/feedback/Loading";
import Button from "@/components/ui/button/Button";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (loading) return;

    // Örnek veri - gerçek API çağrısıyla değiştirilebilir
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // Gerçek API çağrısı:
        // const response = await axiosInstance.get("/dashboard/stats");
        // setStats(response.data);
        
        // Şimdilik mock veri
        setTimeout(() => {
          setStats({
            totalUsers: 8,
            totalProjects: 12,
            activeProjects: 5,
          });
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error("Dashboard verisi yüklenirken hata:", err);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [loading]);

  if (loading || isLoading) {
    return <Loading text="Dashboard bilgileri yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      <Card title={`Hoş Geldiniz, ${user?.name}`}>
        <p className="text-gray-600">
          Komodo Proje Yönetim Sistemine hoş geldiniz. Aşağıda özet bilgileri ve hızlı erişim bağlantılarını bulabilirsiniz.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Kullanıcı</p>
              <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-500 text-white mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Toplam Proje</p>
              <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600">Aktif Proje</p>
              <p className="text-2xl font-bold">{stats?.activeProjects || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Hızlı Erişim">
          <div className="space-y-2">
            <Link href="/users">
              <Button variant="secondary" className="w-full mb-2">
                Kullanıcıları Yönet
              </Button>
            </Link>
            <Link href="/projects">
              <Button variant="secondary" className="w-full mb-2">
                Projeleri Görüntüle
              </Button>
            </Link>
            <Link href="/users/register">
              <Button variant="primary" className="w-full">
                Yeni Kullanıcı Ekle
              </Button>
            </Link>
          </div>
        </Card>

        <Card title="Son Aktiviteler">
          {/* Buraya son aktiviteler eklenebilir */}
          <div className="space-y-3">
            <div className="flex items-center p-2 hover:bg-gray-50 rounded">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <span className="text-blue-500 text-sm">YK</span>
              </div>
              <div>
                <p className="text-sm">Yeni bir kullanıcı eklendi</p>
                <p className="text-xs text-gray-500">2 saat önce</p>
              </div>
            </div>
            
            <div className="flex items-center p-2 hover:bg-gray-50 rounded">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <span className="text-green-500 text-sm">PG</span>
              </div>
              <div>
                <p className="text-sm">Proje güncellendi: Römork Üretimi</p>
                <p className="text-xs text-gray-500">Dün</p>
              </div>
            </div>
            
            <div className="flex items-center p-2 hover:bg-gray-50 rounded">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <span className="text-purple-500 text-sm">MT</span>
              </div>
              <div>
                <p className="text-sm">Malzeme talebi onaylandı</p>
                <p className="text-xs text-gray-500">3 gün önce</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}