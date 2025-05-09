import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"

export default function OptionalInfoPart({ form }: { form: UseFormReturn<any> }){
    return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="deduction_kdv_period"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Belgenin İndirime Konu Edildiği KDV Dönemi
                                    </FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="Opsiyonel" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="upload_kdv_period"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Belgenin Yüklenildiği KDV Dönemi
                                    </FormLabel>
                                    <FormControl>
                                        <Input className="max-w-[240px]" placeholder="Opsiyonel" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="expense_allocation_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Yüklenim Türü
                                    </FormLabel>
                                    <FormControl>
                                        <Input type = "number" step="any"  min = "0" className="max-w-[240px]" placeholder="Opsiyonel" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                       
                    </div>
    )
    
}