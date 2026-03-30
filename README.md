# CodeArea — Frontend (Official Web)

เว็บแอปพลิเคชันส่วนหน้าสำหรับ CodeArea แพลตฟอร์มฝึกฝนการเขียนโค้ด พัฒนาด้วย Next.js และ Tailwind CSS ออกแบบมาให้มีความทันสมัยและตอบสนองได้ดีเยี่ยม (Responsive)

## 📂 Project Structure

```text
frontend/
├── app/                  # Next.js App Router (หน้าเว็บและ Layout)
│   ├── (auth)/           # หน้าเข้าสู่ระบบและสมัครสมาชิก
│   ├── questions/        # หน้าจัดรายการโจทย์และหน้าทำโจทย์
│   └── globals.css       # สไตล์ส่วนกลาง (Tailwind v4)
├── components/           # คอมโพเนนต์ที่นำมาใช้ซ้ำได้
│   ├── editor/           # ทุกส่วนประกอบที่เกี่ยวกับ Editor (Monaco, Markdown, Executor)
│   ├── layout/           # ส่วนประกอบหลัก (Navbar, Footer, Sidebar)
│   └── ui/               # องค์ประกอบพื้นฐาน (Buttons, Cards, Modals)
├── lib/                  # ห้องสมุดและเครื่องมือช่วย
│   ├── api.ts            # การเชื่อมต่อกับ Backend API
│   ├── judge0.ts         # การจัดการ Code Execution
│   └── utils.ts          # ฟังก์ชันช่วยเหลือทั่วไป
├── public/               # ไฟล์รูปภาพและสื่อต่างๆ
├── .env.example          # แม่แบบไฟล์ตั้งค่าตัวแปรสภาพแวดล้อม
├── next.config.ts        # การตั้งค่า Next.js
└── package.json          # รายการไลบรารีและคำสั่งรันระบบ
```

## 🛠️ Requirements

| Requirement | Badge | Description |
| :--- | :--- | :--- |
| **Next.js** | ![NextJS](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white) | Framework หลัก (v16 App Router) |
| **React** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) | UI Library (v19) |
| **Tailwind** | ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) | ระบบกำหนดสไตล์ (v4) |
| **Monaco** | ![Monaco Editor](https://img.shields.io/badge/Monaco%20Editor-0078d4?style=for-the-badge&logo=visual-studio-code&logoColor=white) | ตัวแก้ไขโค้ดระดับแนวหน้า (VS Code Engine) |
| **DaisyUI** | ![DaisyUI](https://img.shields.io/badge/daisyui-5ad7ff?style=for-the-badge&logo=daisyui&logoColor=white) | Library สำหรับ UI Components |
| **Node.js** | ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) | Runtime แนะนำ v18 ขึ้นไป |

---

## 📖 Setup Guide

ทำตามขั้นตอนด้านล่างเพื่อเริ่มรันโปรเจคในเครื่อง (Local Development):

1.  **ติดตั้ง Dependencies**:
    ```bash
    npm install
    ```

2.  **ตั้งค่า Environment**:
    คัดลอกไฟล์แม่แบบและตรวจสอบค่า URL ของ Backend:
    ```bash
    cp .env.example .env
    ```
    *หมายเหตุ: ตรวจสอบให้มั่นใจว่า `NEXT_PUBLIC_API_URL` ตรงกับพอร์ตที่ Backend รันอยู่*

3.  **เริ่มต้นรันระบบ**:
    ```bash
    npm run dev
    ```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000) (หรือพอร์ตอื่นๆ ที่ระบบแจ้ง)

---

## 📜 คำสั่งที่ใช้งานบ่อย (Available Scripts)

- `npm run dev`: เริ่มต้นรันเซิร์ฟเวอร์ในโหมดพัฒนา (Hot Reload)
- `npm run build`: จัดเตรียมแอปพลิเคชันสำหรับใช้งานจริง (Production)
- `npm run start`: รันแแอปพลิเคชันที่ผ่านการ Build แล้ว
- `npm run lint`: ตรวจสอบความถูกต้องและคุณภาพของโค้ดด้วย ESLint

## 💻 Tech Stack
<p align="left">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nextjs,react,tailwind,ts,nodejs,vscode,postman,docker" />
  </a>
</p>

---

## ✨ คุณสมบัติเด่น (Features)
- 📝 **Monaco Editor Integration**: ![Badge](https://img.shields.io/badge/Monaco%20Editor-0078d4?style=flat-square&logo=visual-studio-code&logoColor=white) ใช้งาน Engine เดียวกับ VS Code
- 💅 **Modern UI with DaisyUI**: ![Badge](https://img.shields.io/badge/daisyui-5ad7ff?style=flat-square&logo=daisyui&logoColor=white) สวยงาม รวดเร็ว และรองรับธีมที่หลากหลาย
- ⚡ **Next.js App Router**: ![Badge](https://img.shields.io/badge/next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white) ระบบ Route ที่ทันสมัยและรองรับ Server Components
