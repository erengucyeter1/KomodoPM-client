"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import NewInvoiceDetailKDVForm from "@/components/features/invoice/fields/newInvoiceDetailKDVForm"
import NewInvoiceDetailProductForm from "@/components/features/invoice/fields/newInvoiceDetailProductForm"


const formSchema = z.object({

    //Product

    product_code: z.string().min(1, {message: 'Ürün kodu boş olamaz.'}),
    quantity: z.string().min(1, {message: 'Miktar boş olamaz.'}),
    unitPrice: z.string().min(1, {message: 'Birim fiyatı boş olamaz.'}),

    description: z.string().optional(),



    //VAT
    vatRate: z.string().min(-1, {message: 'En az %0 olabilir.'}).max(100, {message: 'En fazla %100 olabilir.'}),
    vatAmount: z.string().min(-1, {message: 'Toplam tutar boş olamaz.'}),
    isVatExempt: z.boolean(),
    vatExemptionReason: z.string().optional(),    
    

    
})

export function NewInvoiceDetailFormPage() {
  
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            vatRate: "18",
            vatAmount: "0.00",
            isVatExempt: false,
            vatExemptionReason: "",

                   
        },
    })
    
    function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    
    // Küçük bir gecikme ile resetleme
    setTimeout(() => {
        form.reset({
            vatRate: "18",
        vatAmount: "0.00",
        isVatExempt: false,
        vatExemptionReason: "",
        
        // Ürün alanları
        product_code: "",
        quantity: "",
        unitPrice: "",
        description: ""
        })
    }, 0)
}

  

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
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