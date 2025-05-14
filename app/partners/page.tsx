"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import PermissionButton from "@/components/ui/button/Button";
import Card from "@/components/ui/card/Card";
import DataTable from "@/components/ui/table/DataTable";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { Input } from "@/components/ui/input";
import { withPermissions } from "@/hoc/withPermissions";

interface Partner {
  id: number;
  title: string;
  taxNumber?: string;
  isSupplier: boolean;
  countryCode?: string;
}

export default withPermissions(PartnersPage, ['see:partners']);

function PartnersPage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/customer-supplier");
      setPartners(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Müşteri/tedarikçiler yüklenirken bir hata oluştu");
      console.error("Error fetching partners:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      if (searchTerm.trim() === "") {
        fetchPartners();
        return;
      }
      
      const response = await axiosInstance.get(`/customer-supplier/search?term=${encodeURIComponent(searchTerm)}`);
      setPartners(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Arama sırasında bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "Unvan", key: "title" },
    { title: "Vergi No", key: "taxNumber", render: (partner: Partner) => partner.taxNumber || "-" },
    { 
      title: "Tip", 
      key: "type", 
      render: (partner: Partner) => partner.isSupplier ? "Tedarikçi" : "Müşteri" 
    },
    { 
      title: "Ülke", 
      key: "countryCode", 
      render: (partner: Partner) => partner.countryCode || "TR" 
    },
    {
      title: "İşlemler",
      key: "actions",
      className: "text-center",
      render: (partner: Partner) => (
        <div className="flex space-x-2 justify-center">
          <PermissionButton
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/partners/${partner.id}`)}
          >
            Detaylar
          </PermissionButton>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <Card 
        title="Müşteri ve Tedarikçiler" 
        actions={
          <PermissionButton 
            variant="primary" 
            onClick={() => router.push("/partners/new")}
          >
            Yeni Ekle
          </PermissionButton>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="flex items-center mb-4 gap-3">
          <Input
            id="search"
            placeholder="Unvan veya vergi no ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <PermissionButton 
            variant="secondary" 
            onClick={handleSearch} 
            className="flex-shrink-0 w-28 h-10 whitespace-nowrap"
          >
            Ara
          </PermissionButton>
        </div>
        
        {loading ? (
          <Loading />
        ) : (
          <DataTable
            data={partners}
            columns={columns}
            keyExtractor={(partner) => partner.id}
            emptyMessage="Kayıtlı müşteri/tedarikçi bulunamadı."
          />
        )}
      </Card>
    </div>
  );
}
