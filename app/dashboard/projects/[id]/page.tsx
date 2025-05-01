"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import Card from "@/components/ui/card/Card";
import Button from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";

// Type definitions
interface TreylerType {
  id: string;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
}

interface User {
  id: string;
  name: string;
  surname?: string;
  username: string;
  email: string;
  role?: string;
}

interface ExpenseAllocationType {
  id: string;
  name: string;
  description?: string;
}

interface ProjectExpense {
  id: string;
  amount: number;
  product_code?: string;
  quantity?: number;
  description?: string;
  created_at: string;
  creator_id: string;
  expense_allocation_type_id: string;
  project_id: string;
  creator?: User;
  expense_allocation_type?: ExpenseAllocationType;
}

interface Project {
  id: string;
  name: string;
  customer_name: string;
  start_date?: string;
  end_date: string;
  status: string;
  budget: number;
  total_expenses: number;
  creator_id: string;
  treyler_type_id?: string;
  description?: string;
  created_at: string;
  last_updated?: string;
  creator?: User;
  treyler_type?: TreylerType;
  project_expenses?: ProjectExpense[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper function to format status
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string, color: string, bgColor: string }> = {
      planned: { label: "Planlandı", color: "text-blue-800", bgColor: "bg-blue-100" },
      in_progress: { label: "Devam Ediyor", color: "text-yellow-800", bgColor: "bg-yellow-100" },
      completed: { label: "Tamamlandı", color: "text-green-800", bgColor: "bg-green-100" },
      canceled: { label: "İptal Edildi", color: "text-red-800", bgColor: "bg-red-100" }
    };
    
    return statusMap[status] || { label: status, color: "text-gray-800", bgColor: "bg-gray-100" };
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        const response = await axiosInstance.get(`/projects/${projectId}`);
        setProject(response.data);
        
        console.log("Project data:", response.data);
      } catch (err: any) {
        console.error("Error fetching project:", err);
        setError(err.response?.data?.message || "Proje bilgileri yüklenirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Proje bilgileri yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!project) {
    return <Alert type="warning" message="Proje bulunamadı." />;
  }

  const status = getStatusInfo(project.status);
  const projectExpenses = project.project_expenses || [];
  const completionPercentage = project.budget > 0 
    ? Math.min(100, Math.round((project.total_expenses / project.budget) * 100))
    : 0;
  
  return (
    <div className="space-y-8">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
            startIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Geri
          </Button>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/dashboard/projects/${projectId}/newExpense`}>
            <Button>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Gider Ekle
              </span>
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Image and basic details */}
        <div className="lg:col-span-1">
          <Card>
            <div className="space-y-6">
              {/* Project image */}
              <div className="h-64 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {project.treyler_type?.image_data ? (
                  <img 
                    src={`data:${project.treyler_type.image_content_type || 'image/jpeg'};base64,${project.treyler_type.image_data}`}
                    alt={project.treyler_type.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
              </div>
              
              {/* Project status */}
              <div>
                <span className={`px-4 py-2 rounded-full text-sm inline-block ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>
              </div>
              
              {/* Key details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Araç Modeli</h3>
                  <p>{project.treyler_type?.name || "Belirtilmemiş"}</p>
                  {project.treyler_type?.description && (
                    <p className="text-sm text-gray-500 mt-1">{project.treyler_type.description}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Müşteri</h3>
                  <p>{project.customer_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-1">Başlangıç Tarihi</h3>
                    <p>{project.start_date ? format(new Date(project.start_date), "d MMMM yyyy", {locale: tr}) : "Belirtilmemiş"}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-1">Bitiş Tarihi</h3>
                    <p>{format(new Date(project.end_date), "d MMMM yyyy", {locale: tr})}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Right column - Budget, expenses and description */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Budget and expenses summary */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Bütçe ve Gider Özeti</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Toplam Bütçe</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.budget)}
                  </span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Toplam Gider</span>
                  <span className="text-2xl font-bold text-rose-600">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.total_expenses)}
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Bütçe Kullanımı: %{completionPercentage}</span>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.total_expenses)} / 
                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.budget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${completionPercentage > 85 ? 'bg-red-600' : completionPercentage > 60 ? 'bg-yellow-500' : 'bg-green-600'}`} 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </Card>
            
            {/* Project description */}
            {project.description && (
              <Card>
                <h2 className="text-xl font-bold mb-4">Proje Açıklaması</h2>
                <p className="whitespace-pre-wrap">{project.description}</p>
              </Card>
            )}
            
            {/* Project metadata */}
            <Card>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Proje Sorumlusu</h3>
                  <p>{project.creator ? `${project.creator.name} ${project.creator.surname || ''}` : "Belirtilmemiş"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Oluşturulma Tarihi</h3>
                  <p>{format(new Date(project.created_at), "d MMMM yyyy", {locale: tr})}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Son Güncelleme</h3>
                  <p>{project.last_updated ? format(new Date(project.last_updated), "d MMMM yyyy", {locale: tr}) : "Güncelleme yok"}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Project Expenses Section */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Proje Giderleri</h2>
          <Link href={`/dashboard/projects/${projectId}/newExpense`}>
            <Button startIcon={<span>+</span>}>
              Yeni Gider Ekle
            </Button>
          </Link>
        </div>
        
        {projectExpenses.length === 0 ? (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz gider bulunmuyor</h3>
            <p className="mt-1 text-sm text-gray-500">Bu projeye gider eklemek için "Yeni Gider Ekle" butonunu kullanabilirsiniz.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gider Tipi
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Kodu
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tutar
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ekleyen
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {expense.expense_allocation_type?.name || "Belirtilmemiş"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.product_code || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.quantity || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expense.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {expense.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expense.creator ? `${expense.creator.name} ${expense.creator.surname || ''}` : "Belirtilmemiş"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(expense.created_at), "d MMMM yyyy", {locale: tr})}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
