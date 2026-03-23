import type { ReactNode } from "react";

type TableAlign = "left" | "center" | "right";

const alignClass: Record<TableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export type DataTableHeader = {
  key: string;
  label: string;
  align?: TableAlign;
  className?: string;
};

export type DataTableColumn<T> = {
  key: string;
  className?: string;
  render: (row: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
  headers: DataTableHeader[];
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  tableClassName?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
};

export default function DataTable<T>({
  headers,
  columns,
  rows,
  rowKey,
  loading = false,
  errorMessage = "",
  emptyMessage = "ไม่พบข้อมูล",
  pagination,
  tableClassName = "w-full border-collapse",
  headerClassName = "",
  rowClassName = "",
}: DataTableProps<T>) {
  const canPrev = (pagination?.page ?? 1) > 1;
  const canNext = (pagination?.page ?? 1) < (pagination?.totalPages ?? 1);

  return (
    <div>
      <div className="w-full max-w-full overflow-x-auto rounded-xl border border-white/10">
        <table className={tableClassName}>
          <thead>
            <tr
              className={`bg-white/5 text-xs uppercase tracking-wide text-white/60 ${headerClassName}`}
            >
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={`px-4 py-3 ${alignClass[header.align ?? "left"]} ${
                    header.className ?? ""
                  }`}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-sm text-white">
            {loading ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-12 text-center text-white/60"
                >
                  กำลังโหลดข้อมูล...
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-12 text-center text-red-500"
                >
                  {errorMessage}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-12 text-center text-white/60"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowKey(row, rowIndex)}
                  className={`hover:bg-white/5 ${
                    typeof rowClassName === "function"
                      ? rowClassName(row, rowIndex)
                      : rowClassName
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 ${column.className ?? ""}`}
                    >
                      {column.render(row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => pagination.onPageChange(1)}
            disabled={!canPrev}
            className="h-8 rounded-full bg-white/10 px-3 text-sm text-white/80 disabled:opacity-50"
          >
            {"<<"}
          </button>
          <button
            type="button"
            onClick={() =>
              canPrev && pagination.onPageChange(pagination.page - 1)
            }
            disabled={!canPrev}
            className="h-8 rounded-full bg-white/10 px-3 text-sm text-white/80 disabled:opacity-50"
          >
            {"<"}
          </button>
          <span className="px-3 text-sm text-white/80">
            หน้า {pagination.page} / {Math.max(pagination.totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() =>
              canNext && pagination.onPageChange(pagination.page + 1)
            }
            disabled={!canNext}
            className="h-8 rounded-full bg-white/10 px-3 text-sm text-white/80 disabled:opacity-50"
          >
            {">"}
          </button>
          <button
            type="button"
            onClick={() =>
              pagination.onPageChange(Math.max(pagination.totalPages, 1))
            }
            disabled={!canNext}
            className="h-8 rounded-full bg-white/10 px-3 text-sm text-white/80 disabled:opacity-50"
          >
            {">>"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
