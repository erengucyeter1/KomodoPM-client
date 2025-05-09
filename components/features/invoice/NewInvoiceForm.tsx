"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"

import {InvoiceType, TransactionType, CurrencyType} from './enums'

import SimpleInfoPart from "./fields/invoiceSimpleInfo"
import InvoiceSecondaryInfoPart from "./fields/invoiceSecondaryInfo"
import OptionalInfoPart from "./fields/invoiceOptionals"
import InternationalInfo from "./fields/internationalnvoiceInfo"

const formSchema = z.object({
    invoiceNumber: z.string().min(1, {message: 'Fatura numarası boş olamaz.'}),
    partnerID : z.string().min(1, {message: 'Müşteri / tedarikçi kimlik numarası boş olamaz.'}),
    invoiceType: z.nativeEnum(InvoiceType, { message: "Fatura tipi seçilmelidir." }),
    isInternational: z.boolean(),
    transactionType: z.nativeEnum(TransactionType, { message: "İşlem tipi seçilmelidir." }),
    invoiceDate: z.date(),
    currency : z.nativeEnum(CurrencyType, { message: "Para birimi seçilmelidir." }),
    totalAmount: z.string().min(-1, {message: 'Toplam tutar boş olamaz.'}),
    vatRate: z.string().min(-1, {message: 'En az %0 olabilir.'}).max(100, {message: 'En fazla %100 olabilir.'}),
    vatAmount: z.string().min(-1, {message: 'Toplam tutar boş olamaz.'}),
    isVatExempt: z.boolean(),
    vatExemptionReason: z.string().optional(),

    // optionals

    deduction_kdv_period: z.string().optional(),
    upload_kdv_period: z.string().optional(),
    expense_allocation_id : z.string().optional(),

    // internationals

    customsDeclarationNumber: z.string().optional(),

    importCountryCode : z.string().optional(),
    exportCountryCode : z.string().optional(),

    
})

export function NewInvoiceForm() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "",
            partnerID: "",
            invoiceType: undefined,
            isInternational: undefined,
            transactionType: undefined,
            invoiceDate: new Date(),
            currency: undefined,
            totalAmount: "0.00",
            vatRate: "18",
        },
    })
    
    function onSubmit(values: z.infer<typeof formSchema>) {
        // Handle form submission here
        console.log(values)
    }

  

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex flex-col gap-4">
                    
                    <SimpleInfoPart form = {form}/>
                    <InvoiceSecondaryInfoPart form = {form}/>
                    <OptionalInfoPart form = {form}/>
                    <InternationalInfo form = {form}/>
                    


                </div>

                <Button type="submit">Gönder</Button>
            </form>
        </Form>
        </div>
    )
}