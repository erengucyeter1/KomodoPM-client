import React from "react";
import Loading from "../feedback/Loading";

interface Column<T> {
  title: string;
  key: keyof T | string;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "Veri bulunamadı"
}: DataTableProps<T>) {
  if (isLoading) {
    return <Loading text="Veriler yükleniyor..." />;
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead className="bg-gray-100">
          <tr>
            {columns.map((column, index) => (
              <th
                key={`col-${index}`}
                className={`py-3 px-4 text-left ${column.className || ""}`}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-t hover:bg-gray-50">
              {columns.map((column, colIndex) => (
                <td
                  key={`cell-${keyExtractor(item)}-${colIndex}`}
                  className={`py-3 px-4 ${column.className || ""}`}
                >
                  {column.render
                    ? column.render(item)
                    : item[column.key as keyof T] as React.ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}