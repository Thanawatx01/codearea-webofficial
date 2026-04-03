import { Icon } from "@/components/icons/Icon";
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
    onPageChangeAction: (page: number) => void;
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
                  className={`px-4 py-3 ${alignClass[header.align ?? "left"]} ${header.className ?? ""
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
                  className={`hover:bg-white/5 ${typeof rowClassName === "function"
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
        <div className="my-4 flex items-center justify-center gap-1 sm:gap-2.5">
          <button
            type="button"
            onClick={() => pagination.onPageChangeAction(1)}
            disabled={!canPrev}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="First Page"
          >
            <Icon name="chevrons-left" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              canPrev && pagination.onPageChangeAction(pagination.page - 1)
            }
            disabled={!canPrev}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous Page"
          >
            <Icon name="chevron-left" className="h-4 w-4" />
          </button>

          <div className="px-3 sm:px-6 py-1 mx-1 rounded-full bg-white/5 border border-white/5">
            <span className="text-xs sm:text-sm font-medium text-white/70 whitespace-nowrap">
              หน้า <span className="text-white">{pagination.page}</span> / {Math.max(pagination.totalPages, 1)}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              canNext && pagination.onPageChangeAction(pagination.page + 1)
            }
            disabled={!canNext}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next Page"
          >
            <Icon name="chevron-right" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() =>
              pagination.onPageChangeAction(Math.max(pagination.totalPages, 1))
            }
            disabled={!canNext}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
            title="Last Page"
          >
            <Icon name="chevrons-right" className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
