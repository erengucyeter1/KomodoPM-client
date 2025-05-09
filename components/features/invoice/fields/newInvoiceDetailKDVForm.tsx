import { UseFormReturn } from "react-hook-form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"

export default function NewInvoiceDetailKDVForm({ form }: { form: UseFormReturn<any> }){


    const isVatExempt = form.watch("isVatExempt")


    useEffect(() => {
        const vatRate = form.getValues("vatRate")
        const quantity = form.getValues("quantity")
        const unitPrice = form.getValues("unitPrice")

        const vatAmount = (Number(vatRate) / 100) * Number(quantity) * Number(unitPrice)
        form.setValue("vatAmount", vatAmount.toFixed(2))
    }
    , [form.watch("vatRate"), form.watch("quantity"), form.watch("unitPrice")])


    return(

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">

         <FormField
            control={form.control}
            name="isVatExempt"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>K.D.V Muaf?</FormLabel>
                    <FormControl>
                        <Select
                            onValueChange={(val) => field.onChange(val === "true")}
                            value={field.value !== undefined ? String(field.value) : ""}
                            
                        >
                            <SelectTrigger >
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                            <SelectContent >
                                <SelectItem value="true">Evet</SelectItem>
                                <SelectItem value="false">Hayır</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
            />

            {isVatExempt ? null : (
            <FormField
                control={form.control}
                name="vatRate"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>K.D.V Oranı</FormLabel>
                        <FormControl>
                            <Input type = "number" step="any"  min = "0" max="100" className="max-w-[240px]" placeholder="Oran Giriniz" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
             )}


              {isVatExempt ? null : (
        <FormField
            control={form.control}
            name="vatAmount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Toplam K.D.V Tutarı</FormLabel>
                    <FormControl>
                        <Input readOnly = {true} type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Toplam Tutarı:" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />

        )}


        {!isVatExempt  ? null : (
            <FormField
            control={form.control}
            name="vatExemptionReason"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Vergi Muafiyet Nedeni</FormLabel>
                    <FormControl>
                        <Input className="max-w-[240px]"  placeholder="Açıklama" {...field} value={field.value || ""} />
                    </FormControl>
                </FormItem>
            )}
        />


        )}


       
       </div>
    )
    
}


 

       