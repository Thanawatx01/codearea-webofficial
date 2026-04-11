"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<GithubStyleProfileData | null>(null);

  const startEditing = () => {
    setEditForm(profileData);
    setIsEditing(true);
  };

  const saveEditing = () => {
    if (editForm) {
      setProfileData(editForm);
    }
    setIsEditing(false);
  };

  // Load user data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");

    if (!token || !userRaw) {
      router.replace("/login");
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      setProfileData((prev) => ({
        ...prev,
        name: user.display_name?.trim() || "User",
        username: user.email?.split("@")[0] || "user_developer",
        email: user.email || "user@example.com",
        avatarUrl: user.avatar_url || "",
      }));
    } catch (error) {
      console.error("Failed to parse user data", error);
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Dummy Tech Stack Data
  const techStack: TechBadge[] = [
    { name: "C", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
    { name: "Java", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    { name: "C++", color: "text-blue-500", bg: "bg-blue-600/10 border-blue-600/20" },
    { name: "HTML5", color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
    { name: "CSS3", color: "text-blue-300", bg: "bg-blue-400/10 border-blue-400/20" },
    { name: "JavaScript", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { name: "Node.js", color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    { name: "React", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/20" },
  ];

  // Dummy Heatmap calculation for 52 weeks x 7 days
  const heatmapData = Array.from({ length: 364 }, () => {
    const rand = Math.random();
    if (rand < 0.6) return 0;
    if (rand < 0.8) return 1;
    if (rand < 0.95) return 2;
    return 3;
  });

  const getHeatmapColor = (level: number) => {
    switch(level) {
      case 0: return "bg-white/5 border-white/5";
      case 1: return "bg-emerald-900 border-emerald-800/50";
      case 2: return "bg-emerald-600 border-emerald-500/50";
      case 3: return "bg-emerald-400 border-emerald-300/50 text-emerald-400";
      default: return "bg-white/5 border-white/5";
    }
  };

  return (
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
                {profileData.avatarUrl ? (
                  <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="text-8xl font-bold text-white/50">{profileData.name.charAt(0).toUpperCase()}</span>
                )}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] pointer-events-none"></div>
              </div>
              {/* Status Badge */}
              <div className="absolute bottom-[5%] right-[10%] w-12 h-12 rounded-full border border-yellow-500/30 bg-[#161b22] shadow-lg flex items-center justify-center z-20 hover:scale-110 transition-transform cursor-pointer">
                <span className="text-lg">💛</span>
              </div>
            </div>

            {isEditing && editForm ? (
              <div className="space-y-4 pt-4 text-left">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-white">Name</label>
                  <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-white">Bio</label>
                  <textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="w-full bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm h-24 resize-y focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" placeholder="Add a bio" />
                  <p className="text-[12px] text-white/50 leading-tight">You can @mention other users and organizations to link to them.</p>
                </div>
                <div className="space-y-1 mt-4">
                  <label className="text-sm font-semibold text-white">Pronouns</label>
                  <select className="w-full bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none appearance-none">
                    <option>he/him</option>
                    <option>she/her</option>
                    <option>they/them</option>
                    <option>custom</option>
                  </select>
                </div>
                
                <div className="space-y-3 pt-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/40 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 14.25c0 .138.112.25.25.25H4v-1.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75v1.25h2.25a.25.25 0 0 0 .25-.25V1.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25v12.5ZM1.75 16A1.75 1.75 0 0 1 0 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 0 0 .25-.25V8.285a.25.25 0 0 0-.111-.208l-1.055-.703a.75.75 0 1 1 .832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0 1 14.25 16h-3.5a.75.75 0 0 1-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 0 1-.75-.75V14h-1v1.25a.75.75 0 0 1-.75.75h-3ZM3 3.75A.75.75 0 0 1 3.75 3h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 3 4.25v-.5Zm0 3A.75.75 0 0 1 3.75 6h.5a.75.75 0 0 1 .75.75v.5A.75.75 0 0 1 4.25 8h-.5A.75.75 0 0 1 3 7.25v-.5Zm0 3A.75.75 0 0 1 3.75 9h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 3 10.25v-.5ZM7 3.75A.75.75 0 0 1 7.75 3h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 7 4.25v-.5Zm0 3A.75.75 0 0 1 7.75 6h.5a.75.75 0 0 1 .75.75v.5A.75.75 0 0 1 8.25 8h-.5A.75.75 0 0 1 7 7.25v-.5Zm0 3A.75.75 0 0 1 7.75 9h.5a.75.75 0 0 1 .75.75v.5a.75.75 0 0 1-.75.75h-.5A.75.75 0 0 1 7 10.25v-.5Z" /></svg>
                    <input type="text" placeholder="Company" value={editForm.role} onChange={(e) => setEditForm({...editForm, role: e.target.value})} className="flex-1 bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="globe" className="w-4 h-4 text-white/40 shrink-0" />
                    <input type="text" placeholder="Location" value={editForm.location} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="flex-1 bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                  </div>
                  <div className="flex items-center gap-2 pl-6">
                    <label className="flex items-center gap-2 text-sm font-semibold text-white/80 cursor-pointer">
                      <input type="checkbox" className="rounded border-white/15 bg-transparent text-blue-500 focus:ring-offset-[#0d1117] focus:ring-1 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer" />
                      Display current local time
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="mail" className="w-4 h-4 text-white/40 shrink-0" />
                    <select value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="flex-1 bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow appearance-none">
                       <option>{editForm.email}</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="link" className="w-4 h-4 text-white/40 shrink-0" />
                    <input type="text" placeholder="Website" value={editForm.website} onChange={(e) => setEditForm({...editForm, website: e.target.value})} className="flex-1 bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                  </div>
                </div>

                <div className="pt-4">
                  <label className="text-sm font-semibold text-white">Social accounts</label>
                  <div className="space-y-2 mt-2">
                    {[1,2,3,4].map(num => (
                      <div key={num} className="flex items-center gap-2">
                        <Icon name="link" className="w-4 h-4 text-white/40 shrink-0" />
                        <input type="text" placeholder={`Link to social profile ${num}`} className="flex-1 bg-[#0d1117] border border-white/15 rounded-md px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-shadow" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-white/10 mt-6 !pb-2">
                  <button onClick={saveEditing} className="px-4 py-1.5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-semibold rounded-md transition-colors">
                    Save
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-white/15 text-white text-sm font-semibold rounded-md transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Names */}
                <div className="space-y-1 text-center xl:text-left pt-2">
                  <h1 className="text-2xl font-bold text-white leading-tight">{profileData.name}</h1>
                  <p className="text-xl font-light text-white/50">{profileData.username}</p>
                </div>

                {/* Follow / Edit Profile */}
                <div className="pt-2">
                  <button onClick={startEditing} className="w-full py-1.5 px-3 block text-center rounded-md bg-[#21262d] border border-white/10 text-sm font-semibold hover:bg-[#30363d] hover:border-white/20 transition-all shadow-sm text-white">
                    Edit profile
                  </button>
                </div>

                {/* Bio */}
                <p className="text-sm text-white/80 leading-relaxed text-center xl:text-left pt-2">
                  {profileData.bio || "No bio provided."}
                </p>

                {/* User Info Links */}
                <ul className="space-y-2 text-sm text-white/80 pt-4 border-t border-white/10 mt-4">
                  {profileData.location && (
                    <li className="flex items-center gap-3">
                      <Icon name="globe" className="w-4 h-4 text-white/40" />
                      <span className="truncate">{profileData.location}</span>
                    </li>
                  )}
                  <li className="flex items-center gap-3">
                    <Icon name="mail" className="w-4 h-4 text-white/40" />
                    <a href={`mailto:${profileData.email}`} className="truncate hover:text-blue-400 hover:underline">{profileData.email}</a>
                  </li>
                </ul>
              </>
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
                { id: "questions", label: "Questions Solved", icon: "check-circle", count: 84 },
                { id: "submissions", label: "Submissions", icon: "activity", count: 397 },
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
                
                {/* Profile "README" Section */}
                <div className="rounded-xl border border-white/10 overflow-hidden bg-transparent">
                  {/* README Header label */}
                  <div className="px-4 py-2 border-b border-white/10 bg-[#161b22] text-xs font-semibold text-white/80 flex items-center gap-2">
                    <span className="text-[10px]">📖</span> {profileData.username}/README.md
                  </div>
                  
                  {/* The actual README content area (Dark themed) */}
                  <div className="p-1 pb-8 flex flex-col items-center">
                    
                    {/* Banner */}
                    <div className="relative w-full aspect-[21/9] sm:aspect-[3/1] rounded-lg overflow-hidden border border-white/5 bg-linear-to-b from-orange-400/20 to-purple-900/40 mb-6 flex flex-col items-center justify-center shadow-lg">
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mix-blend-screen drop-shadow-md tracking-tight mb-2 text-center px-4">
                        Hi, I'm {profileData.name} <span className="inline-block animate-bounce ml-2 z-10 text-orange-400">●</span>
                      </h2>
                      <p className="text-xl sm:text-2xl font-mono text-white/90 font-bold bg-black/40 px-4 py-1 rounded shadow-sm">
                        A CodeArea Developer
                      </p>
                    </div>

                    {/* Basic Intro paragraph */}
                    <p className="text-sm font-medium text-white/80 max-w-4xl text-center leading-relaxed mb-10 px-4">
                      Welcome to my profile! I am consistently practicing Data Structures and Algorithms to improve my logic skills. 
                      Take a look at my stats below to see my progress and recent problem-solving activity.
                    </p>

                    {/* Two column stats cards */}
                    <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2 mb-4">
                      My CodeArea Stats 
                    </h3>
                    
                    <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 mb-6">
                      
                      {/* Stats Overview */}
                      <div className="p-5 rounded-lg border border-pink-500/30 bg-[#0d1117] flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-pink-500/5 mix-blend-overlay"></div>
                        <div className="z-10 w-full">
                           <h4 className="text-[13px] font-bold text-pink-500 mb-4 tracking-widest uppercase">
                             {profileData.name}'s Dashboard Stats
                           </h4>
                           <div className="space-y-3">
                             <div className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2"><Icon name="star" className="w-4 h-4 text-yellow-400" /><span className="text-white/80 font-bold tracking-wide">Total XP:</span></div>
                               <span className="font-bold text-white">4,397</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2"><Icon name="problem-type" className="w-4 h-4 text-blue-400" /><span className="text-white/80 font-bold tracking-wide">Total Submissions:</span></div>
                               <span className="font-bold text-white">397</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2"><Icon name="target" className="w-4 h-4 text-emerald-400" /><span className="text-white/80 font-bold tracking-wide">Win Rate / Accuracy:</span></div>
                               <span className="font-bold text-emerald-400">76%</span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                               <div className="flex items-center gap-2"><Icon name="check-circle" className="w-4 h-4 text-orange-400" /><span className="text-white/80 font-bold tracking-wide">Questions Solved:</span></div>
                               <span className="font-bold text-orange-400">84</span>
                             </div>
                           </div>
                        </div>
                        {/* Grade Circle */}
                        <div className="z-10 shrink-0 ml-4 hidden sm:flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-pink-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] bg-[#161b22]">
                          <span className="text-2xl lg:text-3xl font-black text-pink-500">A+</span>
                        </div>
                      </div>

                      {/* Language / Category Usage */}
                      <div className="p-5 rounded-lg border border-pink-500/30 bg-[#0d1117] flex justify-between items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
                        <div className="z-10 w-full h-full flex flex-col justify-center">
                           <h4 className="text-[13px] font-bold text-pink-500 mb-4 tracking-widest uppercase">
                             Top Category Stats
                           </h4>
                           <div className="space-y-4">
                             <div>
                               <div className="flex justify-between text-xs mb-1">
                                 <span className="font-bold text-white/80">Data Structures</span>
                                 <span className="text-white/50">60.81%</span>
                               </div>
                               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-400 w-[60.81%]"></div>
                               </div>
                             </div>
                             <div>
                               <div className="flex justify-between text-xs mb-1">
                                 <span className="font-bold text-white/80">Dynamic Programming</span>
                                 <span className="text-white/50">37.83%</span>
                               </div>
                               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 w-[37.83%]"></div>
                               </div>
                             </div>
                             <div>
                               <div className="flex justify-between text-xs mb-1">
                                 <span className="font-bold text-white/80">Graph Theory</span>
                                 <span className="text-white/50">1.36%</span>
                               </div>
                               <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-pink-400 w-[1.36%]"></div>
                               </div>
                             </div>
                           </div>
                        </div>
                      </div>

                    </div>

                    {/* Streak Summary */}
                    <div className="w-full max-w-[calc(100vw-32px)] overflow-x-auto text-center flex justify-center mb-12">
                      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/10 border border-white/10 rounded-lg p-0 bg-[#0d1117] overflow-hidden shrink-0 min-w-[300px]">
                        <div className="flex flex-col items-center justify-center p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                          <span className="text-3xl font-black text-pink-500 mb-1">888</span>
                          <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase mb-1">Total Contributions</span>
                          <span className="text-[10px] text-white/40">Sep 22, 2023 - Present</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors relative">
                          <div className="w-16 h-16 rounded-full border-[3px] border-orange-500 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                            <span className="text-2xl font-black text-white">1</span>
                          </div>
                          <span className="text-[11px] font-bold text-orange-400 tracking-wider uppercase mb-1">Current Streak</span>
                          <span className="text-[10px] text-white/40">Today</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-6 bg-white/[0.01] hover:bg-white/[0.03] transition-colors">
                          <span className="text-3xl font-black text-pink-500 mb-1">145</span>
                          <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase mb-1">Longest Streak</span>
                          <span className="text-[10px] text-white/40">Jan 9 - Jun 2</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Heatmap Area */}
                <div className="mt-8 border border-white/10 rounded-xl p-4 sm:p-6 bg-[#0d1117]/50 backdrop-blur-sm w-full overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                    <h3 className="text-[15px] font-semibold text-white/90">
                      888 contributions in the last year
                    </h3>
                    <div className="text-[11px] text-white/50 bg-[#161b22] px-3 py-1 rounded border border-white/10">Contribution Settings</div>
                  </div>

                  <div className="w-full overflow-x-auto no-scrollbar border border-white/5 bg-[#161b22]/30 rounded-lg p-4">
                     <div className="min-w-[800px]">
                        {/* Months Row */}
                        <div className="flex text-[9px] text-white/40 mb-2 font-medium">
                          <div className="w-8"></div> {/* Space for weekday labels */}
                          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => (
                            <div key={i} className="flex-1 text-center">{month}</div>
                          ))}
                        </div>
                        
                        <div className="flex gap-1.5">
                          {/* Weekdays */}
                          <div className="flex flex-col gap-[5px] text-[9px] text-white/40 font-medium justify-between pr-2">
                            <span className="h-[10px]"></span>
                            <span className="h-[10px] leading-[10px]">Mon</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px] leading-[10px]">Wed</span>
                            <span className="h-[10px]"></span>
                            <span className="h-[10px] leading-[10px]">Fri</span>
                            <span className="h-[10px]"></span>
                          </div>

                          {/* Grid */}
                          <div className="flex flex-col flex-wrap h-[100px] gap-[5px]">
                            {heatmapData.map((level, i) => (
                              <div
                                key={i}
                                className={`w-[10px] h-[10px] rounded-[2px] ${getHeatmapColor(level)} border`}
                                title={`Activity level: ${level}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                     </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[11px] text-white/50 mt-4 px-1 gap-2">
                    <a href="#" className="hover:text-blue-400">Learn how User Activity works</a>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <span>Less</span>
                      <div className="flex gap-1">
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-white/5 border border-white/5"></div>
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900 border border-emerald-800/50"></div>
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-600 border border-emerald-500/50"></div>
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400 border border-emerald-300/50"></div>
                      </div>
                      <span>More</span>
                    </div>
                  </div>

                </div>

              </div>
            )}
            
            {activeTab !== "dashboard" && (
               <div className="border border-white/10 rounded-xl p-12 text-center bg-[#0d1117]/50 mt-8">
                  <h2 className="text-xl font-bold text-white/60 mb-2">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Feed Empty</h2>
                  <p className="text-sm text-white/40">This tab does not have any content yet.</p>
               </div>
            )}

          </div>
          
        </div>
      </div>
      
    </div>
  );
}
