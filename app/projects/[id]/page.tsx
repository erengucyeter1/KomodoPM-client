"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import PermissionsCard from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import Link from "next/link";
import { Download, Edit } from "lucide-react"; // Yeni ikon için import
import InfoIcon from "@/components/ui/info/infoIcon";
import {useAuth} from "@/hooks/useAuth"
import { withPermissions } from "@/hoc/withPermissions";
import { User } from "@/types/UserInfoInterfaces";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // If needed for manual close button
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input"; // Assuming you have this
import { Label } from "@/components/ui/label"; // Assuming you have this
import { Button } from "@/components/ui/button";
import { useChatService } from "@/hooks/useChatService";
import { useDirectMessageSender } from "@/hooks/useDirectMessage";

// Type definitions
interface TrailerType {
  id: string;
  name: string;
  description?: string;
  image_data?: string;
  image_content_type?: string;
}

interface ExpenseAllocationType {
  id: string;
  name: string;
  description?: string;
}

interface Product {
  id: string;
  name: string;
  balance: string;
  created_at: string;
  measurement_unit: string;
  stock_code: string;
  description: string;
  unit_weight: string;
  isService: boolean;
}

interface ProjectExpense {
  id: string;
  user: User;
  amount: number;
  product_code: string;
  quantity: string;
  description?: string;
  created_at: string;
  creator_id: string;
  expense_allocation_type_id: string;
  project_id: string;
  creator?: User;
  expense_allocation_type?: ExpenseAllocationType;
  product?: Product;
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
  treyler_type?: TrailerType;
  project_expenses?: ProjectExpense[];
}

export default withPermissions(ProjectDetailPage, ["see:projectDetail"]);

function ProjectDetailPage() {
  const { user: activeUser } = useAuth();
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [projectExpenses, setProjectExpenses] = useState<ProjectExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  // State for the edit/delete modal
  const [selectedExpenseForEdit, setSelectedExpenseForEdit] = useState<ProjectExpense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedQuantity, setEditedQuantity] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // State for rank warning
  const [isPermissionRequired, setIsPermissionRequired] = useState(false);

  //const {sendMessage, setSelectedUser} = useChatService();

  const { sendMessage, isConnected } = useDirectMessageSender();

  // Helper function to format status
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      planned: { label: "Planlandı", color: "text-blue-800", bgColor: "bg-blue-100" },
      in_progress: { label: "Devam Ediyor", color: "text-yellow-800", bgColor: "bg-yellow-100" },
      completed: { label: "Tamamlandı", color: "text-green-800", bgColor: "bg-green-100" },
      canceled: { label: "İptal Edildi", color: "text-red-800", bgColor: "bg-red-100" },
    };

    return statusMap[status] || { label: status, color: "text-gray-800", bgColor: "bg-gray-100" };
  };

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setIsLoading(true);
        setError(null);

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

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axiosInstance.get<ProjectExpense[]>(`/project-expense/project/${projectId}`);
        // Ensure fetched expenses conform to ProjectExpense with string quantity/balance
        const expensesWithStringNumerics = response.data.map(exp => ({
          ...exp,
          quantity: String(exp.quantity),
          product: exp.product ? {
            ...exp.product,
            balance: String(exp.product.balance)
          } : undefined
        }));
        setProjectExpenses(expensesWithStringNumerics);
      } catch (err: any) {
        console.error("Giderler alınırken hata:", err);
      }
    };
    fetchExpenses();
  }, [projectId]);

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    setError(null); // Önceki hataları temizle

    try {
      const response = await axiosInstance.get(
        //`/reports/project/${projectId}`, // Backend endpoint'i
        `/reports/project/${projectId}/kdv-iade`,
        {
          responseType: 'blob', // Yanıtın bir Blob olarak işlenmesini sağlar
          timeout: 60000, // İsteğin zaman aşımını ayarla (örneğin 60 saniye)
        }
      );

      // Yanıtı ve veriyi kontrol et
      if (!response.data || response.data.size === 0) {
        console.error('Alınan veri boş veya geçersiz.', response);
        throw new Error('Sunucudan boş veya geçersiz rapor verisi alındı.');
      }

      // Gelen Blob'un MIME türünü kontrol et (isteğe bağlı ama iyi bir pratik)
      // Sunucu 'application/pdf' gönderiyor olmalı
      if (response.data.type && response.data.type !== 'application/pdf') {
        // Eğer beklenmedik bir tip gelirse, bu bir sorun olabilir.
        // Ancak bazen sunucular Content-Type'ı blob içinde göndermeyebilir,
        // bu yüzden bu kontrolü çok katı yapmamak gerekebilir.
        // Şimdilik sadece loglayalım.
        console.warn('Alınan Blob türü beklenenden farklı:', response.data.type);
      }

      // Blob'dan bir dosya oluştur
      // response.data zaten bir Blob olduğu için doğrudan kullanılabilir.
      // new Blob([response.data], { type: 'application/pdf' }) yapmak genellikle gereksizdir
      // eğer response.data zaten doğru MIME tipinde bir Blob ise.
      // Ancak, MIME tipini zorlamak için kullanılabilir.
      const fileBlob = new Blob([response.data], { type: 'application/pdf' });

      // İndirme için bir URL oluştur
      const fileURL = URL.createObjectURL(fileBlob);

      // İndirme işlemini tetiklemek için geçici bir link oluştur
      const downloadLink = document.createElement('a');
      downloadLink.href = fileURL;
      downloadLink.setAttribute('download', `proje-raporu-${projectId}.pdf`); // İndirilecek dosyanın adı

      // Linki DOM'a ekle, tıkla ve sonra kaldır
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Oluşturulan Object URL'yi serbest bırak
      URL.revokeObjectURL(fileURL);

    } catch (err: any) {
      console.error("Rapor indirilirken bir hata oluştu:", err);
      let errorMessage = "Rapor indirilirken bilinmeyen bir sorun oluştu.";

      if (err.response) {
        // Sunucudan bir hata yanıtı geldiyse (örneğin JSON formatında bir hata)
        // responseType: 'blob' olduğu için err.response.data bir Blob olabilir.
        // Bu Blob'u metne çevirip hata mesajını almaya çalışalım.
        if (err.response.data instanceof Blob) {
          try {
            const errorBlobText = await err.response.data.text();
            // Hata mesajının JSON formatında olduğunu varsayalım
            const parsedError = JSON.parse(errorBlobText);
            errorMessage = parsedError.message || parsedError.error || errorBlobText || "Sunucudan hata detayı alınamadı.";
          } catch (parseOrReadError) {
            errorMessage = "Sunucudan gelen hata mesajı okunamadı veya çözümlenemedi.";
          }
        } else if (err.response.data && (err.response.data.message || err.response.data.error)) {
          errorMessage = err.response.data.message || err.response.data.error;
        } else if (typeof err.response.data === 'string' && err.response.data.trim() !== '') {
          errorMessage = err.response.data;
        } else if (err.response.statusText) {
          errorMessage = `Sunucu hatası: ${err.response.status} ${err.response.statusText}`;
        }
      } else if (err.request) {
        // İstek yapıldı ama yanıt alınamadı
        errorMessage = "Sunucuya ulaşılamadı. Lütfen ağ bağlantınızı kontrol edin.";
      } else if (err.message) {
        // İsteği ayarlarken veya başka bir şeyde bir sorun oluştu
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleOpenExpenseModal = async (expenseId: string) => {
    try {
      setIsLoading(true); 
      setError(null);
      const response = await axiosInstance.get<ProjectExpense>(`/project-expense/${expenseId}`);
      const fetchedExpense = response.data;
      console.log("Fetched Expense for Edit:", fetchedExpense);

      if (!fetchedExpense) {
        setError("Düzenlenecek gider bulunamadı.");
        setIsLoading(false);
        return;
      }
      
      // Ensure string types for quantity and balance before setting state
      const processedExpense: ProjectExpense = {
          ...fetchedExpense,
          quantity: String(fetchedExpense.quantity ?? "0"), 
          product: fetchedExpense.product ? {
              ...fetchedExpense.product,
              balance: String(fetchedExpense.product.balance ?? "0") 
          } : undefined,
      };
      setSelectedExpenseForEdit(processedExpense);

      if (!activeUser || typeof activeUser.authorization_rank !== 'number') {
        setError("İşlem için kullanıcı yetkisi doğrulanamadı.");
        setIsLoading(false);
        return;
      }

      // Use processedExpense.user for rank check
      if (processedExpense.user && typeof processedExpense.user.authorization_rank === 'number') {
        if (processedExpense.user.authorization_rank > activeUser.authorization_rank) {
          setIsPermissionRequired(true);
          setIsLoading(false);
        }
      } else {
        console.warn("Gideri oluşturan kullanıcı veya yetki bilgisi eksik. Düzenlemeye izin veriliyor.", processedExpense);
      }

      setEditedQuantity(processedExpense.quantity); // quantity is now definitely string
      setIsEditModalOpen(true);
      
    } catch (err: any) {
      console.error("Error fetching expense for edit:", err);
      setError(err.response?.data?.message || "Gider bilgileri yüklenirken bir hata oluştu.");
    } finally {
        setIsLoading(false);
    }
  };
  
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedExpenseForEdit(null);
    setEditedQuantity("");
  };

  const handleSaveQuantity = async () => {

    if(!activeUser){
      setError("İşlem için kullanıcı yetkisi doğrulanamadı.");
      return;
    }
    
    if (!selectedExpenseForEdit || editedQuantity === "") return;
    
    const newQuantityNum = parseFloat(editedQuantity);
    if (isNaN(newQuantityNum) || newQuantityNum < 0) {
      setError("Geçerli bir miktar giriniz.");
      return;
    }
    
    const originalQuantityNum = selectedExpenseForEdit.quantity ? parseFloat(selectedExpenseForEdit.quantity) : 0;
    const productOriginalBalanceNum = selectedExpenseForEdit.product?.balance ? parseFloat(selectedExpenseForEdit.product.balance) : 0;
    const maxAllowedQuantity = productOriginalBalanceNum + originalQuantityNum;

    if (newQuantityNum > maxAllowedQuantity) {
      setError(`Miktar, (stok: ${productOriginalBalanceNum} + eski gider: ${originalQuantityNum}) = ${maxAllowedQuantity} ${selectedExpenseForEdit.product?.measurement_unit || ''} değerinden fazla olamaz.`);
      return;
    }
    

    if(isPermissionRequired) {

      // isteği veri tabanına kaydet              
      const response = await axiosInstance.post('/permission-requests', {
        project_expense_id: selectedExpenseForEdit.id,
        old_quantity: parseFloat(selectedExpenseForEdit.quantity),
        new_quantity: parseFloat(newQuantityNum.toString()),
        applicant_id: activeUser.id,
        expense_creator_id: selectedExpenseForEdit.creator_id,
      });

      if(response.status === 201 && (response.data.success === true || response.data.success === "true")){
        sendMessage({

          recipientId: Number(selectedExpenseForEdit.creator_id),
          content: `Değişiklik talebi: ${selectedExpenseForEdit.project_id} projesi, ${selectedExpenseForEdit.id} numaralı gider için ${selectedExpenseForEdit.quantity} → ${newQuantityNum.toString()}`,
          message_type: 'permission_request',
          metadata: {
            attemptId: response.data.data.id,
            projectNumber: selectedExpenseForEdit.project_id,
            expenseNumber: selectedExpenseForEdit.id,
            measurementUnit: selectedExpenseForEdit.product?.measurement_unit,
            productDescription: selectedExpenseForEdit.product?.description,
            oldAmount: parseFloat(selectedExpenseForEdit.quantity),
            newAmount: parseFloat(newQuantityNum.toString()),
            status: 'pending'
          }
        });

        
        closeEditModal();

      }else{
        setError(response.data.message || "İzin talebi gönderilirken bir hata oluştu.");
      }    
    }else
    {

      // handle save quantity
      const response = await axiosInstance.put(`/project-expense/${selectedExpenseForEdit.id}`, {
        product_count: newQuantityNum.toString()
      });

      if(response.status === 200 && response.data.success){
        console.log("Quantity updated response:", response);
        //setProjectExpenses(prev => prev.map(exp => exp.id === selectedExpenseForEdit.id ? { ...exp, quantity: newQuantityNum.toString() } : exp));
        const updatedExpenseList = projectExpenses.map(exp =>
          exp.id === selectedExpenseForEdit.id ? { ...exp, quantity: newQuantityNum.toString() } : exp
        );
        setProjectExpenses(updatedExpenseList);
        
        setSelectedExpenseForEdit(prev => prev ? { ...prev, quantity: newQuantityNum.toString() } : null);
      }else{
        setError("Miktar güncellenirken bir hata oluştu.");
      }

    }
  };

  const openDeleteConfirmation = () => {
    if (!selectedExpenseForEdit) return;
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedExpenseForEdit) return;
    console.log(`Deleting expense ${selectedExpenseForEdit.id}`);
    alert(`Placeholder: Gider silinecek: ${selectedExpenseForEdit.id}. Backend entegrasyonu yapılacak.`);
    setProjectExpenses(prev => prev.filter(exp => exp.id !== selectedExpenseForEdit.id));
    setIsDeleteDialogOpen(false);
    closeEditModal(); 
  };

  if (isLoading && !project) { // Show loading only if project is not yet fetched
    return (
      <div className="flex justify-center items-center h-64">
        <Loading text="Proje bilgileri yükleniyor..." />
      </div>
    );
  }

  if (error && !project) { // Show error only if project couldn't be fetched
    return <Alert type="error" message={error} />;
  }

  if (!project) {
    return <Alert type="warning" message="Proje bulunamadı." />;
  }

  const status = getStatusInfo(project.status);
  const completionPercentage =
    project.budget > 0 ? Math.min(100, Math.round((project.total_expenses / project.budget) * 100)) : 0;

  const handleCompleteProject = async () => {
    try {
        setError(null);
        await axiosInstance.put(`/projects/${projectId}/complete`);
        // Optimistically update project status or re-fetch
        setProject(prev => prev ? { ...prev, status: 'completed' } : null);
        // router.refresh(); // Or fetchProject() again
    } catch (err:any) {
        setError(err.response?.data?.message || "Proje tamamlanırken bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with back button and actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <PermissionButton
            variant="secondary"
            onClick={() => router.back()}
            startIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Geri
          </PermissionButton>
          <h1 className="text-2xl font-bold">{project.name}</h1>
        </div>

        <div className="flex gap-3">
          
          <div className="flex items-center gap-2">
            
              <InfoIcon info="Proje tamamlanmadan oluşturulan raporlar ön gösterim amaçlıdır. Geçerli bir rapor oluşturmak için önce proje tamamlanmalıdır. Proje tamamlandıktan sonra oluşturulan rapor tek sefer üretilir ve saklanır. değişiklik yapmak mümkün değildir." />
            
          </div>
          

          
          <PermissionButton onClick={handleDownloadReport} disabled={isDownloadingReport}  permissionsRequired={["create:projectExpenseReport"]}>
            <span className="flex items-center gap-2">
              {isDownloadingReport ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Download size={20} />
              )}
              {isDownloadingReport ? "Oluşturuluyor..." : "Rapor Oluştur"}
            </span>
          </PermissionButton>
        </div>
      </div>

      {/* Project Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Image and basic details */}
        <div className="lg:col-span-1">
          <PermissionsCard>
            <div className="space-y-6">
              {/* Project image */}
              <div className="h-64 rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                {project.treyler_type?.image_data ? (
                  <img
                    src={`data:${project.treyler_type.image_content_type || "image/jpeg"};base64,${project.treyler_type.image_data}`}
                    alt={project.treyler_type.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <svg className="w-24 h-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              {/* Project status */}
              <div className="flex justify-between items-center">
                <span className={`px-4 py-2 rounded-full text-sm inline-block ${status.bgColor} ${status.color}`}>
                  {status.label}
                </span>

                {status.label !== "Tamamlandı" && (
                  <PermissionButton  permissionsRequired={["update:projectStatus"]}  className="ml-2 " variant="secondary" onClick={() => handleCompleteProject()}>
                    Projeyi Tamamla
                  </PermissionButton>
                )}
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
                    <p>
                      {project.start_date
                        ? format(new Date(project.start_date), "d MMMM yyyy", { locale: tr })
                        : "Belirtilmemiş"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-1">Bitiş Tarihi</h3>
                    <p>{format(new Date(project.end_date), "d MMMM yyyy", { locale: tr })}</p>
                  </div>
                </div>
              </div>
            </div>
          </PermissionsCard>
        </div>

        {/* Right column - Budget, expenses and description */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Budget and expenses summary */}
            <PermissionsCard>
              <h2 className="text-xl font-bold mb-6">Bütçe ve Gider Özeti</h2>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Toplam Bütçe</span>
                  <span className="text-2xl font-bold">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(project.budget)}
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Toplam Gider</span>
                  <span className="text-2xl font-bold text-rose-600">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                      project.total_expenses
                    )}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Bütçe Kullanımı: %{completionPercentage}</span>
                  <span className="text-sm font-medium">
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(
                      project.total_expenses
                    )}{" "}
                    /{" "}
                    {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(project.budget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      completionPercentage > 85
                        ? "bg-red-600"
                        : completionPercentage > 60
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
            </PermissionsCard>

            {/* Project description */}
            {project.description && (
              <PermissionsCard>
                <h2 className="text-xl font-bold mb-4">Proje Açıklaması</h2>
                <p className="whitespace-pre-wrap">{project.description}</p>
              </PermissionsCard>
            )}

            {/* Project metadata */}
            <PermissionsCard>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Proje Sorumlusu</h3>
                  <p>
                    {project.creator ? `${project.creator.name} ${project.creator.surname || ""}` : "Belirtilmemiş"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Oluşturulma Tarihi</h3>
                  <p>{format(new Date(project.created_at), "d MMMM yyyy", { locale: tr })}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Son Güncelleme</h3>
                  <p>
                    {project.last_updated
                      ? format(new Date(project.last_updated), "d MMMM yyyy", { locale: tr })
                      : "Güncelleme yok"}
                  </p>
                </div>
              </div>
            </PermissionsCard>
          </div>
        </div>
      </div>

      {/* Project Expenses Section */}
      <PermissionsCard>
        {project.status !== "completed" && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Proje Giderleri</h2>
            <Link href={`/projects/${projectId}/newExpense`}>
            <PermissionButton  permissionsRequired={["create:projectExpense"]} startIcon={<span>+</span>}>Yeni Gider Ekle</PermissionButton>
          </Link>
        </div>
        )}
        {projectExpenses.length === 0 ? (
          <div className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz gider bulunmuyor</h3>
            <p className="mt-1 text-sm text-gray-500">
              Bu projeye gider eklemek için "Yeni Gider Ekle" butonunu kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ekleyen
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün Kodu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Açıklama
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Miktar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Birim
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eklenme Tarihi
                  </th>
                  {/* Add Actions header if project is not completed */}
                  {project && project.status !== "completed" && project.status !== "canceled" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projectExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expense.user
                          ? `${expense.user.name} ${expense.user.surname || ""}`
                          : "Belirtilmemiş"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.product_code || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                      <div className="text-sm text-gray-900" title={expense.product?.description}>
                        {expense.product?.description || expense.description || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.quantity || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{expense.product?.measurement_unit || "-"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {expense.created_at
                          ? format(new Date(expense.created_at), "d MMMM yyyy", { locale: tr })
                          : "-"}
                      </div>
                    </td>
                    {/* Add Edit button cell if project is not completed */}
                    {project && project.status !== "completed" && project.status !== "canceled" && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <PermissionButton 
                          permissionsRequired={["update:projectExpense"]} 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => handleOpenExpenseModal(expense.id)}
                        >
                          <Edit size={16} className="mr-1" /> Düzenle
                        </PermissionButton>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PermissionsCard>

      {/* Edit Expense Modal */}



     
      <Dialog open={isEditModalOpen} onOpenChange={(isOpen) => { if (!isOpen) closeEditModal(); else setIsEditModalOpen(true);}}>
       
        <DialogContent className="sm:max-w-[425px]">

        <div className="flex flex-col text-center">

          {error && 
          <div className="text-red-600">
        <h1 className="text-red-600">{error}</h1>
        </div>}
          {!error && <DialogHeader>
            {isPermissionRequired ? (
              <DialogTitle className="text-red-600">! Düzenleme için onay gerekiyor !</DialogTitle>
            ) : (
              <DialogTitle>Gider Miktarını Düzenle</DialogTitle>
            )}
            
            {selectedExpenseForEdit && (
              <DialogDescription>
                Ürün: {selectedExpenseForEdit.product?.description || selectedExpenseForEdit.product_code || 'Detay Yok'}
                <br/>
                Mevcut Miktar: {selectedExpenseForEdit.quantity || "0"} {selectedExpenseForEdit.product?.measurement_unit}
                <br/>
                Stoktaki Bakiye (Bu Gider Hariç): {selectedExpenseForEdit.product?.balance || "0"} {selectedExpenseForEdit.product?.measurement_unit}
              </DialogDescription>
            )}
          </DialogHeader>}
          </div>

          {!error && <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">

              <Label htmlFor="quantityInput" className="text-right col-span-1">
                Yeni Miktar ({selectedExpenseForEdit?.product?.measurement_unit || ''})
              </Label>
              <Input
                id="quantityInput"
                type="number"
                min={0}
                max={
                  selectedExpenseForEdit?.product?.balance && selectedExpenseForEdit?.quantity
                    ? parseFloat(selectedExpenseForEdit.product.balance) + parseFloat(selectedExpenseForEdit.quantity)
                    : undefined // Set to undefined if values are not available, or a sensible default like 0
                }
                value={editedQuantity}
                onChange={(e) => setEditedQuantity(e.target.value)}
                className="col-span-3"
                placeholder="Yeni miktar"
              />
            </div>
          </div>}
          <DialogFooter className="sm:justify-end">
            {!error &&<PermissionButton permissionsRequired={["delete:projectExpense"]} variant="danger" onClick={openDeleteConfirmation}>
              Gideri Sil
            </PermissionButton>}
            
            <div className="flex gap-2 justify-around">

           
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={closeEditModal}>
                  İptal
                </Button>
              </DialogClose>
              {!error && <Button type="button" onClick={handleSaveQuantity}> 
                {isPermissionRequired ? "İstek Gönder" : "Kaydet"}
              </Button>}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Gideri Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Bu gider projenizden kalıcı olarak silinecektir.
              {selectedExpenseForEdit && (
                <p className="mt-2">Silinecek Gider: {selectedExpenseForEdit.product?.description || selectedExpenseForEdit.product_code || 'Detay Yok'} ({selectedExpenseForEdit.quantity} {selectedExpenseForEdit.product?.measurement_unit})</p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
     
    </div>
  );
}
