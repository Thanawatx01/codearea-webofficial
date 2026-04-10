"use client";

import { buildDashboardSummaryCards } from "@/components/dashboard/buildSummaryCards";
import { DashboardCompletionChart } from "@/components/dashboard/DashboardCompletionChart";
import { DashboardErrorState } from "@/components/dashboard/DashboardErrorState";
import { DashboardLoadingState } from "@/components/dashboard/DashboardLoadingState";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardSummaryCards } from "@/components/dashboard/DashboardSummaryCards";
import { DashboardTopQuestions } from "@/components/dashboard/DashboardTopQuestions";
import type { DashboardPayload } from "@/components/dashboard/types";
import Header from "@/components/Header";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await api.get<DashboardPayload>("/dashboard", {
      useToken: true,
    });
    if (!res.ok || !res.data) {
      setError(res.error ?? "โหลดข้อมูลไม่สำเร็จ");
      setData(null);
      setLoading(false);
      return;
    }
    setData(res.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async dashboard fetch on mount
    void load();
  }, [load]);

  const pieRows = useMemo(() => {
    if (!data?.completion_comparison) return [];
    const { labels, values } = data.completion_comparison;
    return labels.map((name, i) => ({
      name,
      value: values[i] ?? 0,
    }));
  }, [data]);

  const summaryCards = useMemo(
    () => (data ? buildDashboardSummaryCards(data) : []),
    [data],
  );

  return (
    <>
      <Header
        title="แดชบอร์ด"
        icon={<Icon name="stats" className="h-5 w-5" />}
      />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 overflow-y-auto px-5 py-8 sm:px-8">
        {loading ? (
          <DashboardLoadingState />
        ) : error ? (
          <DashboardErrorState
            message={error}
            onRetry={() => void load()}
          />
        ) : data ? (
          <>
            <DashboardSummaryCards cards={summaryCards} />
            <section className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
              <DashboardCompletionChart
                pieRows={pieRows}
                successfulSubmissions={
                  data.completion_comparison.successful_submissions
                }
                unsuccessfulSubmissions={
                  data.completion_comparison.unsuccessful_submissions
                }
              />
              <DashboardTopQuestions questions={data.top_questions} />
            </section>
            <DashboardRecentActivity rows={data.recent_user_activity} />
          </>
        ) : null}
      </main>
    </>
  );
}
