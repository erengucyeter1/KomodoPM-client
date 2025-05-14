"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "@/utils/axios";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useSearchParams } from 'next/navigation';

interface TrailerType {
  id: string;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
}

interface Project {
  id: number;
  name: string;
  customer_name: string;
  start_date?: string;
  end_date: string;
  status: string;
  budget: number;
  model_name?: string;
  creator?: string;
  last_updated?: string;
  total_expenses?: number;
  created_at?: string;
  creator_id?: number;
  treyler_type_id?: number;
  description?: string;
  treyler_type?: TrailerType; // Add the treyler_type property
}

export default function ProjectsPage() {
  const { loading: authLoading , user} = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pageSize] = useState(15);
  const observer = useRef<IntersectionObserver | null>(null);
  const searchParams = useSearchParams();
  const refreshParam = searchParams.get('refresh');

  // Reference for the last project element to implement infinite scrolling
  const lastProjectRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading) return;
    
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  useEffect(() => {
    if (!authLoading) {
      fetchProjects(1, true);
    }
  }, [authLoading, refreshParam]); // Add refreshParam dependency to trigger refetch

  useEffect(() => {
    if (page > 1) {
      fetchProjects(page, false);
    }
  }, [page]);

  const fetchProjects = async (pageNum: number, reset: boolean) => {
    try {
      setIsLoading(true);
      
      // Use real API endpoint with pagination and add cache busting
      const response = await axiosInstance.get(`/projects`, {
        params: {
          page: pageNum,
          limit: pageSize,
          sort: 'created_at,desc',
          _t: Date.now() // Add cache busting parameter
        }
      });
      
      console.log('Projects response:', response.data);
      
      // Check if response contains the expected data structure
      const projectsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.data || response.data.projects || []);
      
      // Transform data if needed to match our interface
      const transformedProjects = projectsData.map((project: any) => ({
        id: project.id,
        name: project.name || `Proje ${project.id}`,
        customer_name: project.customer_name || "Belirtilmemiş",
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status || "planned",
        budget: parseFloat(project.budget) || 0,
        model_name: project.treyler_type_id ? `Model ${project.treyler_type_id}` : undefined,
        creator: project.creator?.name || "Belirtilmemiş",
        last_updated: project.updated_at || project.created_at,
        total_expenses: parseFloat(project.total_expenses) || 0,
        description: project.description,
        creator_id: project.creator_id,
        created_at: project.created_at,
        treyler_type_id: project.treyler_type_id,
        treyler_type: project.treyler_type // Include treyler_type in the transformed data
      }));
      
      // Update projects state
      setProjects(prevProjects => reset ? transformedProjects : [...prevProjects, ...transformedProjects]);
      
      // Determine if there are more projects to load
      setHasMore(transformedProjects.length === pageSize);
      
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Projeler yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      <Card 
        title="Projeler" 
        actions={
          <Link href="/projects/create">
            <PermissionButton startIcon="+"  permissionsRequired={['create:project']}>
              Yeni Proje
            </PermissionButton>
          </Link>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => {
          const status = getStatusInfo(project.status);
          const isLastItem = index === projects.length - 1;
          
          return (
            <div
              key={project.id}
              ref={isLastItem ? lastProjectRef : null}
              className="cursor-pointer h-full"
              onClick={() => window.location.href = `/projects/${project.id}`}
            >
              <Card className="hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                {/* Image Section - Top of Card */}
                <div className="h-48 mb-4 overflow-hidden rounded bg-gray-100 relative">
                  {project.treyler_type && project.treyler_type.image_data ? (
                    <img 
                      src={`data:${project.treyler_type.image_content_type || 'image/jpeg'};base64,${project.treyler_type.image_data}`}
                      alt={project.treyler_type.name || "Araç Modeli"}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Status Badge - Top Right Corner */}
                  <span className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs ${status.bgColor} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                
                {/* Project Information - Below Image */}
                <div className="flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{project.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Model</p>
                      <p className="font-medium">{project.treyler_type?.name || project.model_name || "Belirtilmemiş"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Müşteri</p>
                      <p className="font-medium">{project.customer_name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Proje Sahibi</p>
                      <p className="font-medium">{project.creator || "Belirtilmemiş"}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Bütçe</p>
                      <p className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.budget)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-auto pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-500">Toplam Gider</p>
                      <p className="font-medium text-rose-600">
                        {project.total_expenses 
                          ? new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(project.total_expenses) 
                          : "Gider yok"}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Son Güncelleme</p>
                      <p className="text-sm">
                        {project.last_updated 
                          ? format(new Date(project.last_updated), "d MMMM yyyy", {locale: tr}) 
                          : "Belirtilmemiş"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
        
        {isLoading && (
          <div className="py-8 flex justify-center">
            <Loading text="Projeler yükleniyor..." />
          </div>
        )}
        
        {!isLoading && projects.length === 0 && (
          <Card>
            <div className="py-12 flex flex-col items-center text-gray-500">
              <svg className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xl font-medium">Henüz proje bulunmamaktadır</p>
              <p className="mt-2">Yeni bir proje eklemek için "Yeni Proje" butonuna tıklayın</p>
            </div>
          </Card>
        )}
        
        {!hasMore && projects.length > 0 && (
          <div className="text-center py-6 text-gray-500">
            Tüm projeler yüklendi
          </div>
        )}
      </div>
    </div>
  );
}