import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"

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
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="invoiceNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fatura Numarası</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="Fatura Numarası" {...field} />
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
                            name="partnerID"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Müşteri / Tedarikçi Numarası</FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]"  placeholder="Vergi veya Kimlik Numarası" {...field} />
                                    </FormControl>
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