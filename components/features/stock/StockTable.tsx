import { useState, useEffect, useCallback } from 'react';
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

interface StockItem {
  stock_code: string;
  measurement_unit: string;
  description: string;
  balance: number;
}

interface StockTableProps {
  data: StockItem[];
  loading: boolean;
  totalCount: number;
  onFetchData: (page: number, limit: number, sortField: string | null, sortOrder: boolean | null, filter: string) => void;
  onGenerateQrCode: (stockCode: string, measurementUnit: string) => void;
}

const StockTable: React.FC<StockTableProps> = ({ 
  data, 
  loading, 
  totalCount, 
  onFetchData, 
  onGenerateQrCode 
}) => {
  const [generatingQr, setGeneratingQr] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState([]);
  
  // columnHelper'ı StockItem tipine göre oluştur
  const columnHelper = createColumnHelper<StockItem>();
  
  // Kolonlar tanımı
  const columns = [
    columnHelper.accessor('stock_code', {
      header: 'Stok Kodu',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('measurement_unit', {
      header: 'Ölçüm Birimi',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: 'Açıklama',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('balance', {
      header: 'Bakiye',
      cell: info => info.getValue() || 0,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'İşlemler',
      cell: props => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleGenerateQr(props.row.original.stock_code, props.row.original.measurement_unit)}
          disabled={generatingQr}
          className="flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5z" clipRule="evenodd" />
            <path d="M11 4a1 1 0 10-2 0v1a1 1 0 002 0V4zM10 7a1 1 0 011 1v1h2a1 1 0 110 2h-3a1 1 0 01-1-1V8a1 1 0 011-1z" />
          </svg>
          QR Kod
        </Button>
      ),
    }),
  ];

  const handleGenerateQr = async (stockCode, measurementUnit) => {
    setGeneratingQr(true);
    try {
      await onGenerateQrCode(stockCode, measurementUnit);
    } finally {
      setGeneratingQr(false);
    }
  };

  // fetchData fonksiyonunu useCallback ile oluştur - re-render'ları önlemek için
  const fetchData = useCallback(() => {
    onFetchData(
      pagination.pageIndex,
      pagination.pageSize, 
      sorting.length > 0 ? sorting[0].id : null,
      sorting.length > 0 ? sorting[0].desc : null,
      globalFilter
    );
  }, [pagination.pageIndex, pagination.pageSize, sorting, globalFilter, onFetchData]);

  // Tablo yapılandırması
  const table = useReactTable({
    data: data || [], // Veri yoksa boş dizi kullan
    columns,
    state: {
      pagination,
      sorting,
      globalFilter,
      columnFilters,
    },
    pageCount: Math.ceil(totalCount / pagination.pageSize) || 1, // En az 1 sayfa
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

  // Bağımlılıklar değiştiğinde veri yükleme
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Tabloyu render et
  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <Input
          placeholder="Ara..."
          value={globalFilter || ''}
          onChange={e => setGlobalFilter(String(e.target.value))}
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
                      {loading ? 'Yükleniyor...' : 'Sonuç bulunamadı.'}
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
                Sayfa {pagination.pageIndex + 1} / {table.getPageCount() || 1}
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
  );
};

export default StockTable;