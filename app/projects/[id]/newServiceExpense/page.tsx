"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axiosInstance from '@/utils/axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
} from '@tanstack/react-table';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Alert from "@/components/ui/feedback/Alert"; // Assuming you have an Alert component
import { useAuth } from "@/hooks/useAuth";

interface ServiceProduct {
  stock_code: string;
  description: string;
  measurement_unit: string; // Will be set to ADET
  balance: number;
}

interface ProjectExpensePayload {
  creator_id: number;
  project_id: string;
  product_code: string;
  product_count: number; 

}

// Define User interface based on common structure
interface User {
  id: number;

}

const columnHelper = createColumnHelper<ServiceProduct>();

export default function NewServiceExpensePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [services, setServices] = useState<ServiceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth() as { user: User | null }; // Cast user type here
  
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalCount, setTotalCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState(''); // For description search

  const [selectedService, setSelectedService] = useState<ServiceProduct | null>(null);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const columns = useMemo(() => [
    columnHelper.accessor('stock_code', {
      header: 'Stok Kodu',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: 'Açıklama',
      cell: info => info.getValue(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'İşlem',
      cell: props => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedService(props.row.original)}
        >
          Seç
        </Button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: services,
    columns,
    state: {
      pagination,
      globalFilter,
    },
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualFiltering: true,
  });

  useEffect(() => {
    const fetchServices = async () => {
      if (!projectId) return;
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: String(pagination.pageIndex + 1),
          limit: String(pagination.pageSize),
          isServiceOnly: 'true',
          balanceGreaterThan: '1',

        });
        if (globalFilter) {
          queryParams.append('filter', globalFilter); // Search by description (and stock_code as per backend)
        }
        const response = await axiosInstance.get(`/stock?${queryParams.toString()}`);
        setServices(response.data.items);
        setTotalCount(response.data.meta.totalItems);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Servisler yüklenirken bir hata oluştu.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [projectId, pagination.pageIndex, pagination.pageSize, globalFilter]);

  const handleAddExpense = async () => {
    if (!selectedService || !projectId) return;
    setSubmittingExpense(true);
    setError(null);
    setSuccessMessage(null);

    const payload: ProjectExpensePayload = {
      creator_id : user!.id, // Add non-null assertion if user is guaranteed to be present
      project_id: projectId,
      product_code: selectedService.stock_code,
      product_count: selectedService.balance,

    };

    try {
      await axiosInstance.post("/project-expense", payload);
      setSuccessMessage(`${selectedService.description} başarıyla gider olarak eklendi.`);
      setSelectedService(null);
      // Optionally, redirect or refresh project expenses view
      // router.push(`/projects/${projectId}/expenses`); // Example redirect
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gider eklenirken bir hata oluştu.');
      console.error('Error adding expense:', err);
    } finally {
      setSubmittingExpense(false);
    }
  };

  if (!projectId) {
    return (
      <div className="container mx-auto p-4">
        <Alert type="error" message="Proje ID bulunamadı." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Projeye Servis Gideri Ekle (Proje: {projectId})</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <Alert type="error" message={error} className="mb-4" />}
          {successMessage && <Alert type="success" message={successMessage} className="mb-4" />}

          {!selectedService ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Servis Seçimi</h2>
                <Input
                  placeholder="Servis açıklamasına göre ara..."
                  value={globalFilter}
                  onChange={e => setGlobalFilter(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                          <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                              <TableHead key={header.id}>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows.length ? (
                          table.getRowModel().rows.map(row => (
                            <TableRow key={row.id}>
                              {row.getVisibleCells().map(cell => (
                                <TableCell key={cell.id}>
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              Filtreye uygun servis bulunamadı.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex items-center justify-between py-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                      Toplam {totalCount} servis bulundu.
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                      >
                        Önceki
                      </Button>
                      <span>
                        Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                      >
                        Sonraki
                      </Button>
                       <select
                        value={table.getState().pagination.pageSize}
                        onChange={e => {
                          table.setPageSize(Number(e.target.value));
                        }}
                         className="h-8 w-[70px] rounded-md border border-input bg-background px-2 text-sm"
                      >
                        {[10, 20, 30, 40, 50].map(pageSize => (
                          <option key={pageSize} value={pageSize}>
                            {pageSize}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            // Section to confirm and add the selected service as an expense
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Seçilen Servis Gideri</h3>
              <p><strong>Stok Kodu:</strong> {selectedService.stock_code}</p>
              <p><strong>Açıklama:</strong> {selectedService.description}</p>
              <p><strong>Miktar:</strong> {selectedService.balance}</p>
              <p><strong>Ölçü Birimi:</strong> {selectedService.measurement_unit}</p>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSelectedService(null)}
                  disabled={submittingExpense}
                >
                  Farklı Servis Seç
                </Button>
                <Button
                  onClick={handleAddExpense}
                  disabled={submittingExpense}
                >
                  {submittingExpense ? "Ekleniyor..." : "Gider Olarak Ekle"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
