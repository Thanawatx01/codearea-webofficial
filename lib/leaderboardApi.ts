import { api } from "@/lib/api";

export type LeaderboardRow = {
  rank: number;
  user_id: number;
  display_name: string;
  email: string;
  total_point: number;
  solved_count: number;
};

export type LeaderboardPagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type LeaderboardResponse = {
  podium: LeaderboardRow[];
  table: {
    data: LeaderboardRow[];
    pagination: LeaderboardPagination;
  };
  meta: {
    leaderboard_cap: number;
    podium_ranks: string;
    table_ranks: string;
  };
};

function parseRow(raw: unknown): LeaderboardRow | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const rank = typeof o.rank === "number" ? o.rank : Number(o.rank);
  const user_id = typeof o.user_id === "number" ? o.user_id : Number(o.user_id);
  if (!Number.isFinite(rank) || !Number.isFinite(user_id)) return null;
  const display_name =
    typeof o.display_name === "string" ? o.display_name : String(o.display_name ?? "");
  const email = typeof o.email === "string" ? o.email : String(o.email ?? "");
  const total_point =
    typeof o.total_point === "number"
      ? o.total_point
      : Number(o.total_point ?? 0);
  const solved_count =
    typeof o.solved_count === "number"
      ? o.solved_count
      : Number(o.solved_count ?? 0);
  return {
    rank,
    user_id,
    display_name,
    email,
    total_point: Number.isFinite(total_point) ? total_point : 0,
    solved_count: Number.isFinite(solved_count) ? solved_count : 0,
  };
}

function parseLeaderboardPayload(raw: unknown): LeaderboardResponse | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const root =
    "data" in o && o.data != null && typeof o.data === "object"
      ? (o.data as Record<string, unknown>)
      : o;

  const podiumRaw = root.podium;
  const podium = Array.isArray(podiumRaw)
    ? podiumRaw.map(parseRow).filter((x): x is LeaderboardRow => x != null)
    : [];

  const tableObj = root.table;
  if (!tableObj || typeof tableObj !== "object") return null;
  const t = tableObj as Record<string, unknown>;
  const dataRaw = t.data;
  const data = Array.isArray(dataRaw)
    ? dataRaw.map(parseRow).filter((x): x is LeaderboardRow => x != null)
    : [];

  const pagRaw = t.pagination;
  if (!pagRaw || typeof pagRaw !== "object") return null;
  const p = pagRaw as Record<string, unknown>;
  const page = typeof p.page === "number" ? p.page : Number(p.page);
  const limit = typeof p.limit === "number" ? p.limit : Number(p.limit);
  const total = typeof p.total === "number" ? p.total : Number(p.total);
  const total_pages =
    typeof p.total_pages === "number" ? p.total_pages : Number(p.total_pages);
  if (
    !Number.isFinite(page) ||
    !Number.isFinite(limit) ||
    !Number.isFinite(total) ||
    !Number.isFinite(total_pages)
  ) {
    return null;
  }

  const metaRaw = root.meta;
  const meta =
    metaRaw && typeof metaRaw === "object"
      ? (metaRaw as LeaderboardResponse["meta"])
      : {
          leaderboard_cap: 100,
          podium_ranks: "1–3",
          table_ranks: "4–100",
        };

  return {
    podium,
    table: {
      data,
      pagination: {
        page,
        limit,
        total,
        total_pages,
      },
    },
    meta,
  };
}

const MAX_TABLE_LIMIT = 97;

/**
 * GET /leaderboard — ต้อง Bearer
 * page default 1, limit default 20, สูงสุด 97 (ช่วงอันดับ 4–100)
 */
export async function fetchLeaderboard(
  params: { page?: number; limit?: number },
  options?: { useToken?: boolean },
): Promise<
  | { ok: true; data: LeaderboardResponse }
  | { ok: false; error: string }
> {
  const page = params.page ?? 1;
  const limit = Math.min(
    MAX_TABLE_LIMIT,
    Math.max(1, params.limit ?? 20),
  );

  const res = await api.get<unknown>("/leaderboard", {
    useToken: options?.useToken ?? true,
    params: { page, limit },
  });

  if (!res.ok) {
    const err =
      typeof res.data === "string" && res.data.trim()
        ? res.data.trim()
        : res.error ?? "โหลดกระดานผู้นำไม่สำเร็จ";
    return { ok: false, error: err };
  }

  const parsed = parseLeaderboardPayload(res.data);
  if (!parsed) {
    return {
      ok: false,
      error: "รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ตรงกับที่คาดไว้",
    };
  }

  return { ok: true, data: parsed };
}
