"use client";

import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import DataTable from "@/components/ui/table/DataTable";
import Link from "next/link";

interface Project {
  id: number;
  name: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
}

export default function ProjectsPage() {
  const { loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading) {
      fetchProjects();
    }
  }, [authLoading]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get("/projects");
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Projeler yüklenirken bir hata oluştu.");
      
      // Geliştirme ortamında örnek veri
      if (process.env.NODE_ENV === 'development') {
        setProjects([
          { 
            id: 1, 
            name: "Treyler Üretimi A-101", 
            customer_name: "ABC Lojistik", 
            start_date: "2024-01-15", 
            end_date: "2024-04-30", 
            status: "in_progress", 
            budget: 250000 
          },
          { 
            id: 2, 
            name: "Platform Üretimi XK-22", 
            customer_name: "XYZ Taşımacılık", 
            start_date: "2024-02-10", 
            end_date: "2024-03-25", 
            status: "completed", 
            budget: 125000 
          },
          { 
            id: 3, 
            name: "Özel Treyler DT-445", 
            customer_name: "Delta Transport", 
            start_date: "2024-03-01", 
            end_date: "2024-06-15", 
            status: "planned", 
            budget: 380000 
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { title: "Proje Adı", key: "name" },
    { title: "Müşteri", key: "customer_name" },
    { 
      title: "Başlangıç", 
      key: "start_date",
      render: (project: Project) => new Date(project.start_date).toLocaleDateString('tr-TR')
    },
    { 
      title: "Bitiş", 
      key: "end_date",
      render: (project: Project) => new Date(project.end_date).toLocaleDateString('tr-TR')
    },
    { 
      title: "Durum", 
      key: "status",
      render: (project: Project) => {
        const statusMap: Record<string, { label: string, color: string }> = {
          planned: { label: "Planlandı", color: "bg-blue-100 text-blue-800" },
          in_progress: { label: "Devam Ediyor", color: "bg-yellow-100 text-yellow-800" },
          completed: { label: "Tamamlandı", color: "bg-green-100 text-green-800" },
          canceled: { label: "İptal Edildi", color: "bg-red-100 text-red-800" }
        };
        
        const status = statusMap[project.status] || { label: project.status, color: "bg-gray-100 text-gray-800" };
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    { 
      title: "Bütçe", 
      key: "budget",
      render: (project: Project) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.budget)
    },
    {
      title: "İşlemler",
      key: "actions",
      className: "text-center",
      render: (project: Project) => (
        <Link href={`/dashboard/projects/${project.id}`}>
          <Button variant="secondary" size="sm">
            Detaylar
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <Card 
      title="Projeler" 
      actions={
        <Link href="/dashboard/projects/create">
          <Button startIcon="+">
            Yeni Proje
          </Button>
        </Link>
      }
    >
      {error && <Alert type="error" message={error} className="mb-4" />}
      
      <DataTable
        data={projects}
        columns={columns}
        keyExtractor={(project) => project.id}
        isLoading={isLoading}
        emptyMessage="Henüz proje bulunmamaktadır."
      />
    </Card>
  );
}