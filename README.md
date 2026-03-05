# Code Area

Code Area คือระบบสำหรับฝึกทำโจทย์ **Algorithm และ Data Structure** คล้ายกับ LeetCode หรือ HackerRank  
โดยระบบจะสามารถ **รันโค้ด ตรวจคำตอบด้วย Test Case และใช้ AI ช่วยอธิบายแนวคิดในการแก้โจทย์**

โปรเจคนี้พัฒนาด้วย **Next.js (Frontend) + Node.js (Backend)** และมีระบบ **Code Judge + AI Feedback**

---

# Tech Stack

## Frontend
- Next.js
- React
- TailwindCSS

## Backend
- Node.js
- Express / API Routes

## Database
- PostgreSQL หรือ MySQL

## Code Judge
- Docker Sandbox
- Compile และ Run code แบบแยก process

## AI Integration
- ใช้ AI ช่วย
  - อธิบาย Algorithm
  - Review Code
  - แนะนำ Optimization

---

# Core Features

## 1. Coding Problem System

ผู้ใช้สามารถเลือกโจทย์และเขียนโค้ดเพื่อแก้ปัญหา

ข้อมูลของโจทย์ประกอบด้วย

- Title
- Description
- Constraints
- Difficulty
- Time Limit
- Memory Limit
- Tags

---

## 2. Test Case Judge

ระบบจะนำโค้ดของผู้ใช้ไปรันกับ Test Case

ประเภทของ Test Case

- Sample Test Case (แสดงให้ผู้ใช้เห็น)
- Hidden Test Case (ใช้ตรวจตอน submit)

ผลลัพธ์ที่เป็นไปได้

- Accepted
- Wrong Answer
- Time Limit Exceeded
- Runtime Error
- Compile Error

---

## 3. Submission History

ผู้ใช้สามารถดูประวัติการ submit ได้

ข้อมูลที่เก็บ เช่น

- Code ที่ submit
- ภาษาโปรแกรม
- Run time
- Memory used
- Status ของแต่ละ Test Case

---

## 4. AI Explanation

ระหว่างทำโจทย์ ผู้ใช้สามารถถาม AI เพื่อช่วยอธิบายแนวคิด

AI จะช่วย

- อธิบาย algorithm แบบ step-by-step
- อธิบาย logic ของโจทย์
- แนะนำแนวคิดในการแก้ปัญหา

โดย **AI จะไม่แสดงเฉลยเป็น code โดยตรง**

---

## 5. AI Code Review

หลังจาก submit แล้ว AI จะสามารถช่วย

- วิเคราะห์ code
- แนะนำ best practice
- แนะนำวิธีลด Time Complexity
- แนะนำวิธีปรับปรุง Memory usage

---

## 6. Compare Submissions

ผู้ใช้สามารถกลับมาทำโจทย์เดิมได้อีกครั้ง

ระบบจะสามารถ

- เปรียบเทียบ submission ปัจจุบันกับ submission ก่อนหน้า
- วิเคราะห์ว่าดีขึ้นหรือแย่ลงอย่างไร
- แนะนำวิธีปรับปรุง

---

# Database Design

ตารางหลักของระบบ

- users
- questions
- question_categories
- tags
- question_tag
- test_cases
- submissions
- submission_test_cases
- languages
- ai_feedback

ระบบถูกออกแบบให้รองรับ

- Multiple test cases
- Multi-language execution
- AI feedback ต่อ submission

---

# Project Goals

โปรเจคนี้มีเป้าหมายเพื่อ

- สร้างแพลตฟอร์มฝึกเขียน algorithm
- ช่วยให้ผู้ใช้เข้าใจ algorithm มากขึ้น
- ใช้ AI เป็นผู้ช่วยในการเรียนรู้
- สร้างระบบ judge ที่คล้ายกับระบบจริง

---

# Future Improvements

- Contest Mode
- Ranking System
- Discussion System
- AI Hint System
- Visualization Algorithm
