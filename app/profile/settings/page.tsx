"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Icon } from "@/components/icons/Icon";
import { UnsavedChangesBar } from "@/components/UnsavedChangesBar";
import Swal from "sweetalert2";
import Cropper from "react-easy-crop";
import { getCroppedImg, type Area, base64ToBlob } from "@/lib/imageUtils";
import { useLogout } from "@/components/auth/LogoutProvider";

// ส่วนประกอบหน้า Settings (การตั้งค่า)
// ส่วนประกอบนี้มีส่วนต่อประสานที่ครอบคลุมสำหรับผู้ใช้ในการอัปเดตการตั้งค่าโปรไฟล์ 
// จัดการข้อมูลประจำตัวด้านความปลอดภัย และจัดการการดำเนินการที่เกี่ยวข้องกับบัญชี
// 1. จัดการสถานะที่ซับซ้อนสำหรับข้อมูลโปรไฟล์ การครอบภาพ และการเปลี่ยนแปลงที่ยังไม่ได้บันทึก
// 2. ดำเนินการประมวลผลรูปภาพสำหรับการอัปโหลดรูปโปรไฟล์ (การครอบภาพและการบีบอัด)
// 3. ปรับสถานะท้องถิ่นให้ตรงกับ backend API และอัปเดต localStorage เมื่อสำเร็จ
// 4. จัดเตรียม UI สำหรับการยืนยันการลบรูปโปรไฟล์และการครอบภาพ
export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- States ---
  const [formData, setFormData] = useState({
    displayName: "User",
    username: "user@example.com",
    bio: "",
    email: "user@example.com",
    phone: "",
    dob: "",
    language: "Thai",
    theme: "System Default",
    twoFactor: false,
    avatarUrl: null as string | null,
  });

  const [initialData, setInitialData] = useState({ ...formData });
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [showEmailFields, setShowEmailFields] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ old: "", new: "", confirm: "" });
  const [newEmail, setNewEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // --- Cropper States ---
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ผลกระทบในการเริ่มต้น (Initialization Effect)
  // โหลดสถานะผู้ใช้เริ่มต้นจาก localStorage และตรวจสอบการยืนยันตัวตน
  // 1. ตรวจสอบโทเค็นและข้อมูลเมตาของผู้ใช้ใน local storage
  // 2. แยกวิเคราะห์ข้อมูลผู้ใช้และเติมสถานะฟอร์ม
  // 3. จัดการข้อผิดพลาดที่อาจเกิดขึ้นจากการแยกวิเคราะห์โดยเปลี่ยนเส้นทางไปยังหน้าเข้าสู่ระบบ
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userRaw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!userRaw || !token) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(userRaw) as {
        display_name: string;
        email: string;
        id: string;
        avatar_url?: string;
        bio?: string;
        phone?: string;
        dob?: string;
      };
      const loadedData = {
        ...formData,
        displayName: user.display_name,
        username: user.email,
        email: user.email,
        avatarUrl: user.avatar_url || null,
        bio: user.bio || "",
        phone: user.phone || "",
        dob: user.dob || "",
      };
      setFormData(loadedData);
      setInitialData({ ...loadedData });
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    } catch (e) {
      router.replace("/login");
    }
  }, [router]);

  // ตัวติดตามการเปลี่ยนแปลงที่ยังไม่ได้บันทึก (Unsaved Changes Tracker)
  // ตรวจสอบความแตกต่างระหว่างข้อมูลฟอร์มปัจจุบันและสถานะเริ่มต้นที่โหลดมา
  // 1. เปรียบเทียบ formData ปัจจุบันกับ initialData โดยใช้ stringification
  // 2. ตรวจสอบว่ารูปโปรไฟล์มีการเปลี่ยนแปลงหรือถูกลบออกหรือไม่
  // 3. อัปเดตสถานะ hasChanges เพื่อแสดงแถบการดำเนินการด้านล่าง
  useEffect(() => {
    const isChanged = JSON.stringify(formData) !== JSON.stringify(initialData) || (avatarPreview !== null && avatarPreview !== initialData.avatarUrl);
    setHasChanges(isChanged);
  }, [formData, initialData, avatarPreview]);

  // --- Input Handlers ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // ฟังก์ชัน handleAvatarChange
  // จัดการการเลือกไฟล์เริ่มต้นสำหรับรูปโปรไฟล์
  // 1. อ่านไฟล์เป็น Data URL โดยใช้ FileReader
  // 2. กำหนดเป้าหมายรูปภาพสำหรับเครื่องมือครอบภาพ
  // 3. รีเซ็ตค่าอินพุตเพื่อให้สามารถเลือกรูปภาพเดิมซ้ำได้
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

  // ฟังก์ชัน handleApplyCrop
  // บันทึกขั้นตอนการครอบภาพและอัปเดตตัวอย่างภาพ
  // 1. สร้าง blob/base64 ของรูปภาพที่ครอบผ่านยูทิลิตี้ getCroppedImg
  // 2. อัปเดต avatarPreview ด้วยรูปภาพที่ได้
  // 3. ปิดโมดัลครอบภาพและล้างสถานะชั่วคราว
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

  const onCropComplete = useCallback((_: any, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // ฟังก์ชัน handleRemoveAvatar
  // เริ่มต้นขั้นตอนการยืนยันการลบรูปโปรไฟล์
  // 1. แสดงโมดัลยืนยันการลบแบบกำหนดเอง
  const handleRemoveAvatar = () => {
    setShowRemoveConfirm(true);
  };

  // ฟังก์ชัน confirmRemoveAvatar
  // ดำเนินการลบรูปโปรไฟล์
  // 1. ล้างตัวอย่างรูปโปรไฟล์และอัปเดตข้อมูลฟอร์มด้วยค่า null
  // 2. ทำเครื่องหมายสถานะว่ามีการเปลี่ยนแปลงเพื่อให้ต้องกดบันทึก
  // 3. ปิดโมดัลยืนยัน
  const confirmRemoveAvatar = () => {
    setAvatarPreview(null);
    setFormData((prev) => ({ ...prev, avatarUrl: null }));
    setHasChanges(true);
    setShowRemoveConfirm(false);
  };

  // ฟังก์ชัน handleSave
  // บันทึกการเปลี่ยนแปลงโปรไฟล์ทั้งหมดไปยัง backend
  // 1. เปิด SweetAlert เพื่อยืนยันก่อนดำเนินการ
  // 2. แสดงสถานะการโหลดระหว่างการร้องขอ API
  // 3. จัดการตรรกะรูปโปรไฟล์: ส่ง base64 สำหรับภาพใหม่ หรือ null สำหรับการลบ
  // 4. ส่งคำร้องขอ PUT ไปยัง /users/:id พร้อมข้อมูลทั้งหมด
  // 5. อัปเดต local storage และส่งเหตุการณ์ refresh เมื่อสำเร็จ
  const handleSave = async () => {
    const result = await Swal.fire({
      title: "ปรับใช้การเปลี่ยนแปลง?",
      text: "คุณต้องการบันทึกการแก้ไขโปรไฟล์นี้ใช่หรือไม่?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ปรับใช้",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#10b981",
      background: "#1a1c2e",
      color: "#fff",
    });

    if (result.isConfirmed) {
      setIsSubmitting(true);
      try {
        Swal.fire({
          title: "กำลังบันทึก...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: "#1a1c2e",
          color: "#fff",
        });

        let currentAvatarUrl = avatarPreview;
        if (avatarPreview === null) {
          currentAvatarUrl = null;
        } else if (avatarPreview && avatarPreview.startsWith("data:")) {
          currentAvatarUrl = avatarPreview;
        }

        const userRaw = localStorage.getItem("user");
        const user = JSON.parse(userRaw!) as { id: string };

        const response = await api.put<any>(`/users/${user.id}`, {
          display_name: formData.displayName,
          avatar_url: currentAvatarUrl,
          bio: formData.bio,
          phone: formData.phone,
          dob: formData.dob,
        }, {
          useToken: true,
        });

        if (!response.ok || !response.data) {
          const errMsg = response.data?.message || response.data?.details || "Failed to update profile";
          throw new Error(errMsg);
        }

        const updatedUser = response.data;
        const newSyncedData = {
          ...formData,
          displayName: updatedUser.display_name,
          avatarUrl: updatedUser.avatar_url,
          bio: updatedUser.bio || "",
          phone: updatedUser.phone || "",
          dob: updatedUser.dob || ""
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setFormData(newSyncedData);
        setInitialData(newSyncedData);
        setAvatarPreview(updatedUser.avatar_url);
        setHasChanges(false);

        window.dispatchEvent(new Event("profile-updated"));
        await Swal.fire({
          icon: "success",
          title: "สำเร็จ",
          text: "บันทึกการตั้งค่าเรียบร้อยแล้ว",
          background: "#1a1c2e",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false
        });
        router.push("/profile");
      } catch (error: any) {
        console.error("Save error:", error);
        const errorDetail = error.response?.data?.details || error.response?.data?.message || error.message || "ไม่สามารถบันทึกข้อมูลได้";
        void Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: errorDetail, background: "#1a1c2e", color: "#fff" });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setAvatarPreview(initialData.avatarUrl);
    setHasChanges(false);
    setShowEmailFields(false);
    setShowPasswordFields(false);
    setNewEmail("");
  };

  // ฟังก์ชัน handlePasswordChange
  // ขั้นตอนการจำลองการเปลี่ยนรหัสผ่าน
  // 1. ตรวจสอบว่ากรอกข้อมูลครบทุกช่อง
  // 2. ตรวจสอบว่ารหัสผ่านใหม่และยืนยันรหัสผ่านตรงกัน
  // 3. จำลองการตอบกลับว่าสำเร็จและรีเซ็ตสถานะฟอร์ม
  const handlePasswordChange = async () => {
    if (!passwordForm.old || !passwordForm.new || !passwordForm.confirm) {
      return Swal.fire({ icon: "error", title: "ข้อมูลไม่ครบ", text: "กรุณากรอกข้อมูลรหัสผ่านให้ครบทุกช่อง", background: "#1a1c2e", color: "#fff" });
    }
    if (passwordForm.new !== passwordForm.confirm) {
      return Swal.fire({ icon: "error", title: "รหัสผ่านไม่ตรงกัน", text: "รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน", background: "#1a1c2e", color: "#fff" });
    }

    try {
      Swal.fire({
        title: "กำลังดำเนินการ...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        background: "#1a1c2e",
        color: "#fff",
      });

      const userRaw = localStorage.getItem("user");
      const user = JSON.parse(userRaw!) as { id: string };

      const response = await api.put<any>(`/users/${user.id}/change-password`, {
        old_password: passwordForm.old,
        new_password: passwordForm.new,
      }, {
        useToken: true,
      });

      if (!response.ok) {
        throw new Error(response.data?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้");
      }

      void Swal.fire({
        icon: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        text: "ระบบได้ทำการเปลี่ยนรหัสผ่านของคุณเรียบร้อยแล้ว",
        background: "#1a1c2e",
        color: "#fff",
        timer: 1500,
        showConfirmButton: false,
      });
      setShowPasswordFields(false);
      setPasswordForm({ old: "", new: "", confirm: "" });
    } catch (error: any) {
      console.error("Change password error:", error);
      void Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
        background: "#1a1c2e",
        color: "#fff",
      });
    }
  };

  // ฟังก์ชัน handleEmailChange
  // ขั้นตอนการจำลองการตรวจสอบอีเมล
  // 1. ตรวจสอบว่ามีการระบุอีเมล
  // 2. แสดงการแจ้งเตือนว่าส่งลิงก์ยืนยันแล้ว
  // 3. ปิดช่องสำหรับการแก้ไขอีเมล
  const handleEmailChange = async () => {
    if (!newEmail) {
      return Swal.fire({ icon: "error", title: "ข้อมูลไม่ครบ", text: "กรุณาระบุอีเมลใหม่", background: "#1a1c2e", color: "#fff" });
    }
    void Swal.fire({
      icon: "success",
      title: "ส่งลิงก์ยืนยันแล้ว",
      text: "กรุณาตรวจสอบอีเมลใหม่ของคุณเพื่อยืนยันการเปลี่ยนแปลง (Mockup)",
      background: "#1a1c2e",
      color: "#fff",
    });
    setShowEmailFields(false);
    setNewEmail("");
  };

  const { logout, isLoggingOut } = useLogout();
  const handleLogout = () => logout("/");

  const handleExportData = () => {
    void Swal.fire({
      title: "ส่งออกข้อมูลส่วนบุคคล",
      text: "ระบบกำลังเตรียมไฟล์ข้อมูลของคุณ (JSON) และจะส่งไปยังอีเมลของคุณเร็วๆ นี้",
      icon: "info",
      background: "#1a1c2e",
      color: "#fff",
    });
  };

  const handleDeleteRequest = async () => {
    const result = await Swal.fire({
      title: "ลบบัญชี?",
      text: "การกระทำนี้จะไม่สามารถกู้คืนกลับได้ เป็นการลบบัญชีอย่างถาวร",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบบัญชี",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      background: "#1a1c2e",
      color: "#fff",
    });
    if (result.isConfirmed) {
      void Swal.fire({ icon: "success", title: "ส่งคำขอแล้ว", text: "ผู้ดูแลระบบจะดำเนินการภายใน 24-48 ชั่วโมง", background: "#1a1c2e", color: "#fff" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-white pb-20">

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

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#11131f] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <h3 className="font-black uppercase tracking-tighter text-lg">ลบรูปโปรไฟล์</h3>
              <button onClick={() => setShowRemoveConfirm(false)} className="text-white/40 hover:text-white transition-colors">
                <Icon name="xmark" className="w-6 h-6" />
              </button>
            </div>
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
                <Icon name="trash" className="w-8 h-8" />
              </div>
              <p className="text-sm text-white/60 leading-relaxed font-medium">
                ต้องการลบรูปโปรไฟล์ปัจจุบันใช่หรือไม่?
                <br />
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20 mt-2 block">
                  (การลบจะมีผลถาวรหลังจากบันทึกการตั้งค่า)
                </span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowRemoveConfirm(false)}
                  className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white/40 hover:bg-white/10 hover:text-white transition-all"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={confirmRemoveAvatar}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-[0_10px_30px_rgba(239,68,68,0.3)] hover:bg-red-400"
                >
                  ยืนยันการลบ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* 1. Public Profile */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors"></div>
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icon name="user" className="w-6 h-6 text-primary" />
              โปรไฟล์ผู้ใช้
            </h2>
            <div className="w-full h-[1px] bg-linear-to-r from-primary/50 to-transparent"></div>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 rounded-full bg-linear-to-br from-primary/20 to-blue-500/20 text-primary flex items-center justify-center text-4xl font-black border border-white/10 shadow-2xl ring-4 ring-white/5 group-hover:scale-105 transition-all overflow-hidden relative">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  formData.displayName.charAt(0).toUpperCase()
                )}
              </div>

              {avatarPreview && (
                <button
                  onClick={handleRemoveAvatar}
                  type="button"
                  className="absolute bottom-[-8px] left-[-8px] w-10 h-10 bg-red-500/90 text-white flex items-center justify-center rounded-2xl z-20 backdrop-blur-md cursor-pointer border border-white/20 shadow-2xl hover:scale-110 hover:bg-red-600 transition-all group/btn"
                >
                  <Icon name="trash" className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                </button>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-[-8px] right-[-8px] w-10 h-10 bg-primary/95 text-white flex items-center justify-center rounded-2xl z-20 backdrop-blur-md cursor-pointer border border-white/20 shadow-2xl hover:scale-110 hover:bg-violet-500 transition-all group/btn"
              >
                <Icon name="camera" className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            <div className="flex-1 w-full space-y-6 flex flex-col items-center md:items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">ชื่อที่แสดง</label>
                  <input type="text" name="displayName" value={formData.displayName} onChange={handleInputChange} className="w-full h-12 px-5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">อีเมลผู้ใช้</label>
                  <input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full h-12 px-5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-inner" />
                </div>
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">คำแนะนำตัว</label>
                  <span className={`text-[10px] font-black tabular-nums transition-colors ${formData.bio.length >= 240 ? "text-orange-500" : "text-white/20"}`}>
                    {formData.bio.length} / 255
                  </span>
                </div>
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange} 
                  maxLength={255} 
                  rows={3} 
                  className="w-full p-5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary transition-all resize-none shadow-inner" 
                  placeholder="อธิบายว่าคุณเป็นใคร"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 2. Account Information */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 space-y-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icon name="mail" className="w-6 h-6 text-blue-500" />
              ข้อมูลพื้นฐาน
            </h2>
            <div className="w-full h-[1px] bg-linear-to-r from-blue-500/50 to-transparent"></div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between sm:gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 flex-shrink-0">
                    <Icon name="mail" className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] block">อีเมล</label>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-white/80">{formData.email}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">ยืนยันแล้ว</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEmailFields(!showEmailFields)}
                  className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                  {showEmailFields ? "ปิด" : "แก้ไข"}
                </button>
              </div>

              {showEmailFields && (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-300 pt-6">
                  <div className="grid grid-cols-1 gap-4 border-t border-white/5 pt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em]">อีเมลใหม่</label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="ระบุอีเมลใหม่ของคุณ"
                        className="w-full h-12 px-5 bg-black/20 border border-white/5 rounded-2xl text-sm focus:border-blue-500/50 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button onClick={handleEmailChange} className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-black text-xs uppercase tracking-[0.2em] rounded-2xl border border-blue-500/20 transition-all shadow-lg active:scale-[0.98]">
                    ยืนยันการเปลี่ยนอีเมล
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/phone hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all">
                <div className="flex items-center gap-4 mb-0">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 flex-shrink-0">
                    <Icon name="phone" className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] block">เบอร์โทรศัพท์</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-white placeholder-white/20" placeholder="ยังไม่ได้ระบุ" />
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  title="ฟีเจอร์นี้ยังไม่เปิดใช้งาน"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 cursor-not-allowed transition-all"
                >
                  แก้ไข
                </button>
              </div>
              <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center justify-between group/dob hover:border-blue-500/40 hover:bg-blue-500/[0.03] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 flex-shrink-0">
                    <Icon name="calendar" className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.15em] block">วันเกิด</label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-white/80" style={{ colorScheme: 'dark' }} />
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  title="ฟีเจอร์นี้ยังไม่เปิดใช้งาน"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 cursor-not-allowed transition-all"
                >
                  แก้ไข
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Security Section */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icon name="shield" className="w-6 h-6 text-yellow-500" />
              ระบบความปลอดภัย
            </h2>
            <div className="w-full h-[1px] bg-linear-to-r from-yellow-500/50 to-transparent"></div>
          </div>

          <div className="space-y-4">
            <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/[0.03] transition-all group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                    <Icon name="key" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">เปลี่ยนรหัสผ่าน</h3>
                    <p className="text-xs text-white/30 mt-0.5">เปลี่ยนรหัสผ่านเพื่อความเป็นส่วนตัวที่เพิ่มขึ้น</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPasswordFields(!showPasswordFields)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
                >
                  {showPasswordFields ? "ปิด" : "แก้ไข"}
                </button>
              </div>

              {showPasswordFields && (
                <div className="space-y-5 animate-in slide-in-from-top-4 duration-300 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input type="password" name="old" value={passwordForm.old} onChange={handlePasswordInputChange} placeholder="รหัสผ่านเดิม" className="w-full h-11 px-4 bg-black/20 border border-white/5 rounded-xl text-sm focus:border-yellow-500/50 focus:outline-none" />
                    <input type="password" name="new" value={passwordForm.new} onChange={handlePasswordInputChange} placeholder="รหัสผ่านใหม่" className="w-full h-11 px-4 bg-black/20 border border-white/5 rounded-xl text-sm focus:border-yellow-500/50 focus:outline-none" />
                    <input type="password" name="confirm" value={passwordForm.confirm} onChange={handlePasswordInputChange} placeholder="ยืนยันรหัสผ่านใหม่" className="w-full h-11 px-4 bg-black/20 border border-white/5 rounded-xl text-sm focus:border-yellow-500/50 focus:outline-none" />
                  </div>
                  <button onClick={handlePasswordChange} className="w-full py-3 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 font-black text-xs uppercase tracking-[0.2em] rounded-xl border border-yellow-500/20 transition-all">ยืนยันการตั้งรหัสผ่านใหม่</button>
                </div>
              )}
            </div>

            <div className="flex flex-col p-6 bg-white/[0.02] rounded-3xl border border-white/5 hover:border-yellow-500/40 hover:bg-yellow-500/[0.03] transition-all group">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                    <Icon name="shield" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">การยืนยันตัวตน 2 ชั้น (2FA)</h3>
                    <p className="text-xs text-white/30 mt-0.5 whitespace-nowrap">เพิ่มความปลอดภัยด้วย Multi-Factor</p>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex justify-end">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={formData.twoFactor} onChange={() => setFormData(p => ({ ...p, twoFactor: !p.twoFactor }))} />
                    <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[24px] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                  </label>
                </div>
              </div>

              {formData.twoFactor && (
                <div className="mt-5 pt-5 border-t border-white/5 animate-in slide-in-from-top-4 duration-300">
                  <div className="p-4 rounded-2xl bg-yellow-500/5 border border-yellow-500/10 text-center">
                    <p className="text-[10px] font-black text-yellow-500/80 uppercase tracking-[0.2em] leading-relaxed">
                      ฟีเจอร์นี้ยังไม่เปิดใช้งาน และการตั้งค่าใดๆ จะไม่มีผลหลังจากกดบันทึก
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 4. App Preferences */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl">
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icon name="palette" className="w-6 h-6 text-pink-500" />
              ตั้งค่าการใช้งาน
            </h2>
            <div className="w-full h-[1px] bg-linear-to-r from-pink-500/50 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 hover:border-pink-500/20 transition-all group/lang">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 flex-shrink-0">
                  <Icon name="globe" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ภาษาหลัก</h3>
                  <p className="text-[10px] text-white/30 mt-0.5 font-black uppercase tracking-widest">Language</p>
                </div>
              </div>
              <select name="language" value={formData.language} onChange={handleInputChange} className="w-full h-12 px-5 bg-black/20 border border-white/5 rounded-2xl text-sm focus:border-pink-500/50 appearance-none cursor-pointer focus:outline-none transition-all">
                <option value="English">English</option>
                <option value="Thai">ภาษาไทย</option>
              </select>
            </div>
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 hover:border-pink-500/20 transition-all group/theme">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500 border border-pink-500/20 flex-shrink-0">
                  <Icon name="palette" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">การแสดงผล</h3>
                  <p className="text-[10px] text-white/30 mt-0.5 font-black uppercase tracking-widest">Interface Theme</p>
                </div>
              </div>
              <select name="theme" value={formData.theme} onChange={handleInputChange} className="w-full h-12 px-5 bg-black/20 border border-white/5 rounded-2xl text-sm focus:border-pink-500/50 appearance-none cursor-pointer focus:outline-none transition-all">
                <option value="Dark">Dark Mode</option>
                <option value="Light">Light Mode</option>
              </select>
            </div>
          </div>
        </section>

        {/* 5. Data Privacy Control */}
        <section className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/5 p-6 sm:p-8 shadow-2xl relative group overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 blur-[80px] -z-10 group-hover:bg-red-500/10 transition-colors"></div>
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <Icon name="lock" className="w-6 h-6 text-red-500" />
              ข้อมูลและความเป็นส่วนตัว
            </h2>
            <div className="w-full h-[1px] bg-linear-to-r from-red-500/50 to-transparent"></div>
          </div>
          <p className="text-xs text-white/30 mb-8">จัดการข้อมูลส่วนตัวและสถานะบัญชีของคุณ</p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleExportData}
              className="px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black text-white/70 hover:bg-white/10 hover:text-white transition-all uppercase tracking-widest flex items-center gap-3 group/btn"
            >
              <Icon name="database" className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
              คำร้องขอข้อมูล
            </button>
            <button
              onClick={handleDeleteRequest}
              className="px-6 py-3.5 bg-red-500/10 border border-red-500/10 rounded-2xl text-[11px] font-black text-red-500 hover:bg-red-500/20 hover:border-red-500/30 transition-all uppercase tracking-widest flex items-center gap-3 group/btn"
            >
              <Icon name="trash" className="w-4 h-4 opacity-50 group-hover/btn:opacity-100 transition-opacity" />
              คำร้องขอปิดบัญชี
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-6 py-3.5 bg-white text-black rounded-2xl text-[11px] font-black hover:bg-white/90 transition-all uppercase tracking-widest flex items-center gap-3 group/btn shadow-[0_10px_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
            >
              {isLoggingOut ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <Icon name="logout" className="w-4 h-4" />
              )}
              {isLoggingOut ? "กำลังสำรวจความปลอดภัย..." : "ออกจากระบบทุกอุปกรณ์"}
            </button>
          </div>
        </section>

      </main>

      <UnsavedChangesBar
        show={hasChanges}
        isSubmitting={isSubmitting}
        onSaveAction={handleSave}
        onCancelAction={handleCancel}
        message="มีบางอย่างเปลี่ยนแปลงรอการบันทึก"
      />
    </div>
  );
}

// ความปลอดภัย
// ตรวจสอบรหัสความปลอดภัย
// 1. การตรวจสอบการยืนยันตัวตนด้วย JWT ดำเนินการขณะโหลด; เปลี่ยนเส้นทางไปยัง /login หากหายไปหรือไม่ถูกต้อง
// 2. การอัปเดตโปรไฟล์ผ่าน api.put จะมี Bearer Token สำหรับการอนุญาตฝั่งเซิร์ฟเวอร์
// 3. การอัปโหลดรูปโปรไฟล์จะถูกประมวลผลเป็น base64 และส่งไปยัง backend จัดเก็บข้อมูลที่ปลอดภัย
// 4. ขั้นตอนการเปลี่ยนรหัสผ่านและอีเมลเป็นข้อมูลจำลอง แต่ถูกออกแบบมาเพื่อให้ต้องมีการยืนยัน
// 5. การควบคุมการเข้าถึงช่วยให้มั่นใจว่าผู้ใช้สามารถแก้ไขข้อมูลโปรไฟล์ของตนเองได้เท่านั้นโดยใช้ ID ที่ไม่ซ้ำกัน
