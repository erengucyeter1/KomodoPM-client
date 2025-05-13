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
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect } from "react"
import { v4 as uuidv4 } from 'uuid';


export default function NewInvoiceDetailProductForm({ form }: { form: UseFormReturn<any> }){


    const isVatExempt = form.watch("isVatExempt")


    const isService = form.watch("isService")

    useEffect(() => {
        if (isService) {
            const uuid = uuidv4();
          form.setValue("product_code", uuid);
        } else {
          form.setValue("product_code", "");
        }
      }, [isService, form]);


    return(

        <div className="grid grid-cols-1 space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
                 <div className="flex flex-row gap-6">
                  <div>
                 <FormField
                            control={form.control}
                            name="product_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Ürün Kodu</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" disabled={isService} placeholder="KMD-" {...field}   value={field.value || ""}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                    />
                 </div>

                    <FormField
                            control={form.control}
                            name="isService"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hizmet</FormLabel>
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />

                                    </FormControl>
                                    </FormItem>
                            )}
                    />
                                    
                    
                 </div>

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


 

       