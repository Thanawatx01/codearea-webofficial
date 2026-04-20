/** โค้ดตั้งต้นตาม language_id (Judge0 id ที่ใช้ในโปรเจกต์) */
export const LANGUAGE_BOILERPLATES: Record<number, string> = {
  63: `// JavaScript (Node.js) Hello World
console.log("Hello, World!");`,
  74: `// TypeScript Hello World
const message: string = "Hello, World!";
console.log(message);`,
  76: `// C++ (Clang) Hello World
#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}`,
  71: `# Python 3 Hello World
print("Hello, World!")`,
};

/** ความสูงเอดิเตอร์บนหน้ารายละเอียดโจทย์ (แย่งกับตัวอย่าง) */
export const EDITOR_VIEWPORT_DETAIL = "clamp(220px, 28vh, 400px)";
