"use client";

import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import PermissionsCard from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import axiosInstance from "@/utils/axios";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth"; // Import the auth hook

import { withPermissions } from "@/hoc/withPermissions";

// trailer model tipi
interface TrailerModel {
  id: number | string;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
}

// Project statuses
const projectStatuses = [
  { value: "planned", label: "Planlandı" },
  { value: "in_progress", label: "Devam Ediyor" },
  { value: "completed", label: "Tamamlandı" },
  { value: "canceled", label: "İptal Edildi" }
];

interface ProjectFormData {
  name: string;
  customer_name: string;
  start_date: string;
  end_date: string;
  status: string;
  budget: number;
  model_id: number;
  description: string;
}

export default withPermissions(CreateProjectPage, ["create:project"]);

function CreateProjectPage() {
  const router = useRouter();
  const { user } = useAuth(); // Get authenticated user
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TrailerModel | null>(null);
  // Yeni state değişkenleri
  const [models, setModels] = useState<TrailerModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);

  // trailer class
  const [trailerClass, setTrailerClass] = useState<string>("");

  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProjectFormData>({
    defaultValues: {
      status: "planned",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd") // 30 days from now
    }
  });

 
  
  // trailer modellerini backend'den çek
  useEffect(() => {
    const fetchTrailerModels = async () => {
      try {
        setLoadingModels(true);
        const response = await axiosInstance.get('/trailers?classFilter=' + trailerClass);
        setModels(response.data);
      } catch (err) {
        console.error("Römork modelleri çekilirken bir hata oluştu:", err);
        // Hata durumunda UI'da özel bir gösterim istemiyorsanız state'e kaydetmeye gerek yok
      } finally {
        setLoadingModels(false);
      }
    };

    fetchTrailerModels();
  }, [trailerClass]);
  
  const watchModelId = watch("model_id");
  
  // Update selected model when model_id changes
  useEffect(() => {
    if (watchModelId && models.length > 0) {
      const model = models.find(model => 
        model.id === Number(watchModelId) || model.id === watchModelId
      );
      setSelectedModel(model || null);
    } else {
      setSelectedModel(null);
    }
  }, [watchModelId, models]);
  
  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true);
      setError("");
      
      // Check if user is authenticated
      if (!user || !user.id) {
        setError("Oturum bilgileriniz bulunamadı. Lütfen tekrar giriş yapın.");
        return;
      }
      
      // Prepare data for API
      const projectData = {
        name: data.name,
        customer_name: data.customer_name,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        budget: data.budget,
        treyler_type_id: data.model_id,
        description: data.description,
        creator_id: user.id // Add the creator_id from the authenticated user
      };
      
      console.log("Sending project data:", projectData);
      
      // Send data to the API
      const response = await axiosInstance.post('/projects', projectData);
      
      console.log("Project created successfully:", response.data);
      setSuccess(true);
      
      // Redirect to projects page after short delay
      setTimeout(() => {
        router.push("/projects?refresh=" + Date.now());
      }, 1500);
      
    } catch (err: any) {
      console.error("Error creating project:", err);
      setError(
        err.response?.data?.message || 
        "Proje oluşturulurken bir hata oluştu. Tüm alanları kontrol ediniz."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PermissionsCard title="Yeni Proje Oluştur">
        {error && <Alert type="error" message={error} className="mb-4" />}
        {success && <Alert type="success" message="Proje başarıyla oluşturuldu. Projeler sayfasına yönlendiriliyorsunuz..." className="mb-4" />}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Project Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proje Adı
                </label>
                <input
                  type="text"
                  className={`block w-full rounded-md border ${errors.name ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  placeholder="Proje adını giriniz"
                  {...register("name", { required: "Proje adı gereklidir" })}
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Müşteri Adı
                </label>
                <input
                  type="text"
                  className={`block w-full rounded-md border ${errors.customer_name ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  placeholder="Müşteri adını giriniz"
                  {...register("customer_name", { required: "Müşteri adı gereklidir" })}
                />
                {errors.customer_name && <p className="mt-1 text-sm text-red-600">{errors.customer_name.message}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proje Açıklaması
                </label>
                <textarea
                  rows={3}
                  className={`block w-full rounded-md border ${errors.description ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  placeholder="Proje detaylarını giriniz"
                  {...register("description")}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bütçe (TL)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  className={`block w-full rounded-md border ${errors.budget ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  placeholder="Bütçe tutarını giriniz"
                  {...register("budget", { 
                    required: "Bütçe gereklidir",
                    valueAsNumber: true,
                    min: { value: 0, message: "Bütçe 0'dan küçük olamaz" }
                  })}
                />
                {errors.budget && <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    className={`block w-full rounded-md border ${errors.start_date ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                    {...register("start_date", { required: "Başlangıç tarihi gereklidir" })}
                  />
                  {errors.start_date && <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    className={`block w-full rounded-md border ${errors.end_date ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                    {...register("end_date", { required: "Bitiş tarihi gereklidir" })}
                  />
                  {errors.end_date && <p className="mt-1 text-sm text-red-600">{errors.end_date.message}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durum
                </label>
                <select
                  className={`block w-full rounded-md border ${errors.status ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  {...register("status", { required: "Durum gereklidir" })}
                >
                  {projectStatuses.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>}
              </div>
              <div>
              <div className="grid gap-3">

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Römork Sınıfı
                  </label>
                  <select
                        id="class"
                        name="class"
                        value={trailerClass}
                        onChange={(e) => setTrailerClass(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]"
                        required
                      >
                        <option value="">Tümü</option>
                        <option value="LOWBED">LOWBED</option>
                        <option value="LOWLOADER">LOWLOADER</option>
                        <option value="FLATBED">FLATBED</option>
                        <option value="SPECIAL">SPECIAL</option>
                    </select>

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Araç Modeli
                </label>
                <select
                  className={`block w-full rounded-md border ${errors.model_id ? 'border-red-300' : 'border-gray-300'} shadow-sm py-2 px-3 focus:outline-none focus:ring-[#063554] focus:border-[#063554]`}
                  {...register("model_id", { 
                    required: "Model seçimi gereklidir",
                    valueAsNumber: true
                  })}
                  disabled={loadingModels}
                >
                  <option value="">Model Seçiniz</option>
                  {loadingModels ? (
                    <option value="" disabled>Modeller yükleniyor...</option>
                  ) : (
                    models.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} {model.description ? `- ${model.description}` : ''}
                      </option>
                    ))
                  )}
                </select>
                {errors.model_id && <p className="mt-1 text-sm text-red-600">{errors.model_id.message}</p>}
                </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Model Preview Card - update to include image if available */}
          {selectedModel && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-medium mb-2">Seçilen Model: {selectedModel.name}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Model Açıklaması</p>
                  <p>{selectedModel.description || "Açıklama yok"}</p>
                </div>
                
                {/* Görseli ekle eğer varsa */}
                {selectedModel.image_data && (
                  <div className="col-span-2 mt-2">
                    <p className="text-sm text-gray-500 mb-2">Model Görseli</p>
                    <img 
                      src={`data:${selectedModel.image_content_type || 'image/jpeg'};base64,${selectedModel.image_data}`} 
                      alt={selectedModel.name}
                      className="max-h-40 rounded border object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-3">
            <PermissionButton
              type="button"
              variant= "danger"
              onClick={() => router.push("/projects")}
              disabled={isSubmitting}
            >
              İptal
            </PermissionButton>
            <PermissionButton
              type="submit"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <Loading size="sm" /> : undefined}
            >
              {isSubmitting ? "Oluşturuluyor..." : "Proje Oluştur"}
            </PermissionButton>
          </div>
        </form>
      </PermissionsCard>
    </div>
  );
}