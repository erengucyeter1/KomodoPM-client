"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../utils/axios';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  RowData,
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
import Papa from 'papaparse';
import { withPermissions } from "@/hoc/withPermissions";
import PermissionsCard from "@/components/ui/card/Card";

declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

interface StockItem {
  id?: number;
  stock_code: string;
  measurement_unit: string;
  description: string;
  balance?: number;
}

interface CsvStockItem {
  stockCode: string;
  description: string;
  mesurementUnit: string;
}

export default withPermissions(StockPage, ["see:stock"]);

function StockPage() {

  const [data, setData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQr, setGeneratingQr] = useState(false);
 
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [stockCode, setStockCode] = useState('');
  const [measurementUnit, setMeasurementUnit] = useState('ADET');
  const [description, setDescription] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const columnHelper = createColumnHelper<StockItem>();
  const columns: ColumnDef<StockItem, any>[] = [
    columnHelper.accessor('stock_code', {
      header: 'Stok Kodu',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('measurement_unit', {
      header: 'Ölçüm Birimi',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('description', {
      header: 'Açıklama',
      cell: info => info.getValue(),
      footer: props => props.column.id,
    }),
    columnHelper.accessor('balance', {
      header: 'Bakiye',
      cell: info => info.getValue() || 0,
      footer: props => props.column.id,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'İşlemler',
      cell: props => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateQrCode(props.row.original.stock_code, props.row.original.measurement_unit)}
          disabled={generatingQr}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 3a1 1 0 00-1 1v3a1 1 0 001 1h3a1 1 0 001-1V4a1 1 0 00-1-1h-3zm1 2v1h1V5h-1z" clipRule="evenodd" />
            <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1zM16 9a1 1 0 100 2 1 1 0 000-2zM9 13a1 1 0 011-1h1a1 1 0 110 2v2a1 1 0 11-2 0v-3zM7 11a1 1 0 100-2H4a1 1 0 100 2h3zM17 13a1 1 0 01-1 1h-2a1 1 0 110-2h2a1 1 0 011 1zM16 17a1 1 0 100-2h-3a1 1 0 100 2h3z" />
          </svg>
          QR Kod
        </Button>
      ),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const fetchStocks = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(pagination.pageIndex + 1));
      params.append('limit', String(pagination.pageSize));
      if (sorting.length > 0) {
        params.append('sortBy', sorting[0].id);
        params.append('sortOrder', sorting[0].desc ? 'DESC' : 'ASC');
      }
      if (globalFilter) {
        params.append('filter', globalFilter);
      }
      params.append("isServiceOnly", "false");
      params.append("balanceGreaterThan", "0");
      const response = await axios.get<{items: StockItem[], meta: {totalItems: number}}>(`/stock?${params.toString()}`);
      setData(response.data.items);
      setTotalCount(response.data.meta.totalItems);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching stocks:', err);
      setError('Stok öğeleri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const generateQrCode = async (stockCode: string, mesurementUnit: string) => {
    try {
      setGeneratingQr(true);
      const response = await axios.post('/qrcode', 
        { code: stockCode,
          mesurement: mesurementUnit
         }, 
        { 
          responseType: 'blob',
          headers: {
            'Accept': 'image/png'
          }
        }
      );
      const blob = new Blob([response.data], { type: 'image/png' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `qrcode-${stockCode}.png`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setGeneratingQr(false);
      setSuccessMessage('QR kod başarıyla indirildi!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error generating QR code:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'QR kod oluşturulurken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
      setGeneratingQr(false);
    }
  };

    
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post('/stock', {
        stockCode,
        mesurementUnit: measurementUnit,
        description,
      });
      setStockCode('');
      setMeasurementUnit('ADET');
      setDescription('');
      setSuccessMessage('Stok öğesi başarıyla eklendi!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchStocks();

    } catch (err: any) {
      console.error('Error creating stock item:', err);
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'Stok öğesi eklenirken bir hata oluştu.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Lütfen sadece CSV dosyası yükleyin!');
      setTimeout(() => setError(null), 3000);
      return;
    }
  
    setUploadingCsv(true);
    setUploadProgress(10);
    
    Papa.parse<string[]>(file, {
      delimiter: ";",
      header: false,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          setUploadProgress(30);
          
          const dataRows: string[][] = results.data.length > 0 && 
            Array.isArray(results.data[0]) && results.data[0][0] === 'STKKOD' ?
            results.data.slice(1) : results.data;
          
          const stockItems: CsvStockItem[] = dataRows
            .filter(row => Array.isArray(row) && row.length >= 3 && row.every(cell => typeof cell === 'string'))
            .map(row => {
              return {
                stockCode: row[0]?.trim() || '', 
                description: row[1]?.trim() || '',
                mesurementUnit: row[2]?.trim() || '' 
              };
            })
            .filter(item => item.stockCode && item.description && item.mesurementUnit);
          
          setUploadProgress(50);
          
          if (stockItems.length === 0) {
            setError('CSV dosyasında geçerli veri bulunamadı!');
            setUploadingCsv(false);
            return;
          }
  
          console.log('Gönderilecek veriler:', stockItems);
  
          const response = await axios.post<{length: number}>('/stock/bulk', stockItems);
          
          setUploadProgress(100);
          setSuccessMessage(`${response.data.length} adet stok başarıyla eklendi!`);
          setTimeout(() => setSuccessMessage(''), 3000);
          
          fetchStocks();
          
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error: any) { 
          console.error('CSV yükleme hatası:', error);
          const message = error instanceof Error ? error.message : String(error);
          setError(`Stok ekleme sırasında bir hata oluştu: ${message}`);
          setTimeout(() => setError(null), 3000);
        } finally {
          setUploadingCsv(false);
        }
      },
      error: (error: Error) => {
        console.error('CSV okuma hatası:', error);
        setError(`CSV okuma hatası: ${error.message}`);
        setTimeout(() => setError(null), 3000);
        setUploadingCsv(false);
      }
    });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Stok Yönetimi</h1>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <PermissionsCard permissionsRequired={["create:stock"]}  >
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 className="text-xl font-semibold mb-4">Yeni Stok Öğesi Ekle</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="stockCode">
                Stok Kodu
              </label>
              <input
                id="stockCode"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={stockCode}
                onChange={(e) => setStockCode(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="measurementUnit">
                Ölçüm Birimi
              </label>
              <select
                id="measurementUnit"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                required
              >
                {['ADET', 'KİLO', 'METRE', 'SET', 'METREKÜP', 'TAKIM', 'TON', 'PAKET'].map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Açıklama
              </label>
              <input
                id="description"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                CSV İle Toplu Yükleme
              </label>
              <div className="flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-file"
                  onChange={handleCsvUpload}
                  disabled={uploadingCsv}
                />
                <label 
                  htmlFor="csv-file"
                  className={`cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center ${uploadingCsv ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M13 10v6H7v-6H2l8-8 8 8h-5zM0 18h20v2H0v-2z"/>
                  </svg>
                  <span>CSV Dosyası Seç</span>
                </label>
                <span className="ml-3 text-sm text-gray-600">
                  Format: STKKOD;STKCINSI;STKBIRIM
                </span>
              </div>
              {uploadingCsv && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Ekle
            </button>
          </div>
        </form>
      </div>
      </PermissionsCard>
      
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Stok Listesi</h2>
          <div className="flex items-center">
            <Input
              placeholder="Ara..."
              value={globalFilter || ''}
              onChange={e => setGlobalFilter(String(e.target.value))}
              className="max-w-sm"
            />
          </div>
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
                          <div
                            className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map(row => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
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
                        Sonuç bulunamadı.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                Toplam {totalCount} kayıt
              </div>
              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Sayfa başına</p>
                  <select
                    value={pagination.pageSize}
                    onChange={e => {
                      table.setPageSize(Number(e.target.value));
                    }}
                    className="h-8 w-[70px] rounded-md border border-input bg-background px-2"
                  >
                    {[10, 25, 50, 100].map(pageSize => (
                      <option key={pageSize} value={pageSize}>
                        {pageSize}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                  Sayfa {pagination.pageIndex + 1} / {table.getPageCount()}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.firstPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    {'<<'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    {'<'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    {'>'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.lastPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    {'>>'}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

