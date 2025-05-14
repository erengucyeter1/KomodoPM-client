"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
} from "@/components/ui/form"
import NewInvoiceDetailKDVForm from "@/components/features/invoice/fields/newInvoiceDetailKDVForm"
import NewInvoiceDetailProductForm from "@/components/features/invoice/fields/newInvoiceDetailProductForm"
import axiosInstance from "@/utils/axios"
import { useState } from "react"

const formSchema = z.object({

    //Product
    invoiceNumber: z.string().min(1, {message: 'Fatura numarası boş olamaz.'}),
    product_code: z.string().min(1, {message: 'Ürün kodu boş olamaz.'}),
    quantity: z.string().min(1, {message: 'Miktar boş olamaz.'}),
    unitPrice: z.string().min(1, {message: 'Birim fiyatı boş olamaz.'}),

    description: z.string().optional(),
    isService: z.boolean(),



    //VAT
    vatRate: z.string().min(-1, {message: 'En az %0 olabilir.'}).max(100, {message: 'En fazla %100 olabilir.'}),
    vatAmount: z.string().min(-1, {message: 'Toplam tutar boş olamaz.'}),
    isVatExempt: z.boolean(),
    vatExemptionReason: z.string().optional(),    


    

    
})

export function NewInvoiceDetailFormPage({ invoiceInfo }: { invoiceInfo: string }) {

        const [errMsg, setErrMsg] = useState<string | null>(null);
        const [successMsg, setSuccessMsg] = useState<string | null>(null);

  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: invoiceInfo, // invoiceInfo prop'unu doğrudan kullanın
            // Ürün alanları için başlangıç değerleri eklendi
            product_code: "",
            quantity: "",
            unitPrice: "",
            description: "",
            // KDV alanları
            vatRate: "20",
            vatAmount: "0.00",
            isVatExempt: false,
            vatExemptionReason: "",
            isService: false,   

                   
        },
    })


    
    
    function onSubmit(values: z.infer<typeof formSchema>) {

        

        axiosInstance.post("/invoice-detail", values)
            .then(response => {
                console.log("Invoice created successfully:", response.data);
                // Clear any previous error messages
                setErrMsg(null);
                console.log(response);
                setSuccessMsg(response?.data?.id + " Numaralı Fatura Detayı Başarıyla Kaydedildi!" );
                
                // Formu sıfırlarken tüm alanları ve invoiceNumber'ı orijinal değeriyle ayarla
                // setTimeout, UI güncellemelerinin (başarı mesajı gibi) ardından reset'in çalışmasını sağlar
                setTimeout(() => {
                    form.reset({
                        invoiceNumber: invoiceInfo, // Fatura numarasını koru
                        product_code: "",
                        quantity: "",
                        unitPrice: "",
                        description: "",
                        vatRate: "20",
                        vatAmount: "0.00",
                        isVatExempt: false,
                        vatExemptionReason: "",
                        isService: false,
                    });
                }, 0);
            })
            .catch(error => {
                setErrMsg(error.response?.data?.message || "Bir hata oluştu.");
                setSuccessMsg(null);
            });
}

  

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">


        {errMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <span className="block sm:inline">{errMsg}</span>
                <button
                    type="button"
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setErrMsg(null)}
                >
                    <span className="text-2xl">&times;</span>
                </button>
            </div>
        )}

        {successMsg && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded relative" role="alert">
                <span className="block sm:inline">{successMsg}</span>
                <button
                    type="button"
                    className="absolute top-0 bottom-0 right-0 px-4 py-3"
                    onClick={() => setErrMsg(null)}
                >
                    <span className="text-2xl">&times;</span>
                </button>
            </div>
        )}

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col gap-4">
                    
                    <NewInvoiceDetailKDVForm form = {form}/>
                    <NewInvoiceDetailProductForm form = {form}/>
                    
                

                </div>

                <Button type="submit">Ekle</Button>
            </form>
        </Form>
        </div>
    )
}