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


export default function NewInvoiceDetailProductForm({ form }: { form: UseFormReturn<any> }){


    const isVatExempt = form.watch("isVatExempt")


    return(

        <div className="grid grid-cols-1 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                 <FormField
                            control={form.control}
                            name="product_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ürün Kodu</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="KMD-" {...field}   value={field.value || ""}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                    />

                <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Miktar
                                    </FormLabel>
                                    <FormControl>
                                        <Input type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Miktar girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                />

                <FormField
                            control={form.control}
                            name="unitPrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Birim Fiyat
                                    </FormLabel>
                                    <FormControl>
                                        <Input type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Birim fiyat girin" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                />
        
            </div>
            <div className="grid md:grid-cols-1 gap-6">

                <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ürün Açıklaması</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="Açıklama (Opsiyonel)" {...field}   value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                    />

        
            </div>
        </div>
    )
    
}


 

       