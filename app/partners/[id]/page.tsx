"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import Card from "@/components/ui/card/Card";
import PermissionButton from "@/components/ui/button/Button";
import Alert from "@/components/ui/feedback/Alert";
import Loading from "@/components/ui/feedback/Loading";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { withPermissions } from "@/hoc/withPermissions";

interface Partner {
  id: number;
  title: string;
  taxOffice?: string;
  taxNumber?: string;
  address?: string;
  countryCode?: string;
  phone?: string;
  email?: string;
  isSupplier: boolean;
  createdAt: string;
  updatedAt: string;
}

export default withPermissions(PartnerDetailPage, ['see:partner']);

function PartnerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetchPartner();
  }, [id]);

  const fetchPartner = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/customer-supplier/${id}`);
      setPartner(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Müşteri/tedarikçi bilgileri yüklenirken bir hata oluştu");
      console.error("Error fetching partner:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Bu müşteri/tedarikçiyi silmek istediğinize emin misiniz?")) {
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.delete(`/customer-supplier/${id}`);
      router.push("/partners");
    } catch (err: any) {
      setError(err.response?.data?.message || "Müşteri/tedarikçi silinirken bir hata oluştu");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !partner) {
    return (
      <Card>
        <Alert type="error" message={error} />
        <div className="mt-4">
          <PermissionButton variant="secondary" onClick={() => router.push("/partners")}>
            Müşteri/Tedarikçiler Sayfasına Dön
          </PermissionButton>
        </div>
      </Card>
    );
  }

  if (isEditMode && partner) {
    return (
      <Card title="Müşteri/Tedarikçi Düzenle">
        <PartnerForm 
          initialData={partner} 
          isEditing={true} 
          onSuccess={() => {
            setIsEditMode(false);
            fetchPartner();
          }} 
        />
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card
        title={`${partner?.title || 'Müşteri/Tedarikçi'} Detayları`}
        actions={
          <div className="flex space-x-2">
            <PermissionButton
              permissionsRequired={['update:partner']}
              variant="secondary"
              onClick={() => setIsEditMode(true)}
            >
              Düzenle
            </PermissionButton>
            <PermissionButton
              permissionsRequired={['delete:partner']}
              variant="danger"
              onClick={handleDelete}
            >
              Sil
            </PermissionButton>
          </div>
        }
      >
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        {partner && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Unvan</h3>
                <p className="mt-1 text-base text-gray-900">{partner.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vergi Dairesi</h3>
                <p className="mt-1 text-base text-gray-900">{partner.taxOffice || '-'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Vergi No / TC Kimlik No</h3>
                <p className="mt-1 text-base text-gray-900">{partner.taxNumber || '-'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Tip</h3>
                <p className="mt-1 text-base text-gray-900">{partner.isSupplier ? 'Tedarikçi' : 'Müşteri'}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Adres</h3>
                <p className="mt-1 text-base text-gray-900">{partner.address || '-'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Ülke</h3>
                <p className="mt-1 text-base text-gray-900">{partner.countryCode || 'TR'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Telefon</h3>
                <p className="mt-1 text-base text-gray-900">{partner.phone || '-'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">E-posta</h3>
                <p className="mt-1 text-base text-gray-900">{partner.email || '-'}</p>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</h3>
                  <p className="mt-1 text-base text-gray-900">{formatDate(partner.createdAt)}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Son Güncelleme</h3>
                  <p className="mt-1 text-base text-gray-900">{formatDate(partner.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-8">
          <PermissionButton variant="secondary" onClick={() => router.push("/partners")}>
            Müşteri/Tedarikçiler Listesine Dön
          </PermissionButton>
        </div>
      </Card>
    </div>
  );
}

interface PartnerFormProps {
  initialData: Partial<Partner>;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const partnerFormSchema = z.object({
  title: z.string().min(1, { message: "Unvan alanı zorunludur." }),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  countryCode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }).optional().or(z.literal("")),
  isSupplier: z.boolean(),
});

type PartnerFormValues = z.infer<typeof partnerFormSchema>;

function PartnerForm({ initialData, isEditing = false, onSuccess }: PartnerFormProps) {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<PartnerFormValues>({
    resolver: zodResolver(partnerFormSchema),
    defaultValues: {
      title: initialData.title || '',
      taxOffice: initialData.taxOffice || '',
      taxNumber: initialData.taxNumber || '',
      address: initialData.address || '',
      countryCode: initialData.countryCode || '',
      phone: initialData.phone || '',
      email: initialData.email || '',
      isSupplier: initialData.isSupplier || false,
    }
  });

  const onSubmit = async (values: PartnerFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        await axiosInstance.patch(`/customer-supplier/${id}`, values);
      } else {
        await axiosInstance.post('/customer-supplier', values);
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/partners");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Bir hata oluştu");
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert type="error" message={error} />}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unvan *</FormLabel>
              <FormControl>
                <Input placeholder="Unvan giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="taxOffice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi Dairesi</FormLabel>
                <FormControl>
                  <Input placeholder="Vergi dairesi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi No / TC Kimlik No</FormLabel>
                <FormControl>
                  <Input placeholder="Vergi no veya TC kimlik no" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Adres</FormLabel>
              <FormControl>
                <textarea
                  id="address"
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Adres bilgisi"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ülke Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="TR" maxLength={2} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefon</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="Telefon numarası" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-posta</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="E-posta adresi" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isSupplier"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-2">
              <FormControl>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={field.value}
                  onChange={field.onChange}
                  id="isSupplier"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Tedarikçi mi?</FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex gap-4 pt-2">
          <PermissionButton
            type="button"
            variant="secondary"
            onClick={() => router.push("/partners")}
          >
            İptal
          </PermissionButton>

          <PermissionButton type="submit" isLoading={loading}>
            {isEditing ? "Güncelle" : "Oluştur"}
          </PermissionButton>
        </div>
      </form>
    </Form>
  );
}
