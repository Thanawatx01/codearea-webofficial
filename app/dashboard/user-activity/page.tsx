"use client";

import Header from "@/components/Header";
import type { DataTableColumn, DataTableHeader } from "@/components/DataTable";
import FilterSection from "@/components/FilterSection";
import DataTable from "@/components/DataTable";
import ActivityChart from "@/components/ActivityChart";

const ActivityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

type UserActivityRow = {
  id: string;
};

const headers: DataTableHeader[] = [{ key: "empty", label: "ข้อมูลกิจกรรมผู้ใช้" }];
const columns: DataTableColumn<UserActivityRow>[] = [
  { key: "empty", render: () => "-" },
];

export default function UserActivityPage() {
  return (
    <>
      <Header title="กิจกรรมผู้ใช้" icon={<ActivityIcon />} />

      <main className="flex-1 p-6 space-y-5 overflow-y-auto">
        <FilterSection />
        <DataTable
          headers={headers}
          columns={columns}
          rows={[]}
          rowKey={(row) => row.id}
          emptyMessage="ยังไม่มีข้อมูลกิจกรรม"
        />
        <ActivityChart />
      </main>
    </>
  );
}
