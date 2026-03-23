"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: "รอใส่ชื่อผู้ใช้",
    username: "@admin_user",
    bio: "Digital Nomad | Coffee Lover",
    email: "admin@codearea.app",
    phone: "+66 81-XXX-XXXX",
    dob: "1990-01-01",
    language: "Thai",
    theme: "System Default",
    twoFactor: false,
  });

  const [initialData, setInitialData] = useState(formData);
  const [hasChanges, setHasChanges] = useState(false);
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    // Check if data changed
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData);
    setTimeout(() => {
      setHasChanges(isChanged);
    }, 0);
  }, [formData, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Basic inline validation for email
    if (name === "email") {
      if (!value.includes("@") && value.length > 0) {
        setEmailError("Invalid email format");
      } else {
        setEmailError("");
      }
    }
  };

  const handleToggle = (name: string) => {
    setFormData(prev => ({ ...prev, [name as keyof typeof formData]: !prev[name as keyof typeof formData] }));
  };

  const handleSave = () => {
    if (emailError) return;
    setInitialData(formData);
    setHasChanges(false);
    alert("Settings saved successfully!");
  };

  const handleCancel = () => {
    setFormData(initialData);
    setEmailError("");
    setHasChanges(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-white">
      <Header title="Profile & Settings" />
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full relative">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/10 blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-8 pb-24 relative z-10">
          
          {/* 1. Header & Public Profile */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Public Profile
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              {/* Profile Picture */}
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold overflow-hidden border border-primary/20 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                  รอ
                </div>
                <button className="absolute inset-0 bg-primary/40 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-2xl z-10 backdrop-blur-sm cursor-pointer">
                  <svg className="w-6 h-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-widest">Update</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="flex-1 space-y-5 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Display Name</label>
                    <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full h-12 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Bio / Tagline</label>
                  <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={3} className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none shadow-inner" placeholder="Tell us about yourself..."></textarea>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Account Information */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Account Details
            </h2>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="space-y-2 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Email Address</label>
                  <div className="relative">
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={`w-full h-11 px-4 bg-white/5 border ${emailError ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-primary'} rounded-xl text-sm text-white focus:outline-none transition-all shadow-inner`} />
                    {emailError && <p className="absolute -bottom-5 left-0 text-[10px] font-bold text-red-500 uppercase tracking-tight">{emailError}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 sm:mt-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    Verified
                  </span>
                  <button type="button" className="text-xs text-primary font-bold hover:text-primary-hover transition-colors">Change</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                <div className="space-y-2 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider block ml-1">Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary transition-all shadow-inner" />
                </div>
                <div className="flex items-center shrink-0 sm:mt-6">
                  <button type="button" className="text-xs text-primary font-bold hover:text-primary-hover transition-colors">Upgrade Security</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-white/5 bg-white/[0.02] opacity-60">
                <div className="space-y-2 w-full sm:w-1/2">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-wider block ml-1">Date of Birth</label>
                  <input type="date" name="dob" value={formData.dob} disabled className="w-full h-11 px-4 bg-white/5 border border-white/5 rounded-xl text-sm text-white/40 cursor-not-allowed" style={{ colorScheme: 'dark' }} />
                </div>
                <div className="flex items-center shrink-0 sm:mt-6">
                  <p className="text-[10px] text-white/30 max-w-[180px] leading-relaxed italic">
                    Contact admin for birthdate corrections.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Security & Access */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Security Ecosystem
            </h2>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div>
                  <h3 className="font-bold text-white text-sm">Main Access Password</h3>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1 font-medium">Last rotated: 90 days ago</p>
                </div>
                <button type="button" className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer">
                  Rotate Password
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                <div className="pr-4">
                  <h3 className="font-bold text-white text-sm">Two-Factor Authentication</h3>
                  <p className="text-[10px] text-white/40 font-medium mt-1 leading-relaxed">Secure your assets with multi-layer verification.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input type="checkbox" className="sr-only peer" checked={formData.twoFactor} onChange={() => handleToggle("twoFactor")} />
                  <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                </label>
              </div>
            </div>
          </section>

          {/* 4. Preferences & Settings */}
          <section className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              App Settings
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400 block">Language</label>
                <div className="relative">
                  <select name="language" value={formData.language} onChange={handleInputChange} className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors cursor-pointer">
                    <option value="English" className="bg-background text-white">English</option>
                    <option value="Thai" className="bg-background text-white">ภาษาไทย</option>
                    <option value="Japanese" className="bg-background text-white">日本語</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-400 block">Theme / Display</label>
                <div className="relative">
                  <select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-colors cursor-pointer">
                    <option value="System Default" className="bg-background text-white">System Default</option>
                    <option value="Light" className="bg-background text-white">Light Mode</option>
                    <option value="Dark" className="bg-background text-white">Dark Mode</option>
                  </select>
                  <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5">
              <div className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                  <h3 className="font-medium text-white text-sm">Notification Preferences</h3>
                  <p className="text-xs text-slate-400 mt-1">Manage Email, Push, and SMS notifications.</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0 border border-white/5 group-hover:border-primary/20">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Account Actions */}
          <section className="bg-red-500/5 rounded-2xl border border-red-500/20 p-6 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[60px] pointer-events-none group-hover:bg-red-500/20 transition-all"></div>
            <h2 className="text-lg font-bold text-red-500 mb-2 font-black uppercase tracking-tighter">Danger Area</h2>
            <p className="text-xs text-red-500/60 mb-6 font-medium italic">Highly sensitive destructive actions that cannot be undone.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => router.push("/")} type="button" className="px-6 py-3 bg-white/5 border border-red-500/20 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-all cursor-pointer">
                Terminate Session (Log Out)
              </button>
              <button type="button" className="px-6 py-3 bg-red-600/20 border border-red-600/40 rounded-xl text-xs font-bold text-red-400 hover:bg-red-600/40 transition-all cursor-pointer">
                Erase Account Permanently
              </button>
            </div>
          </section>

        </div>
      </main>

      {/* Floating Save Actions */}
      <div className={`fixed bottom-0 left-0 right-0 sm:left-[260px] p-4 bg-card-bg/80 backdrop-blur-2xl border-t border-white/5 transform transition-all duration-500 z-50 ${hasChanges ? 'translate-y-0 opacity-100 shadow-[0_-20px_40px_rgba(0,0,0,0.4)]' : 'translate-y-full opacity-0'}`}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            <p className="text-xs font-bold text-white tracking-widest uppercase hidden sm:block">System holds pending updates</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <button onClick={handleCancel} className="flex-1 sm:flex-none px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all cursor-pointer">
              Discard
            </button>
            <button onClick={handleSave} className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.5)] cursor-pointer">
              Synchronize Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
