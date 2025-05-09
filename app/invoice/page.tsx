"use client";
import { NewInvoiceForm } from "@/components/features/invoice/NewInvoiceForm";

export default function InvoicePage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Fatura Oluştur</h1>
      <p className="text-gray-600">
        Aşağıdaki formu doldurarak yeni bir fatura oluşturabilirsiniz.
      </p>
      
      <div className="mt-6">
        <NewInvoiceForm />
      </div>
    </div>
  );
}