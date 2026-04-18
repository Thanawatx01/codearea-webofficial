"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { initialProblemTypes, type ProblemTypeItem } from "./data";
import { api } from "@/lib/api";
import Swal from "sweetalert2";

import { Icon } from "@/components/icons/Icon";
import { ManagementCard } from "@/components/ManagementCard";

type SortOrder = "popular" | "least" | "newest";

type CategoryApiRow = {
  id?: string | number;
  category_id?: string | number;
  name?: string;
  category_name?: string;
  title?: string;
  question_count?: number;
  count?: number;
};

type CategoriesResponse = {
  data?: CategoryApiRow[];
  rows?: CategoryApiRow[];
  items?: CategoryApiRow[];
  results?: CategoryApiRow[];
};

export default function ProblemTypesPage() {
  const router = useRouter();
  const [types, setTypes] = useState<ProblemTypeItem[]>(initialProblemTypes);
  const [newType, setNewType] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  // ฟังก์ชัน fetchCategoriesWithCounts
  // ดึงข้อมูลประเภทโจทย์พร้อมจำนวนโจทย์จาก API
  // เริ่มโหลด -> ขอข้อมูลจาก API -> แปลงข้อมูล -> อัปเดตสถานะ -> หยุดโหลด
  // 1. ตั้งค่า isLoadingCounts เป็น true
  // 2. ดึงข้อมูลประเภทจาก /api/question-categories
  // 3. ประมวลผลรูปแบบการตอบกลับที่หลากหลายเพื่อดึงข้อมูลอาร์เรย์ออกมา
  // 4. แปลงแถวประเภทเป็นรูปแบบ ProblemTypeItem พร้อมค่าสำรองหากไม่มีชื่อหรือไอดี
  // 5. อัปเดตสถานะ types ในเครื่องด้วยผลลัพธ์ที่ได้
  // 6. ตั้งค่า isLoadingCounts เป็น false
  const fetchCategoriesWithCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const res = await api.get<CategoriesResponse>("/question-categories", {
        useToken: true,
        params: { page: 1, limit: 100 },
      });

      if (res.ok && res.data) {
        const raw = (res.data.data ?? res.data.rows ?? res.data.items ?? res.data.results) as CategoryApiRow[];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: ProblemTypeItem[] = raw
            .filter((r) => r && typeof r === "object")
            .map((row) => {
              const id = row.id ?? row.category_id ?? "";
              const name = row.name ?? row.category_name ?? row.title ?? JSON.stringify(row.id) ?? "ไม่ทราบประเภท";
              const questionCount = Number(row.question_count ?? row.count ?? 0);
              return { id, name, questionCount };
            })
            .filter((item) => String(item.name).length > 0);

          if (mapped.length > 0) {
            setTypes(mapped);
          }
        } else {
          console.log("Categories API returned empty, keeping placeholders");
        }
      }
    } catch (e) {
      console.error("Error fetching categories:", e);
    }
    setIsLoadingCounts(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      void fetchCategoriesWithCounts();
    }
  }, [isAuthorized, fetchCategoriesWithCounts]);

  // ระบบความปลอดภัย
  // ตรวจสอบสิทธิ์ผู้ใช้โดยอ้างอิงจากออบเจ็กต์ 'user' ใน localStorage เฉพาะ admin (role_id === 2) เท่านั้นที่ได้รับอนุญาต มิฉะนั้นจะถูกส่งไปที่ dashboard โจทย์
  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role_id === 2) {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          router.replace("/dashboard/problems");
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  const filteredAndSortedTypes = useMemo(() => {
    let result = types.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType ? item.name === selectedType : true;
      return matchesSearch && matchesType;
    });

    switch (sortOrder) {
      case "popular":
        result = [...result].sort((a, b) => b.questionCount - a.questionCount);
        break;
      case "least":
        result = [...result].sort((a, b) => a.questionCount - b.questionCount);
        break;
      case "newest":
        break;
    }

    return result;
  }, [types, searchQuery, selectedType, sortOrder]);

  const totalQuestions = useMemo(
    () => types.reduce((sum, t) => sum + t.questionCount, 0),
    [types],
  );

  // ฟังก์ชัน handleAddType
  // ลงทะเบียนประเภทโจทย์ใหม่ในฐานข้อมูลและอัปเดต UI
  // ตรวจสอบแหล่งข้อมูล -> ส่ง POST ไปที่ /api/question-categories -> อัปเดตรายการ types -> ล้างฟอร์ม
  // 1. ป้องกันพฤติกรรมเริ่มต้นของการส่งฟอร์ม
  // 2. ตรวจสอบข้อมูลนำเข้าและตรวจสอบว่าไม่มีชื่อซ้ำในเครื่อง
  // 3. ส่งคำขอ POST เพื่อสร้างหมวดหมู่ในระบบหลังบ้าน
  // 4. หากสำเร็จ ให้เพิ่มหมวดหมู่ใหม่ไว้ที่จุดเริ่มต้นของรายการ types ในเครื่อง
  // 5. ล้างฟิลด์ข้อมูลนำเข้าและปิดโหมดการเพิ่ม
  const handleAddType = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newType.trim();
    if (trimmed && !types.some((t) => t.name === trimmed)) {
      setIsSubmitting(true);
      try {
        const res = await api.post<{ data: CategoryApiRow }>("/question-categories", { name: trimmed }, { useToken: true });
        if (res.ok && res.data) {
          const newId = res.data.data?.id ?? `new-${Date.now()}`;
          setTypes([{ id: newId, name: trimmed, questionCount: 0 }, ...types]);
          setNewType("");
          setIsAdding(false);
        } else {
          alert(res.error || "Failed to create category");
        }
      } catch (err) {
        console.error("Error creating category:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ฟังก์ชัน handleDeleteType
  // ลบประเภทโจทย์จากระบบ (Soft-delete) หลังจากผู้ใช้ยืนยัน และอัปเดตรายการในเครื่อง
  // ยืนยัน -> แสดงสถานะกำลังโหลด -> แจ้ง API ลบข้อมูล -> กรองรายการออก -> แสดงการแจ้งเตือนสำเร็จ
  // 1. แสดงกล่องยืนยันคำเตือนผ่าน SweetAlert2
  // 2. แสดงตัวโหลดข้อมูลเมื่อผู้ใช้ยืนยัน
  // 3. ส่งคำขอ DELETE ไปยังระบบหลังบ้านพร้อม ID ของหมวดหมู่
  // 4. กรองหมวดหมู่ที่ถูกลบออกจากสถานะ types ในเครื่อง
  // 5. แสดงการแจ้งเตือนความสำเร็จในขั้นตอนสุดท้าย
  const handleDeleteType = async (id: string | number) => {
    const result = await Swal.fire({
      title: "ลบประเภทโจทย์?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบประเภทโจทย์นี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบประเภท",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      background: "#1a1c2e",
      color: "#fff",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        Swal.fire({
          title: "กำลังลบ...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: "#1a1c2e",
          color: "#fff",
        });

        const res = await api.delete(`/question-categories/${id}`, { useToken: true });
        if (res.ok) {
          setTypes(prev => prev.filter(t => t.id !== id));
          await Swal.fire({
            icon: "success",
            title: "สำเร็จ",
            text: "ลบประเภทโจทย์เรียบร้อยแล้ว",
            background: "#1a1c2e",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(res.error || "Failed to delete category");
        }
      } catch (err: any) {
        console.error("Error deleting category:", err);
        void Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: err.message || "ไม่สามารถลบประเภทโจทย์ได้",
          background: "#1a1c2e",
          color: "#fff",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleStartEdit = (item: ProblemTypeItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // ฟังก์ชัน handleUpdateType
  // อัปเดตชื่อหมวดหมู่ที่มีอยู่แล้วในระบบหลังบ้าน
  // ตรวจสอบ -> แจ้ง API ให้แก้ไข (PUT) -> อัปเดตสถานะ -> ปิดโหมดการแก้ไข
  // 1. ตรวจสอบให้แน่ใจว่าชื่อใหม่ไม่ว่างเปล่า
  // 2. ส่งคำขอ PUT ไปยัง API ระบบหลังบ้าน
  // 3. วนลูปผ่าน types ในเครื่องและอัปเดตบันทึกที่ตรงกัน
  // 4. ล้างตัวแปรสถานะการแก้ไขเพื่อออกจากโหมดแก้ไข
  const handleUpdateType = async (id: string | number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const res = await api.put(`/question-categories/${id}`, { name: trimmed }, { useToken: true });
      if (res.ok) {
        setTypes(prev => prev.map(t => t.id === id ? { ...t, name: trimmed } : t));
        setEditingId(null);
        setEditingName("");
      } else {
        alert(res.error || "Failed to update category");
      }
    } catch (err) {
      console.error("Error updating category:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedType("");
    setSortOrder("popular");
  };

  const hasActiveFilters = searchQuery || selectedType || sortOrder !== "popular";

  if (isAuthorized === null) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (isAuthorized === false) return null;

  return (
    <>
      <Header title="จัดการประเภทโจทย์" icon={<Icon name="problem-type" className="w-5 h-5" />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <Icon name="problem-type" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ประเภททั้งหมด</p>
              <p className="text-2xl font-black text-white mt-0.5">{types.length}</p>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover:scale-105 transition-transform">
              <Icon name="check" className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">คำถามรวมทั้งหมด</p>
              <p className="text-2xl font-black text-white mt-0.5">{totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* Action Bar */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 bg-[#1a1c2e]/60 backdrop-blur-2xl p-5 md:p-6 rounded-[2rem] border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1">
              <div className="relative group w-full md:w-auto">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                  <Icon name="search" className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="ค้นหาประเภทโจทย์..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:bg-black/30 transition-all w-full md:w-64"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 p-1 bg-black/20 rounded-xl border border-white/5 w-fit">
                <div className="px-3 py-1.5 flex items-center gap-2 border-r border-white/5 hidden sm:flex">
                  <Icon name="sort" className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">จัดเรียง:</span>
                </div>
                {(["popular", "newest", "least"] as SortOrder[]).map((order) => (
                  <button
                    key={order}
                    onClick={() => setSortOrder(order)}
                    className={`px-3 py-1.5 text-[11px] font-bold transition-all rounded-lg ${sortOrder === order ? "bg-primary text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                  >
                    {order === "popular" ? "ยอดนิยม" : order === "newest" ? "ใหม่ล่าสุด" : "น้อยสุด"}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors bg-red-400/5 hover:bg-red-400/10 rounded-xl w-full md:w-auto"
                >
                  <Icon name="x" className="w-3.5 h-3.5" />
                  ล้างตัวกรอง
                </button>
              )}
            </div>

            <button
              onClick={() => setIsAdding(true)}
              className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-hover hover:scale-[1.02] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 w-full xl:w-auto"
            >
              <Icon name="plus" className="w-4 h-4" />
              เพิ่มประเภทใหม่
            </button>
          </div>

          {/* Grid of Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdding && (
              <div className="bg-primary/20 border-2 border-dashed border-primary/40 rounded-3xl p-6 transition-all animate-in zoom-in duration-300">
                <form onSubmit={handleAddType} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <Icon name="plus" className="w-3.5 h-3.5" />
                      สร้างใหม่
                    </span>
                    <button type="button" onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                      <Icon name="x" className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    <input
                      autoFocus
                      type="text"
                      placeholder="ชื่อประเภทโจทย์..."
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50"
                      >
                        เพิ่มทันที
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {filteredAndSortedTypes.map((item, idx) => (
              <ManagementCard
                key={item.id}
                id={item.id}
                name={item.name}
                questionCount={item.questionCount}
                isEditing={editingId === item.id}
                isSubmitting={isSubmitting}
                editValue={editingName}
                setEditValue={setEditingName}
                onUpdate={handleUpdateType}
                onCancelEdit={handleCancelEdit}
                onStartEdit={() => handleStartEdit(item)}
                onDelete={handleDeleteType}
                viewUrl={`/dashboard/problems?categoryId=${item.id}`}
                unitLabel="โจทย์"
                entityName="ประเภท"
                index={idx}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>

          {filteredAndSortedTypes.length === 0 && !isAdding && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Icon name="problem-type" className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">ไม่พบประเภทที่ต้องการค้นหา</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
