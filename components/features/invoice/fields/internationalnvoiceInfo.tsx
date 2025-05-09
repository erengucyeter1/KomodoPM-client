import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { TransactionType } from '../enums';

export default function InternationalInfo({ form }: { form: UseFormReturn<any> }) {
    const isInternational = form.watch("isInternational");
    const transactionType = form.watch("transactionType");

    // Bileşen hiçbir şey döndürmemeli eğer uluslararası değilse
    if (!isInternational) {
        return null;
    }

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <FormField
                control={form.control}
                name="customsDeclarationNumber"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>GGB Tescil No'su</FormLabel>
                        <FormControl>
                            <Input 
                                className="max-w-[240px]" 
                                placeholder="Tescil No" 
                                {...field} 
                                value={field.value || ""} // Burada undefined yerine boş string kullan
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {transactionType === TransactionType.Ithalat || transactionType === "Ithalat" ? (
                <FormField
                    control={form.control}
                    name="importCountryCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İthal Edildiği Ülke Kodu</FormLabel>
                            <FormControl>
                                <Input 
                                    className="max-w-[240px]" 
                                    placeholder="Ülke Kodu" 
                                    max={2}

                                    {...field} 
                                    value={field.value || ""}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            ) : (
                <FormField
                    control={form.control}
                    name="exportCountryCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İhraç Edildiği Ülke Kodu</FormLabel>
                            <FormControl>
                                <Input 
                                    className="max-w-[240px]" 
                                    placeholder="Ülke Kodu" 
                                    max={2}
                                    {...field} 
                                    value={field.value || ""} // Burada undefined yerine boş string kullan
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}