"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; 
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Alert from "@/components/ui/feedback/Alert";

const formSchema = z.object({
  title: z.string().min(1, { message: "Unvan alanı zorunludur." }),
  taxOffice: z.string().optional(),
  taxNumber: z.string().optional(),
  address: z.string().optional(),
  countryCode: z.string().max(2, {message: "Ülke kodu en fazla 2 karakter olabilir."}).optional().or(z.literal("")),
  phone: z.string().optional(),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }).optional().or(z.literal("")),
  isSupplier: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewPartnerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      taxOffice: "",
      taxNumber: "",
      address: "",
      countryCode: "",
      phone: "",
      email: "",
      isSupplier: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post("/customer-supplier", values);
      router.push(`/partners/${response.data.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Müşteri/tedarikçi oluşturulurken bir hata oluştu"
      );
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Yeni Müşteri / Tedarikçi Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert type="error" message={error} className="mb-4" />}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unvan *</FormLabel>
                    <FormControl>
                      <Input placeholder="Örn: Komodo Treyler Sanayi ve Ticaret Ltd. Şti." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="taxOffice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vergi Dairesi</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: Selçuklu" {...field} />
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
                        <Input placeholder="Örn: 1234567890" {...field} />
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
                      <Input
                        placeholder="Örn: BÜYÜKKAYACIKOSB MH. SELÇUKLU - KONYA"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="countryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ülke Kodu</FormLabel>
                      <FormControl>
                        <Input placeholder="Örn: TR" {...field} />
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
                        <Input type="tel" placeholder="Örn: 05551234567" {...field} />
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
                        <Input type="email" placeholder="Örn: info@example.com" {...field} />
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
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        id="isSupplier"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="isSupplier">
                        Bu bir tedarikçi mi?
                      </FormLabel>
                      <FormDescription>
                        Eğer işaretliyse, bu kayıt tedarikçi olarak kabul edilir.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/partners")}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
