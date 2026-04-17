"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Cropper from "react-easy-crop";
import { getCroppedImg, type Area, base64ToBlob } from "@/lib/imageUtils";
import Swal from "sweetalert2";


// Define TypeScript interfaces for our data
interface TechBadge {
  name: string;
  color: string;
  bg: string;
}

interface GithubStyleProfileData {
  name: string;
  username: string;
  avatarUrl: string;
  bio: string;
  followers: number;
  following: number;
  stars: number;
  location: string;
  email: string;
  website: string;
  twitter: string;
  role: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<GithubStyleProfileData>({
    name: "User",
    username: "user_developer",
    avatarUrl: "",
    bio: "I make things for web",
    followers: 5,
    following: 12,
    stars: 46,
    location: "Bangkok, Thailand",
    email: "user@example.com",
    website: "https://codearea.app",
    twitter: "@user_dev",
    role: "Developer Program Member",
  });
  const [roleId, setRoleId] = useState<number>(1);

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState({
    xp: 0,
    solvedCount: 0,
    totalSubmissions: 0,
    passedCount: 0,
    failedCount: 0,
    accuracy: 0,
    recentActivity: [] as any[],
    categories: [] as { name: string; count: number }[]
  });

  const [submissions, setSubmissions] = useState<any[]>([]);

  // --- Inline Edit & Cropper States ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", bio: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load user data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Get Basic User Info (Parsed from local storage or updated via API)
        const user = JSON.parse(userRaw);
        setProfileData((prev) => ({
          ...prev,
          name: user.display_name?.trim() || "User",
          username: user.email?.split("@")[0] || "user_developer",
          email: user.email || "user@example.com",
          avatarUrl: user.avatar_url || "",
          role: user.role_id === 2 ? "Administrator" : "Developer Program Member",
        }));
        setRoleId(user.role_id || 1);

        // 2. Fetch Profile Summary (XP, Stats, Activity)
        const summaryRes = await api.get<any>("/users/profile/me", { useToken: true });
        if (summaryRes.ok && summaryRes.data) {
          const d = summaryRes.data;
          setStats({
            xp: d.user.xp,
            solvedCount: d.user.solved_count,
            totalSubmissions: d.user.total_submissions,
            passedCount: d.user.passed_count,
            failedCount: d.user.failed_count,
            accuracy: d.user.accuracy,
            recentActivity: d.recent_activity || [],
            categories: d.category_stats || []
          });
          
          setProfileData(prev => ({
            ...prev,
            avatarUrl: d.user.avatar_url || prev.avatarUrl,
            bio: d.user.bio || "",
            location: d.user.location || "",
            phone: d.user.phone || "",
            dob: d.user.dob || ""
          }));
          setAvatarPreview(d.user.avatar_url || null);
        }

        // 3. Fetch Submissions for the feed
        const subRes = await api.get<any>("/submissions", { useToken: true, params: { limit: 10 } });
        if (subRes.ok && subRes.data) {
          setSubmissions(subRes.data.data || []);
        }

      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    }
  };

  const onCropComplete = useCallback((_: any, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleApplyCrop = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setAvatarPreview(croppedImage);
        setIsCropping(false);
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleEditClick = () => {
    setEditForm({ name: profileData.name, bio: profileData.bio });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarPreview(profileData.avatarUrl); // Reset avatar changes if any
  };

  const handleSaveProfile = async () => {
    setIsSubmitting(true);
    try {
      const userRaw = localStorage.getItem("user");
      if (!userRaw) throw new Error("No user found");
      const user = JSON.parse(userRaw);

      let currentAvatarUrl = avatarPreview;

      if (avatarPreview && avatarPreview.startsWith("data:")) {
        const blur = await base64ToBlob(avatarPreview);
        const formDataObj = new FormData();
        formDataObj.append("avatar", blur, "avatar.webp");
        const uploadRes = await api.post<{ avatar_url: string }>(`/users/${user.id}/avatar`, formDataObj, { useToken: true });
        if (!uploadRes.ok || !uploadRes.data) throw new Error(uploadRes.error || "Failed to upload avatar");
        currentAvatarUrl = uploadRes.data.avatar_url;
      }

      const res = await api.put<any>(`/users/${user.id}`, {
        display_name: editForm.name,
        bio: editForm.bio,
        avatar_url: currentAvatarUrl,
      }, { useToken: true });

      if (!res.ok || !res.data) throw new Error(res.error || "Error saving profile");

      const updated = res.data;

      localStorage.setItem("user", JSON.stringify({ ...user, display_name: updated.display_name, avatar_url: updated.avatar_url }));

      setProfileData(p => ({
        ...p,
        name: updated.display_name,
        bio: updated.bio || "",
        avatarUrl: updated.avatar_url,
      }));
      setAvatarPreview(updated.avatar_url);
      setIsEditing(false);

      await Swal.fire({ icon: "success", title: "สำเร็จ", text: "อัปเดตโปรไฟล์เรียบร้อยแล้ว", timer: 1500, showConfirmButton: false, background: "#1a1c2e", color: "#fff" });
    } catch (e: any) {
      void Swal.fire({ icon: "error", title: "ผิดพลาด", text: e.message || "Failed to save profile", background: "#1a1c2e", color: "#fff" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {/* Cropper Modal */}
      {isCropping && imageToCrop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#11131f] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-black uppercase tracking-tighter text-lg">ครอบภาพโปรไฟล์</h3>
              <button onClick={() => setIsCropping(false)} className="text-white/40 hover:text-white transition-colors">
                <Icon name="xmark" className="w-6 h-6" />
              </button>
            </div>
            <div className="relative h-[400px] w-full bg-black/40">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                  <span>ซูม</span>
                  <span>{Math.round(zoom * 100)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsCropping(false)}
                  className="flex-1 py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/20 transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleApplyCrop}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:bg-emerald-500"
                >
                  ปรับใช้
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 w-full min-h-screen text-white pb-20">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* ======================= */}
          {/* LEFT SIDEBAR (xl:col-span-3) */}
          {/* ======================= */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Avatar */}
            <div className="relative group w-[296px] max-w-full mx-auto xl:mx-0">
              <div className="w-full aspect-square rounded-full border border-white/10 bg-linear-to-br from-[#1a1c3a] to-[#0a0a1a] shadow-2xl flex items-center justify-center p-2 relative overflow-hidden z-10 transition-transform duration-300">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-8xl font-bold text-white/50">{profileData.name.charAt(0).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none"></div>
                
                {isEditing && (
                  <label className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
                    <Icon name="camera" className="w-8 h-8 text-white mb-2" />
                    <span className="text-xs font-bold text-white tracking-wider">Change Avatar</span>
                    <input type="file" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                  </label>
                )}
              </div>
              {/* Status Badge */}
              <div className="absolute bottom-[5%] right-[10%] w-12 h-12 rounded-full border border-yellow-500/30 bg-[#161b22] shadow-lg flex items-center justify-center z-20 hover:scale-110 transition-transform cursor-pointer">
                <span className="text-lg">💛</span>
              </div>
            </div>

            {/* Names */}
            <div className="space-y-1 text-center xl:text-left pt-2">
              <div className="flex items-center justify-center xl:justify-start gap-3">
                <h1 className="text-2xl font-bold text-white leading-tight">{profileData.username}</h1>
                {roleId === 2 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)] group/admin">
                    <Icon name="shield" className="w-3.5 h-3.5 text-amber-500 group-hover/admin:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500">Admin</span>
                  </div>
                )}
              </div>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/20 rounded-md px-3 py-1.5 text-white/90 text-sm focus:outline-none focus:border-blue-500 shadow-inner mt-2 block"
                  placeholder="Display Name"
                />
              ) : (
                <p className="text-xl font-light text-white/50">{profileData.name}</p>
              )}
            </div>

            {/* Edit Profile */}
            <div className="pt-2">
              {isEditing ? (
                <div className="flex gap-2">
                  <button 
                    onClick={handleSaveProfile} 
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 px-3 rounded-md bg-emerald-600/20 border border-emerald-500/30 text-sm font-semibold hover:bg-emerald-600/30 text-emerald-400 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    disabled={isSubmitting}
                    className="flex-1 py-1.5 px-3 rounded-md bg-[#21262d] border border-white/10 text-sm font-semibold hover:bg-[#30363d] text-white/80 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEditClick}
                  className="w-full py-1.5 px-3 block text-center rounded-md bg-[#21262d] border border-white/10 text-sm font-semibold hover:bg-[#30363d] hover:border-white/20 transition-all shadow-sm text-white"
                >
                  Edit profile
                </button>
              )}
            </div>

            {/* Bio */}
            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full bg-[#0d1117] border border-white/20 rounded-md px-3 py-2 text-white/90 text-sm focus:outline-none focus:border-blue-500 shadow-inner mt-2 resize-none h-24"
                placeholder="Add a bio"
              />
            ) : (
              <p className="text-sm text-white/80 leading-relaxed text-center xl:text-left pt-2 px-1 break-words">
                {profileData.bio || "No bio provided."}
              </p>
            )}

            {/* User Info Links */}
            {!isEditing && (
              <ul className="space-y-2 text-sm text-white/80 pt-4 border-t border-white/10 mt-4">
                <li className="flex items-center gap-3">
                  <Icon name="mail" className="w-4 h-4 text-white/40" />
                  <a href={`mailto:${profileData.email}`} className="truncate hover:text-blue-400 hover:underline">{profileData.email}</a>
                </li>
              </ul>
            )}

          </div>

          {/* ======================= */}
          {/* RIGHT CONTENT (xl:col-span-9) */}
          {/* ======================= */}
          <div className="xl:col-span-9 min-w-0">
            
            {/* Navigation Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 no-scrollbar mb-6 sticky top-0 bg-[#05070f]/90 backdrop-blur-md z-30 pt-2 pb-px w-full">
              {[
                { id: "dashboard", label: "Overview", icon: "stats", count: null },
                { id: "questions", label: "Questions Solved", icon: "check-circle", count: stats.solvedCount || 0 },
                { id: "submissions", label: "Submissions", icon: "activity", count: stats.totalSubmissions || 0 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    activeTab === tab.id
                      ? "border-orange-500 text-white"
                      : "border-transparent text-white/60 hover:text-white hover:border-white/20 hover:bg-white/5 rounded-t-md"
                  }`}
                >
                  <Icon name={tab.icon} className={`w-4 h-4 ${activeTab === tab.id ? "text-white/70" : "text-white/40"}`} />
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/80 font-semibold leading-none flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dashboard / Overview Content */}
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Left Column: Performance & Category */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Performance Card */}
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl -z-10 group-hover:bg-emerald-500/10 transition-colors"></div>
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <Icon name="target" className="w-4 h-4 text-emerald-500" />
                        Performance
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Solved Rate</p>
                            <p className="text-3xl font-black text-white">{stats.accuracy}%</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">Total XP</p>
                             <p className="text-xl font-bold text-orange-400">{stats.xp.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-[11px] font-bold text-white/60">PASSED</span>
                            </div>
                            <p className="text-xl font-black text-white ml-3.5">{stats.passedCount}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                              <span className="text-[11px] font-bold text-white/60">FAILED</span>
                            </div>
                            <p className="text-xl font-black text-white ml-3.5">{stats.failedCount}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Categories */}
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                      <h3 className="text-sm font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                        <Icon name="tag" className="w-4 h-4 text-pink-500" />
                        Top Categories
                      </h3>
                      <div className="space-y-5">
                        {stats.categories.length > 0 ? stats.categories.map((cat, idx) => (
                           <div key={cat.name} className="space-y-2">
                             <div className="flex justify-between items-center text-xs">
                               <span className="font-bold text-white/80">{cat.name}</span>
                               <span className="text-white/40 font-mono">{cat.count} solved</span>
                             </div>
                             <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                               <div 
                                 className="h-full bg-linear-to-r from-pink-500 to-purple-600 rounded-full" 
                                 style={{ width: `${Math.min(100, (cat.count / Math.max(1, stats.solvedCount)) * 100)}%` }}
                               ></div>
                             </div>
                           </div>
                        )) : (
                          <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                            <p className="text-xs text-white/20 italic">No category data yet</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Recent Activity */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[#0d1117] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                      <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                          <Icon name="history" className="w-4 h-4 text-blue-500" />
                          Recent Activity
                        </h3>
                        <button onClick={() => setActiveTab("submissions")} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors">
                          View All
                        </button>
                      </div>
                      
                      <div className="divide-y divide-white/5">
                        {stats.recentActivity.length > 0 ? stats.recentActivity.map((sub) => (
                          <div key={sub.id} className="p-4 sm:p-6 hover:bg-white/[0.01] transition-colors group flex items-start sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-4 min-w-0">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                                sub.status === 1 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                              }`}>
                                <Icon name={sub.status === 1 ? "check-circle" : "xmark"} className="w-5 h-5" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-primary transition-colors truncate">
                                  {sub.questions?.title || "Unknown Question"}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                  <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">{sub.language}</span>
                                  <span className="text-[10px] text-white/30">•</span>
                                  <span className="text-[10px] text-white/30">{new Date(sub.created_at).toLocaleDateString()}</span>
                                  {sub.run_time && (
                                    <>
                                      <span className="text-[10px] text-white/30">•</span>
                                      <span className="text-[10px] text-white/30">{sub.run_time}ms</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="shrink-0 text-right hidden sm:block">
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                                sub.status === 1 ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                              }`}>
                                {sub.status === 1 ? "Accepted" : "Wrong Answer"}
                              </span>
                            </div>
                          </div>
                        )) : (
                          <div className="p-12 text-center">
                            <Icon name="activity" className="w-12 h-12 text-white/5 mx-auto mb-4" />
                            <p className="text-sm text-white/30">No recent activity found.</p>
                            <Link href="/questions" className="text-xs text-blue-400 hover:underline mt-2 inline-block">Start Solving</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === "submissions" && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Recent Submissions</h3>
                  </div>
                  
                  {submissions.length > 0 ? (
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]/50">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40 border-b border-white/10">
                          <tr>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Language</th>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Memory</th>
                            <th className="px-6 py-4 text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {submissions.map((sub) => (
                            <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  {sub.status === 1 ? (
                                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="check-circle" className="w-3 h-3" /> Accepted
                                    </span>
                                  ) : sub.status === 2 ? (
                                    <span className="flex items-center gap-1.5 text-red-400 font-bold bg-red-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="x-circle" className="w-3 h-3" /> Wrong Answer
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5 text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded-full text-xs">
                                      <Icon name="activity" className="w-3 h-3" /> Error
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-mono text-white/60 bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase text-[10px]">{sub.language}</span>
                              </td>
                              <td className="px-6 py-4 text-white/60">{sub.run_time ? `${sub.run_time} ms` : "N/A"}</td>
                              <td className="px-6 py-4 text-white/60">{sub.memory_used ? `${(sub.memory_used / 1024).toFixed(1)} KB` : "N/A"}</td>
                              <td className="px-6 py-4 text-right text-white/40 font-mono text-xs">
                                {new Date(sub.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50 mt-4">
                      <Icon name="activity" className="w-12 h-12 text-white/10 mx-auto mb-4" />
                      <h2 className="text-xl font-bold text-white/60 mb-2">No Submissions Yet</h2>
                      <p className="text-sm text-white/40">Start solving questions to see your history here.</p>
                    </div>
                  )}
                </div>
            )}

            {activeTab === "questions" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 mt-8">
                 <div className="flex items-center justify-between mb-4">
                   <h3 className="text-lg font-bold text-white">Solved Questions</h3>
                 </div>

                 {/* For now we show a placeholder for specific solved questions list, but count is real */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unique Solved Questions would be fetched here. Showing empty state if 0 */}
                    {stats.solvedCount > 0 ? (
                      <div className="col-span-full border border-orange-500/20 rounded-xl p-12 text-center bg-orange-500/[0.02]">
                        <Icon name="check-circle" className="w-12 h-12 text-orange-500/30 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white/80 mb-2">{stats.solvedCount} Questions Solved</h2>
                        <p className="text-sm text-white/40 max-w-md mx-auto">Great job! You have successfully mastered {stats.solvedCount} coding challenges across various categories.</p>
                      </div>
                    ) : (
                      <div className="col-span-full border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50">
                        <Icon name="problem" className="w-12 h-12 text-white/10 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white/60 mb-2">No Questions Solved Yet</h2>
                        <p className="text-sm text-white/40">Challenge yourself and start solving problems to build your collection.</p>
                      </div>
                    )}
                 </div>
              </div>
            )}

          </div>
          
        </div>
      </div>
      
    </div>
    </>
  );
}
