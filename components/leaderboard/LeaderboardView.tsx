"use client";

import { fetchLeaderboard, type LeaderboardRow } from "@/lib/leaderboardApi";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

function PodiumCard({
  row,
  place,
  barClass,
}: {
  row: LeaderboardRow;
  place: 1 | 2 | 3;
  barClass: string;
}) {
  const heights = {
    1: "min-h-[200px]",
    2: "min-h-[152px]",
    3: "min-h-[132px]",
  };
  const medals = {
    1: "🥇",
    2: "🥈",
    3: "🥉",
  };
  return (
    <div className="flex flex-1 flex-col items-center justify-end text-center">
      <div
        className={[
          "flex w-full max-w-[200px] flex-col items-center rounded-t-2xl border border-white/10 px-3 pb-4 pt-5 shadow-lg",
          barClass,
          heights[place],
        ].join(" ")}
      >
        <span className="text-2xl" aria-hidden>
          {medals[place]}
        </span>
        <p className="mt-2 line-clamp-2 text-sm font-bold text-white/95">
          {row.display_name || "—"}
        </p>
        <p className="mt-1 text-[11px] text-white/45">#{row.rank}</p>
        <div className="mt-3 w-full space-y-1 border-t border-white/10 pt-3 text-[11px]">
          <p className="font-mono text-violet-200/90">
            {row.total_point.toLocaleString("th-TH")} pts
          </p>
          <p className="text-white/50">ทำแล้ว {row.solved_count} ข้อ</p>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardView() {
  const [page, setPage] = useState(1);
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [podium, setPodium] = useState<LeaderboardRow[]>([]);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    total_pages: 1,
  });
  const [metaNote, setMetaNote] = useState("");

  const currentUserId = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}") as {
        id?: number;
      };
      return typeof u.id === "number" ? u.id : null;
    } catch {
      return null;
    }
  }, []);

  const load = useCallback(
    async (targetPage: number, signal?: { cancelled: boolean }) => {
      setLoading(true);
      setError("");
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        if (signal?.cancelled) return;
        setError("กรุณาเข้าสู่ระบบเพื่อดูกระดานผู้นำ");
        setLoading(false);
        return;
      }

      const out = await fetchLeaderboard(
        { page: targetPage, limit },
        { useToken: true },
      );

      if (signal?.cancelled) return;

      if (!out.ok) {
        setPodium([]);
        setRows([]);
        setError(out.error);
        setLoading(false);
        return;
      }

      setPodium(out.data.podium);
      setRows(out.data.table.data);
      setPagination(out.data.table.pagination);
      setMetaNote(
        `${out.data.meta.podium_ranks ?? "1–3"} · ${out.data.meta.table_ranks ?? "4–100"} · จำกัดสูงสุด ${out.data.meta.leaderboard_cap ?? 100} อันดับ`,
      );
      setLoading(false);
    },
    [limit],
  );

  useEffect(() => {
    const sig = { cancelled: false };
    void (async () => {
      await Promise.resolve();
      if (!sig.cancelled) await load(page, sig);
    })();
    return () => {
      sig.cancelled = true;
    };
  }, [page, load]);

  const p1 = podium.find((p) => p.rank === 1);
  const p2 = podium.find((p) => p.rank === 2);
  const p3 = podium.find((p) => p.rank === 3);

  return (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <p className="mx-auto mt-2 max-w-xl text-sm text-white/50">
          อันดับจากคะแนนรวมและจำนวนข้อที่ทำได้ — ต้องเข้าสู่ระบบ
        </p>
        {metaNote ? (
          <p className="mt-2 text-[11px] text-white/35">{metaNote}</p>
        ) : null}
      </div>

      {error ? (
        <div className="mb-8 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-5 py-4 text-center text-sm text-amber-100/95">
          <p>{error}</p>
          {typeof window !== "undefined" &&
          !window.localStorage.getItem("token") ? (
            <Link
              href="/login"
              className="mt-3 inline-block text-sm font-semibold text-violet-300 underline-offset-2 hover:text-violet-200"
            >
              ไปหน้าเข้าสู่ระบบ
            </Link>
          ) : null}
        </div>
      ) : null}

      {!loading && !error && podium.length === 0 && rows.length === 0 ? (
        <p className="text-center text-sm text-white/45">
          ยังไม่มีข้อมูลอันดับ
        </p>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {podium.length > 0 ? (
            <section className="mb-14">
              <h2 className="mb-6 text-center text-xs font-bold uppercase tracking-widest text-white/40">
                Top 3
              </h2>
              <div className="mx-auto flex max-w-3xl items-end justify-center gap-2 sm:gap-4 md:gap-6">
                {p2 ? (
                  <PodiumCard
                    row={p2}
                    place={2}
                    barClass="bg-linear-to-b from-slate-400/25 to-slate-600/15"
                  />
                ) : (
                  <div className="hidden flex-1 sm:block" />
                )}
                {p1 ? (
                  <PodiumCard
                    row={p1}
                    place={1}
                    barClass="bg-linear-to-b from-amber-400/30 to-amber-700/20 ring-1 ring-amber-400/35"
                  />
                ) : null}
                {p3 ? (
                  <PodiumCard
                    row={p3}
                    place={3}
                    barClass="bg-linear-to-b from-amber-700/20 to-amber-900/25"
                  />
                ) : (
                  <div className="hidden flex-1 sm:block" />
                )}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-white/40">
              อันดับ 4 ขึ้นไป
            </h2>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0c12]/80 shadow-xl backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04] text-[10px] font-bold uppercase tracking-wider text-white/45">
                      <th className="px-4 py-3">#</th>
                      <th className="px-4 py-3">ชื่อที่แสดง</th>
                      <th className="px-4 py-3 hidden sm:table-cell">อีเมล</th>
                      <th className="px-4 py-3 text-right">คะแนน</th>
                      <th className="px-4 py-3 text-right">ทำแล้ว</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const isMe =
                        currentUserId != null && r.user_id === currentUserId;
                      return (
                        <tr
                          key={`${r.rank}-${r.user_id}`}
                          className={[
                            "border-b border-white/[0.06] transition-colors",
                            isMe ? "bg-violet-500/15" : "hover:bg-white/[0.03]",
                          ].join(" ")}
                        >
                          <td className="px-4 py-3 font-mono text-white/70">
                            {r.rank}
                          </td>
                          <td className="px-4 py-3 font-medium text-white/90">
                            {r.display_name}
                            {isMe ? (
                              <span className="ml-2 text-[10px] font-normal text-violet-300/90">
                                (คุณ)
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-white/45 hidden sm:table-cell">
                            <span className="truncate font-mono text-xs">
                              {r.email}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-violet-200/90">
                            {r.total_point.toLocaleString("th-TH")}
                          </td>
                          <td className="px-4 py-3 text-right text-white/60">
                            {r.solved_count}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {rows.length === 0 && !loading ? (
                <p className="px-4 py-10 text-center text-sm text-white/40">
                  ไม่มีรายการในหน้านี้
                </p>
              ) : null}
            </div>

            {pagination.total_pages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || loading}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ก่อนหน้า
                </button>
                <span className="px-3 text-xs text-white/50">
                  หน้า {pagination.page} / {pagination.total_pages} (
                  {pagination.total} คน)
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.total_pages || loading}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.total_pages, p + 1))
                  }
                  className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ถัดไป
                </button>
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}
