"use client";
import { NewInvoiceForm } from "@/components/features/invoice/NewInvoiceForm";
import { withPermissions } from '@/hoc/withPermissions';

export default withPermissions(InvoicePage, ['create:invoice']);

function InvoicePage() {
  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full h-full">
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
