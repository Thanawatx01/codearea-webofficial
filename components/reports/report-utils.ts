export type ReportPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedPayload<T> = {
  data?: T[];
  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
    totalPages?: number;
  };
};

export function normalizePaginated<T>(raw: unknown): {
  rows: T[];
  pagination: ReportPagination;
} {
  if (Array.isArray(raw)) {
    return {
      rows: raw as T[],
      pagination: {
        page: 1,
        limit: raw.length || 20,
        total: raw.length,
        totalPages: 1,
      },
    };
  }

  const payload = (raw ?? {}) as PaginatedPayload<T>;
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const p = payload.pagination ?? {};
  return {
    rows,
    pagination: {
      page: p.page ?? 1,
      limit: p.limit ?? 20,
      total: p.total ?? rows.length,
      totalPages: p.total_pages ?? p.totalPages ?? 1,
    },
  };
}

export function toDateTimeRange(date: string, endOfDay: boolean): string {
  if (!date) return "";
  return `${date}${endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z"}`;
}

export function presetDateRange(preset: string): {
  startDate: string;
  endDate: string;
} {
  const now = new Date();
  if (preset === "last_week") {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return {
      startDate: d.toISOString().slice(0, 10),
      endDate: now.toISOString().slice(0, 10),
    };
  }
  if (preset === "last_month") {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return {
      startDate: d.toISOString().slice(0, 10),
      endDate: now.toISOString().slice(0, 10),
    };
  }
  return { startDate: "", endDate: "" };
}
