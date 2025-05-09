import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

import {InvoiceType, TransactionType, GetTypeOptions, CurrencyType} from '../enums'
import { Input } from "@/components/ui/input";
import { is } from "date-fns/locale";


export default function InvoiceSecondaryInfoPart({ form }: { form: UseFormReturn<any> }) {

      const isInternational = form.watch("isInternational")

      const isVatExempt = form.watch("isVatExempt")
  
      const filteredOptions = GetTypeOptions(
          TransactionType,
          [TransactionType.YurtIci],
          isInternational !== true 
      )

    return (<div className="grid md:grid-cols-3 gap-6">   
        {isInternational ? (
            <FormField
                control={form.control}
                name="transactionType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>İşlem Tipi</FormLabel>
                        <FormControl>
                            <Select 
                                onValueChange={field.onChange} 
                                value={field.value || ""}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredOptions.map((option) => (
                                        <SelectItem key={option.label} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
        ) : (
            <FormField
                control={form.control}
                name="invoiceType"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Fatura Tipi</FormLabel>
                        <Select 
                            onValueChange={field.onChange} 
                            value={field.value || ""}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Seçiniz" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {GetTypeOptions(InvoiceType).map((option) => (
                                    <SelectItem key={option.label} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                )}
            />
        )}


        <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Para Birimi</FormLabel>
                    <Select 
                        onValueChange={field.onChange} 
                        value={field.value || ""}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Seçiniz" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {GetTypeOptions(CurrencyType).map((option) => (
                                <SelectItem key={option.label} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                </FormItem>
            )}
        />


        <FormField
            control={form.control}
            name="totalAmount"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Toplam Tutar</FormLabel>
                    <FormControl>
                        <Input type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Toplam Tutarı Giriniz" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />



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
                        <Input type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Toplam Tutarı Giriniz" {...field} />
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
       

        

           

       

        

        
    </div>)
}