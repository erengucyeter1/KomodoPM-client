import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";

import {InvoiceType, TransactionType, GetTypeOptions, CurrencyType} from '../enums'
import { Input } from "@/components/ui/input";
import { is } from "date-fns/locale";


export default function InvoiceSecondaryInfoPart({ form }: { form: UseFormReturn<any> }) {

      const isInternational = form.watch("isInternational")
  
      const filteredOptions = GetTypeOptions(
          TransactionType,
          [TransactionType.YurtIci],
          isInternational !== true 
      )

    return (<div className="grid md:grid-cols-2 gap-6">   
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


        
    </div>)
}