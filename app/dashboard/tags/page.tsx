"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { initialTags, type TagItem } from "./data";
import { api } from "@/lib/api";
import Swal from "sweetalert2";

import { Icon } from "@/components/icons/Icon";
import { ManagementCard } from "@/components/ManagementCard";

type SortOrder = "popular" | "least" | "newest";

type TagApiRow = {
  id?: string | number;
  name?: string;
  tag_name?: string;
  slug?: string;
  label?: string;
  question_count?: number;
  count?: number;
};

type TagsResponse = {
  data?: TagApiRow[];
  rows?: TagApiRow[];
  items?: TagApiRow[];
  results?: TagApiRow[];
};

export default function TagsPage() {
  const router = useRouter();
  const [tags, setTags] = useState<TagItem[]>(initialTags);
  const [newTag, setNewTag] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("popular");
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);

  // ฟังก์ชัน fetchTagsWithCounts
  // ดึงข้อมูลรายการแท็กพร้อมจำนวนโจทย์จาก API หลังบ้าน
  // เริ่มโหลด -> ขอข้อมูลจาก API -> กรอง/คัดแยกผลลัพธ์ -> อัปเดตสถานะแท็ก -> หยุดโหลด
  // 1. ตั้งค่า isLoadingCounts เป็น true เพื่อแสดงสถานะการโหลด
  // 2. ดึงข้อมูลแท็กจาก /api/tags โดยใช้ฟังก์ชันช่วยของ API ที่มีการระบุตัวตน
  // 3. จัดการรูปแบบการตอบกลับที่หลากหลายจาก API (data, rows, items, results)
  // 4. แปลงข้อมูลแถวจาก API เป็นวัตถุ TagItem และทำการฆ่าเชื้อข้อมูล (sanitization)
  // 5. อัปเดตสถานะแท็กในเครื่องหากพบข้อมูลที่แปลงมาได้
  // 6. ตั้งค่า isLoadingCounts เป็น false เมื่อเสร็จสิ้น
  const fetchTagsWithCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const res = await api.get<TagsResponse>("/tags", {
        useToken: true,
        params: { page: 1, limit: 100 },
      });

      if (res.ok && res.data) {
        const raw = (res.data.data ?? res.data.rows ?? res.data.items ?? res.data.results) as TagApiRow[];
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped: TagItem[] = raw
            .filter((r) => r && typeof r === "object")
            .map((row) => {
              const id = row.id ?? "";
              const name = row.name ?? row.tag_name ?? row.label ?? JSON.stringify(row.id) ?? "Unknown Tag";
              const questionCount = Number(row.question_count ?? row.count ?? 0);
              return { id, name, questionCount };
            })
            .filter((item) => String(item.name).length > 0);

          if (mapped.length > 0) {
            setTags(mapped);
          }
        } else {
          console.log("Tags API returned empty, keeping placeholders");
        }
      }
    } catch (e) {
      console.error("Error fetching tags:", e);
    }
    setIsLoadingCounts(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      void fetchTagsWithCounts();
    }
  }, [isAuthorized, fetchTagsWithCounts]);

  // ระบบความปลอดภัย
  // บังคับใช้การควบคุมการเข้าถึงตามบทบาท (RBAC) เพื่อให้แน่ใจว่าเฉพาะผู้ดูแลระบบที่มีสิทธิ์ (role_id === 2) เท่านั้นที่สามารถจัดการแท็กได้
  // หากผู้ใช้ไม่มีสิทธิ์ จะถูกส่งไปที่หน้าหลักของ dashboard โจทย์
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

  const filteredAndSortedTags = useMemo(() => {
    let result = tags.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = selectedTag ? item.name === selectedTag : true;
      return matchesSearch && matchesTag;
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
  }, [tags, searchQuery, selectedTag, sortOrder]);

  const totalQuestions = useMemo(
    () => tags.reduce((sum, t) => sum + t.questionCount, 0),
    [tags],
  );

  // ฟังก์ชัน handleAddTag
  // สร้างบันทึกแท็กใหม่ผ่าน API และอัปเดตสถานะในหน้าจอ
  // ตัดช่องว่าง -> ตรวจสอบชื่อซ้ำ -> ส่งข้อมูล POST ไปที่ /api/tags -> อัปเดตรายการในเครื่อง -> ล้างค่าช่องกรอก
  // 1. ป้องกันการทำงานเริ่มต้นของฟอร์ม (reload หน้า)
  // 2. ตัดช่องว่างและตรวจสอบว่าแท็กนี้มีอยู่แล้วในเครื่องหรือไม่
  // 3. ส่งคำขอ POST ไปยังระบบหลังบ้านพร้อมชื่อแท็กใหม่
  // 4. หากสำเร็จ ให้นำแท็กใหม่ใส่ไว้หน้าสุดของรายการแท็กในเครื่อง
  // 5. ล้างค่าในช่องกรอกข้อมูลและปิดโหมดการเพิ่มแท็ก
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTag.trim();
    if (trimmed && !tags.some((t) => t.name === trimmed)) {
      setIsSubmitting(true);
      try {
        const res = await api.post<TagApiRow>("/tags", { name: trimmed }, { useToken: true });
        if (res.ok && res.data) {
          const newId = res.data.id ?? `tag-${Date.now()}`;
          setTags([{ id: newId, name: trimmed, questionCount: 0 }, ...tags]);
          setNewTag("");
          setIsAdding(false);
        } else {
          alert(res.error || "Failed to create tag");
        }
      } catch (err) {
        console.error("Error creating tag:", err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ฟังก์ชัน handleDeleteTag
  // ลบแท็กออกจากระบบหลังจากเสร็จสิ้นการยืนยันจากผู้ใช้
  // ถามผู้ใช้ -> แสดงสถานะกำลังโหลด -> แจ้ง API ให้ลบ -> กรองสถานะในเครื่องออก -> แสดงข้อความสำเร็จ
  // 1. แสดงหน้าต่างยืนยันการลบ (SweetAlert2)
  // 2. หากยืนยัน ให้แสดงสถานะกำลังโหลดขณะกำลังดำเนินการลบ
  // 3. ส่งคำขอ DELETE ไปที่ /api/tags/:id
  // 4. เมื่อสำเร็จ ให้นำแท็กนั้นออกจากรายการในเครื่อง
  // 5. แสดงการแจ้งเตือนความสำเร็จให้ผู้ใช้ทราบ
  const handleDeleteTag = async (id: string | number) => {
    const result = await Swal.fire({
      title: "ลบแท็ก?",
      text: "คุณแน่ใจหรือไม่ว่าต้องการลบแท็กนี้? การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบแท็ก",
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

        const res = await api.delete(`/tags/${id}`, { useToken: true });
        if (res.ok) {
          setTags(prev => prev.filter(t => t.id !== id));
          await Swal.fire({
            icon: "success",
            title: "สำเร็จ",
            text: "ลบแท็กเรียบร้อยแล้ว",
            background: "#1a1c2e",
            color: "#fff",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(res.error || "Failed to delete tag");
        }
      } catch (err: any) {
        console.error("Error deleting tag:", err);
        void Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: err.message || "ไม่สามารถลบแท็กได้",
          background: "#1a1c2e",
          color: "#fff",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleStartEdit = (item: TagItem) => {
    setEditingId(item.id);
    setEditingName(item.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // ฟังก์ชัน handleUpdateTag
  // บันทึกชื่อแท็กที่แก้ไขไปยังระบบหลังบ้าน
  // ตรวจสอบข้อมูล -> แจ้ง API ให้แก้ไข (PUT) -> อัปเดตข้อมูลในหน้าจอ -> ล้างสถานะการแก้ไข
  // 1. ตรวจสอบว่าชื่อแท็กที่แก้ไขต้องไม่ว่างเปล่า
  // 2. ส่งคำขอ PUT ไปที่ /api/tags/:id ผ่านระบบหลังบ้าน
  // 3. อัปเดตชื่อแท็กที่ระบุในรายการแท็กในเครื่องโดยใช้ map
  // 4. ออกจากโหมดการแก้ไขและล้างสถานะชั่วคราวออก
  const handleUpdateTag = async (id: string | number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    try {
      const res = await api.put<TagApiRow>(`/tags/${id}`, { name: trimmed }, { useToken: true });
      if (res.ok) {
        setTags(prev => prev.map(t => t.id === id ? { ...t, name: trimmed } : t));
        setEditingId(null);
        setEditingName("");
      } else {
        alert(res.error || "Failed to update tag");
      }
    } catch (err) {
      console.error("Error updating tag:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTag("");
    setSortOrder("popular");
  };

  const hasActiveFilters = searchQuery || selectedTag || sortOrder !== "popular";

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
      <Header title="จัดการแท็ก" icon={<Icon name="tag" className="w-5 h-5" />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        {/* Top Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/5 shadow-2xl flex items-center gap-5 group transition-all duration-300 hover:bg-white/[0.08]">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 group-hover:scale-105 transition-transform">
              <Icon name="tag" className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">แท็กทั้งหมด</p>
              <p className="text-2xl font-black text-white mt-0.5">{tags.length}</p>
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
                  placeholder="ค้นหาแท็ก..."
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
              เพิ่มแท็กใหม่
            </button>
          </div>

          {/* Grid of Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isAdding && (
              <div className="bg-primary/20 border-2 border-dashed border-primary/40 rounded-3xl p-6 transition-all animate-in zoom-in duration-300">
                <form onSubmit={handleAddTag} className="space-y-4">
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
                      placeholder="ชื่อแท็ก..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
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

            {filteredAndSortedTags.map((item, idx) => (
              <ManagementCard
                key={item.id}
                id={item.id}
                name={item.name}
                questionCount={item.questionCount}
                isEditing={editingId === item.id}
                isSubmitting={isSubmitting}
                editValue={editingName}
                setEditValue={setEditingName}
                onUpdate={handleUpdateTag}
                onCancelEdit={handleCancelEdit}
                onStartEdit={() => handleStartEdit(item)}
                onDelete={handleDeleteTag}
                viewUrl={`/dashboard/problems?tag=${item.id}`}
                unitLabel="โจทย์"
                entityName="แท็ก"
                index={idx}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
              />
            ))}
          </div>

          {filteredAndSortedTags.length === 0 && !isAdding && (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <Icon name="tag" className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/40 font-bold uppercase tracking-widest text-sm italic">ไม่พบแท็กที่ต้องการค้นหา</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
