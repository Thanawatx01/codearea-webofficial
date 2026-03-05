# CodeArea — แพลตฟอร์มโจทย์โปรแกรมมิ่ง

เว็บแอปพลิเคชันสำหรับฝึกฝนการเขียนโค้ดและแก้โจทย์โปรแกรมมิ่ง คล้าย [LeetCode](https://leetcode.com) รองรับการทำโจทย์หลายภาษา การรันเทสเคสอัตโนมัติ และฟีเจอร์ **AI Feedback** สำหรับวิเคราะห์และให้คำแนะนำจากผลการส่งคำตอบ

---

## คุณสมบัติหลัก

- **โจทย์โปรแกรมมิ่ง** — โจทย์แบ่งตามหมวดหมู่ (category) และระดับความยาก (difficulty)
- **แท็กและหมวดหมู่** — จัดกลุ่มโจทย์ด้วย tags และ categories (เช่น Arrays, Dynamic Programming)
- **รันโค้ดและเทสเคส** — ส่งคำตอบแล้วรันกับ test cases อัตโนมัติ (time limit, memory limit)
- **หลายภาษา** — รองรับหลายภาษาการเขียนโปรแกรม (compile/run ตาม config ของแต่ละภาษา)
- **ประวัติการส่ง (Submissions)** — เก็บสถานะ รันไทม์ เมมโมรี และผลต่อเทสเคส
- **AI Feedback** — ฟีดแบ็กจาก AI เกี่ยวกับประสิทธิภาพ ความอ่านง่าย หรือคำใบ้ correctness

---

## สแต็กเทคโนโลยี

| ส่วน | เทคโนโลยี |
|------|------------|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com), [DaisyUI](https://daisyui.com) |
| Code Editor | [Monaco Editor](https://microsoft.github.io/monaco-editor/) (ตัวแก้โค้ดแบบ VS Code) |
| อื่นๆ | TypeScript, SweetAlert2 |

---

## โครงสร้างข้อมูลหลัก (จาก ERD)

- **users** — ผู้ใช้, บทบาท (role)
- **questions** — โจทย์ (code, title, description, difficulty, time/memory limit, solution, status)
- **question_categories** — หมวดหมู่โจทย์ (เช่น Arrays, DP)
- **tags** — แท็ก (เช่น Recursion, Two Pointers)
- **question_tag** — ความสัมพันธ์โจทย์–แท็ก (many-to-many)
- **test_cases** — input/output, ลำดับ, ตัวอย่าง (is_simple)
- **submissions** — การส่งคำตอบ (user, question, language, code, status, run_time, memory_used)
- **submission_test_cases** — ผลรันต่อเทสเคส (output, error, runtime, memory, status)
- **languages** — ภาษาที่รองรับ (compile_cmd, run_cmd)
- **ai_feedback** — ฟีดแบ็กจาก AI ต่อ submission (feedback_type, feedback_content)

---

## โครงสร้างโปรเจค

```
codearea-webofficial/
├── app/
│   ├── globals.css      # สไตล์ส่วนกลาง
│   ├── layout.tsx       # layout หลัก
│   └── page.tsx         # หน้าแรก
├── public/              # สื่อและไฟล์สาธารณะ
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config (via Tailwind v4)
└── tsconfig.json
```

---

## วิธีรันโปรเจค

### ความต้องการของระบบ

- [Node.js](https://nodejs.org) (แนะนำ v20+)
- npm หรือ package manager อื่นที่รองรับ

### ติดตั้งและรัน

```bash
# โคลน repo (ถ้ายังไม่ได้โคลน)
git clone <repository-url>
cd codearea-webofficial

# ติดตั้ง dependencies
npm install

# รันโหมดพัฒนา
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

### สคริปต์ที่มี

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run dev` | รันเซิร์ฟเวอร์พัฒนา (hot reload) |
| `npm run build` | บิลด์สำหรับ production |
| `npm run start` | รันเซิร์ฟเวอร์หลัง build แล้ว |
| `npm run lint` | ตรวจโค้ดด้วย ESLint |

---

## การพัฒนาต่อ

- เชื่อมต่อกับฐานข้อมูล (ตาม ERD) สำหรับ users, questions, submissions ฯลฯ
- พัฒนาหน้าโจทย์ หน้าเขียนโค้ด (Monaco) และระบบส่ง/รันเทสเคส
- เชื่อมระบบ AI สำหรับ `ai_feedback` (performance, readability, correctness hint)
