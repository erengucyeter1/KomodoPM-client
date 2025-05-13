"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"

import {InvoiceType, TransactionType, CurrencyType} from './enums'

import SimpleInfoPart from "./fields/invoiceSimpleInfo"
import InvoiceSecondaryInfoPart from "./fields/invoiceSecondaryInfo"
import OptionalInfoPart from "./fields/invoiceOptionals"
import InternationalInfo from "./fields/internationalnvoiceInfo"
import axiosInstance from "@/utils/axios"
import { useState } from "react"


const formSchema = z.object({
    invoiceNumber: z.string().min(1, {message: 'Fatura numarası boş olamaz.'}),
    partnerTaxNumber : z.string().min(1, {message: 'Müşteri / tedarikçi kimlik numarası boş olamaz.'}),
    invoiceType: z.nativeEnum(InvoiceType, { message: "Fatura tipi seçilmelidir." }),
    isInternational: z.boolean(),
    transactionType: z.nativeEnum(TransactionType).optional(),
    invoiceDate: z.date(),
    currency : z.nativeEnum(CurrencyType, { message: "Para birimi seçilmelidir." }),
    totalAmount: z.string().min(-1, {message: 'Toplam tutar boş olamaz.'}),
    // optionals
    deduction_kdv_period: z.string().optional(),
    upload_kdv_period: z.string().optional(),
    expense_allocation_id : z.string().optional(),

    // internationals

    customsDeclarationNumber: z.string().optional(),
    importCountryCode : z.string().max(2, {message : "Ülke kodunu en falza 2 harf olmak üzere ISO 3166 kurallarına uygun giriniz."}).optional(),
    exportCountryCode : z.string().optional(),

    
}).refine(
    (data) => data.invoiceType || data.transactionType,
    {
        message: "Fatura tipi veya işlem tipi alanlarından en az biri seçilmelidir.",
        path: ["invoiceType"], // veya ["transactionType"], ya da ikisini de göstermek için []
    }
);

export function NewInvoiceForm() {
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "",
            partnerTaxNumber: "",
            invoiceType: undefined,
            isInternational: false,
            transactionType: undefined,
            invoiceDate: new Date(),
            currency: undefined,
            totalAmount: "0.00",
        },
    })

    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        setErrMsg(null);

        try {
            // First check if partner exists
            const partnerResponse = await axiosInstance.get(`/customer-supplier/tax/${values.partnerTaxNumber}`);
            
            if (!partnerResponse.data || partnerResponse.data.length === 0) {
                setErrMsg("Geçerli bir müşteri/tedarikçi vergi numarası gereklidir. Önce müşteri/tedarikçi eklemelisiniz.");
                setIsSubmitting(false);
                return;
            }

            // If partner exists, submit the form
            const response = await axiosInstance.post("/invoice", values);
            console.log("Invoice created successfully:", response.data);
            
            const invoiceNumber = form.getValues("invoiceNumber");
            window.location.href = `/invoice/new/${invoiceNumber}`;
        } catch (error: any) {
            if (error.response?.status === 404 && error.response?.data?.message?.includes('müşteri/tedarikçi')) {
                setErrMsg("Bu vergi numarasına sahip müşteri/tedarikçi bulunamadı. Lütfen önce yeni müşteri/tedarikçi ekleyin.");
                
                // Wait a moment before redirecting to the new partner page
                setTimeout(() => {
                    router.push('/partners/new');
                }, 3000);
            } else {
                setErrMsg(error.response?.data?.message || "Fatura oluşturulurken bir hata oluştu.");
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleCreatePartner = () => {
        router.push('/partners/new');
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        
        {errMsg && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded relative" role="alert">
                <span className="block sm:inline">{errMsg}</span>
                {errMsg.includes('müşteri/tedarikçi') && (
                    <button 
                        type="button" 
                        className="ml-2 text-blue-600 hover:underline font-medium"
                        onClick={handleCreatePartner}
                    >
                        Yeni Müşteri/Tedarikçi Ekle
                    </button>
                )}
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
                    <SimpleInfoPart form={form}/>
                    <InvoiceSecondaryInfoPart form={form}/>
                    <OptionalInfoPart form={form}/>
                    <InternationalInfo form={form}/>
                </div>

                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Gönderiliyor..." : "Gönder"}
                </Button>
            </form>
        </Form>
        </div>
    )
}