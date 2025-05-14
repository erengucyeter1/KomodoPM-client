"use client";
import { NewInvoiceDetailFormPage } from "@/components/features/invoice/fields/newInvoiceDetailFormPage";
import { useParams } from "next/navigation";
import { withPermissions } from '@/hoc/withPermissions';

export default withPermissions(InvoicePage, ['create:invoice']);

 function InvoicePage() {

  const params = useParams();
  const invoiceId = params.id as string;
  return (
    <div className="flex flex-col items-center space-y-6 p-6 w-full">
      <div className="text-center">      
      <h1 className="text-2xl font-bold"> {invoiceId} Numaralı Faturaya Detay Ekle</h1>
      </div>
      
      <div className="mt-6 w-full max-w-3xl">
        <NewInvoiceDetailFormPage invoiceInfo={invoiceId} />
      </div>
    </div>
  );
}