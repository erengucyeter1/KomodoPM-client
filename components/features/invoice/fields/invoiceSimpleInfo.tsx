import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axiosInstance from "@/utils/axios"

import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

import {InvoiceType, GetTypeOptions} from '../enums'



export default function SimpleInfoPart({ form }: { form: UseFormReturn<any> }){
    const router = useRouter();
    const [partnerError, setPartnerError] = useState<string | null>(null);
    const [isValidatingPartner, setIsValidatingPartner] = useState(false);

    const validatePartnerTaxNumber = async (taxNumber: string) => {
        if (!taxNumber) return;
        
        setIsValidatingPartner(true);
        try {
            const response = await axiosInstance.get(`/customer-supplier/tax/${taxNumber}`);
            if (response.data && response.data.length > 0) {
                setPartnerError(null);
            } else {
                setPartnerError("Bu vergi numarasına sahip müşteri/tedarikçi bulunamadı");
            }
        } catch (error) {
            setPartnerError("Müşteri/tedarikçi doğrulanırken bir hata oluştu");
        } finally {
            setIsValidatingPartner(false);
        }
    };

    const handleCreatePartner = () => {
        router.push('/partners/new');
    };

    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="invoiceNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fatura Numarası</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="Fatura Numarası" {...field}  value={field.value || ""}/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                        control={form.control}
                        name="isInternational"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Uluslararası İşlem?</FormLabel>
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

                        

                        <FormField
                            control={form.control}
                            name="partnerTaxNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Müşteri / Tedarikçi Numarası</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input 
                                                className="max-w-[240px]"  
                                                placeholder="Vergi veya Kimlik Numarası" 
                                                {...field} 
                                                value={field.value || ""}
                                                onBlur={() => validatePartnerTaxNumber(field.value)}
                                            />
                                            {isValidatingPartner && (
                                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    {partnerError && (
                                        <div className="text-red-500 text-sm mt-1">
                                            {partnerError} 
                                            <button 
                                                type="button"
                                                onClick={handleCreatePartner}
                                                className="ml-1 text-blue-500 hover:underline"
                                            >
                                                Yeni ekle
                                            </button>
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="invoiceDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Fatura Tarihi</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-[240px] pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Tarih Seçin</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                        date > new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                    />
                                  </PopoverContent>
                                </Popover>
                              </FormItem>
                            )}
                        />


                       
                    </div>
    )
    
}