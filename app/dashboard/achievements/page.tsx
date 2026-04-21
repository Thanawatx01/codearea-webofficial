"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Swal from "sweetalert2";
import { Icon } from "@/components/icons/Icon";

type Achievement = {
  id: number;
  name: string;
  description: string;
  icon: string;
  criteria_type: string;
  criteria_value: number;
  color: string;
  earned?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by_name?: string;
  updated_by_name?: string;
};

export default function AchievementsManagementPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "zap",
    criteria_type: "solve_count",
    criteria_value: 1,
    color: "text-amber-400"
  });

  const fetchAchievements = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<{ ok: boolean, data: Achievement[] }>("/achievements", { useToken: true });
      if (res.ok && res.data?.data) {
        setAchievements(res.data.data);
      }
    } catch (e) {
      console.error("Error fetching achievements:", e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role_id === 2) {
          setIsAuthorized(true);
          void fetchAchievements();
        } else {
          setIsAuthorized(false);
          router.replace("/dashboard/problems");
        }
      } catch (e) {
        router.replace("/login");
      }
    } else {
      router.replace("/login");
    }
  }, [router, fetchAchievements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingAchievement ? `/achievements/${editingAchievement.id}` : "/achievements";
      const method = editingAchievement ? "put" : "post";
      
      const res = await api[method]<{ ok: boolean, data: Achievement }>(url, formData, { useToken: true });
      
      if (res.ok) {
        await Swal.fire({
          icon: "success",
          title: editingAchievement ? "อัปเดตสำเร็จ" : "สร้างสำเร็จ",
          background: "#1a1c2e",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false
        });
        setShowModal(false);
        setEditingAchievement(null);
        resetForm();
        void fetchAchievements();
      } else {
        throw new Error(res.error || "Failed to save achievement");
      }
    } catch (err: any) {
      void Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: err.message,
        background: "#1a1c2e",
        color: "#fff"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การกระทำนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      background: "#1a1c2e",
      color: "#fff"
    });

    if (result.isConfirmed) {
      try {
        const res = await api.delete(`/achievements/${id}`, { useToken: true });
        if (res.ok) {
          setAchievements(prev => prev.filter(a => a.id !== id));
          Swal.fire({ icon: "success", title: "ลบเรียบร้อย", background: "#1a1c2e", color: "#fff", timer: 1000, showConfirmButton: false });
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const openEditModal = (ach: Achievement) => {
    setEditingAchievement(ach);
    setFormData({
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      criteria_type: ach.criteria_type,
      criteria_value: ach.criteria_value,
      color: ach.color
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "zap",
      criteria_type: "solve_count",
      criteria_value: 1,
      color: "text-amber-400"
    });
  };

  if (isAuthorized === null) return null;

  return (
    <>
      <Header title="จัดการ Achievements" icon={<Icon name="award" className="w-5 h-5" />} />
      <main className="flex-1 p-6 space-y-6 overflow-y-auto w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-[#1a1c2e]/60 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-xl">
          <div>
            <h2 className="text-xl font-black text-white">Achievements ({achievements.length})</h2>
            <p className="text-xs text-white/40 uppercase font-bold tracking-widest mt-1 text-primary">Badge & Progression Management</p>
          </div>
          <button
            onClick={() => { setEditingAchievement(null); resetForm(); setShowModal(true); }}
            className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-hover hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
          >
            <Icon name="plus" className="w-4 h-4" />
            เพิ่ม Achievement
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((ach) => (
            <div key={ach.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition-all group relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center border border-white/10 ${ach.color}`}>
                    <Icon name={ach.icon} className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-white">{ach.name}</h3>
                    <p className="text-xs text-white/40 line-clamp-1">{ach.description}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(ach)} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20">
                    <Icon name="edit" className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ach.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20">
                    <Icon name="trash" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Criteria</p>
                  <p className="text-xs font-bold text-white/60">{ach.criteria_type}: {ach.criteria_value}</p>
                </div>
                <div className={`px-3 py-1 rounded-full bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40`}>
                  {ach.icon}
                </div>
              </div>

              {(ach.created_by_name || ach.updated_at) && (
                <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5 relative z-10">
                  {ach.created_by_name && (
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Icon name="user" className="w-3 h-3" />
                      <span>สร้างโดย: <span className="text-white/50">{ach.created_by_name}</span></span>
                      {ach.created_at && <span>({new Date(ach.created_at).toLocaleDateString()})</span>}
                    </div>
                  )}
                  {ach.updated_at && (
                    <div className="flex items-center gap-2 text-[10px] text-white/30">
                      <Icon name="calendar" className="w-3 h-3" />
                      <span>แก้ไขล่าสุด: <span className="text-white/50">{ach.updated_by_name || ach.created_by_name}</span></span>
                      <span>({new Date(ach.updated_at).toLocaleDateString()} {new Date(ach.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Decorative Background Icon */}
              <div className={`absolute -right-4 -bottom-4 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:scale-[1.6] ${ach.color}`}>
                <Icon name={ach.icon} className="w-24 h-24" />
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative bg-[#06070d] border border-white/10 rounded-[2.5rem] w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
              <div className="flex-shrink-0 p-8 pb-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">{editingAchievement ? "แก้ไข" : "เพิ่ม"} Achievement</h3>
                    <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">Configure badge parameters</p>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
                    <Icon name="x" className="w-5 h-5 text-white/40" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 pt-6 custom-scrollbar">
                <form id="achievementForm" onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">ชื่อ Achievement</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all font-medium text-sm"
                        placeholder="e.g. Master Algorithm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">คำอธิบาย</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all h-20 resize-none text-xs leading-relaxed"
                        placeholder="รายละเอียดวิธีได้รับ..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">เลือกไอคอน (Lucide)</label>
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                        {[
                          "award", "zap", "fire", "star", "cpu", "rocket", "target", "shield", 
                          "trophy", "activity", "compass", "globe", "database", "key", "lock", "mail",
                          "phone", "camera", "clock", "user", "palette", "codearea-logo", "home", "search"
                        ].map((iconName) => (
                          <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: iconName })}
                            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                              formData.icon === iconName 
                                ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" 
                                : "bg-white/5 text-white/20 hover:bg-white/10 hover:text-white/60"
                            }`}
                            title={iconName}
                          >
                            <Icon name={iconName} className="h-5 w-5" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">เลือกสี</label>
                      <div className="flex flex-wrap gap-2 bg-white/5 p-4 rounded-2xl border border-white/5">
                        {[
                          "text-amber-400", "text-orange-500", "text-red-500", "text-pink-500", 
                          "text-purple-500", "text-indigo-400", "text-blue-400", "text-cyan-400", 
                          "text-teal-400", "text-emerald-500", "text-green-500", "text-white"
                        ].map((colorClass) => (
                          <button
                            key={colorClass}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: colorClass })}
                            className={`h-8 w-8 rounded-full border-2 transition-all ${
                              formData.color === colorClass 
                                ? "border-white scale-110 shadow-lg" 
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                            style={{ 
                              backgroundColor: colorClass.includes('amber') ? '#fbbf24' : 
                                             colorClass.includes('orange') ? '#f97316' : 
                                             colorClass.includes('red') ? '#ef4444' : 
                                             colorClass.includes('pink') ? '#ec4899' : 
                                             colorClass.includes('purple') ? '#a855f7' : 
                                             colorClass.includes('indigo') ? '#818cf8' : 
                                             colorClass.includes('blue') ? '#60a5fa' : 
                                             colorClass.includes('cyan') ? '#22d3ee' : 
                                             colorClass.includes('teal') ? '#2dd4bf' : 
                                             colorClass.includes('emerald') ? '#10b981' : 
                                             colorClass.includes('green') ? '#22c55e' : '#ffffff'
                            }}
                            title={colorClass}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">ประเภทเงื่อนไข</label>
                        <select
                          value={formData.criteria_type}
                          onChange={(e) => setFormData({ ...formData, criteria_type: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all appearance-none text-xs font-medium"
                        >
                          <option value="solve_count">จำนวนข้อที่ทำได้</option>
                          <option value="streak_count">จำนวนวันต่อเนื่อง</option>
                          <option value="language_count">จำนวนภาษาที่ใช้</option>
                          <option value="night_solve">ทำช่วงกลางคืน</option>
                          <option value="category_solve_count">หมวดหมู่เฉพาะ</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">ค่าที่ต้องการ (Value)</label>
                        <input
                          type="number"
                          required
                          value={formData.criteria_value}
                          onChange={(e) => setFormData({ ...formData, criteria_value: parseInt(e.target.value) })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>

              <div className="flex-shrink-0 p-8 pt-4 border-t border-white/5 bg-white/[0.02] flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-white/5 text-white/40 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/5"
                >
                  ยกเลิก
                </button>
                <button
                  form="achievementForm"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary-hover hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
