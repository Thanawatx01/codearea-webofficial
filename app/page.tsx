import ScrollRevealSection from "@/components/home/ScrollRevealSection";
import { Icon } from "@/components/icons/Icon";
import { api } from "@/lib/api";
import { cookies } from "next/headers";
import Link from "next/link";

const aiGuidanceImage = "/asset/ai_human.jpeg";

type MissionDifficulty = "HARD" | "MEDIUM" | "EASY";
type ApiDifficulty = 1 | 2 | 3;
type TrendingMission = {
  code: string;
  title: string;
  difficulty: MissionDifficulty;
  description: string | null;
  points: number;
};

type TrendingQuestion = {
  code: string;
  title: string;
  description: string | null;
  difficulty: ApiDifficulty;
  points: number;
};

function mapApiDifficulty(difficulty: ApiDifficulty): MissionDifficulty {
  if (difficulty === 1) return "EASY";
  if (difficulty === 2) return "MEDIUM";
  return "HARD";
}

async function getTrendingMissions(): Promise<TrendingMission[]> {
  const response = await api.get<{ data?: TrendingQuestion[] }>(
    "/questions/trending",
    {
      cache: "no-store",
    },
  );

  if (!response.ok || !response.data?.data?.length) {
    return [];
  }

  return response.data.data.map((question) => ({
    code: question.code,
    title: question.title,
    difficulty: mapApiDifficulty(question.difficulty),
    description: question.description,
    points: question.points,
  }));
}

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const roleId = Number(cookieStore.get("role_id")?.value || 0);
  const isLoggedIn = Boolean(token);
  const showDashboard = roleId === 2;
  const missions = await getTrendingMissions();

  return (
    <main className="w-full flex flex-col items-center py-16 md:py-20 lg:py-24">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-20 lg:px-40 xl:px-60 lg:space-y-45 sm:space-y-30">
        <ScrollRevealSection className="text-center rounded-3xl p-8">
          <p className="inline-flex items-center gap-2 mb-6 rounded-full border border-blue-400 px-4 py-1 text-xs font-semibold tracking-wide text-blue-400">
            <Icon name="rocket" className="h-4 w-4 text-blue-400" />
            ระบบเวอร์ชัน 1.0.0 พร้อมใช้งานแล้ว
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-tight tracking-tight">
            ยินดีต้อนรับสู่{" "}
            <span className="bg-linear-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              ประตูสู่
            </span>{" "}
            <span className="text-white">อนาคตแห่งการเขียนโค้ด</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-3xl mx-auto">
            ยกระดับศักยภาพด้านวิศวกรรมของคุณด้วยสภาพแวดล้อมที่มี AI ช่วยเสริม
            สนามฝึกแข่งขันที่สมจริง และเครือข่ายนักพัฒนาชั้นนำจากทั่วโลก
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/questions"
                  className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-8 py-3 text-xl font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.45)] transition hover:brightness-110"
                >
                  เริ่มทำโจทย์
                </Link>
                {showDashboard ? (
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-xl font-semibold text-white transition hover:bg-white/20"
                  >
                    ไปที่แดชบอร์ด
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/register"
                className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-8 py-3 text-xl font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.45)] transition hover:brightness-110"
              >
                เริ่มต้นตอนนี้
              </Link>
            )}
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection className="mt-14 grid gap-6 lg:grid-cols-3 rounded-3xl ">
          {/* Real-Time AI Guidance - 2/3 width */}
          <article className="lg:col-span-2 overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-6">
            <div className="grid items-stretch gap-5 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
                  <Icon name="feature-1" className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-2xl font-semibold sm:text-3xl">
                  AI แนะนำแบบเรียลไทม์
                </h3>
                <p className="text-base text-white/70 sm:text-lg">
                  ผู้ช่วยอัจฉริยะจะวิเคราะห์แนวทางการเขียนโค้ดของคุณและให้คำแนะนำ
                  โดยไม่เฉลยคำตอบตรงๆ
                </p>
              </div>
              <div
                className="min-h-[220px] rounded-2xl bg-cover bg-center md:min-h-[280px]"
                style={{ backgroundImage: `url(${aiGuidanceImage})` }}
              />
            </div>
          </article>

          {/* Algorithm Practice - 1/3 width */}
          <article className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
              <Icon name="feature-2" className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-semibold">ฝึกโจทย์อัลกอริทึม</h3>
            <p className="mt-2 text-lg text-white/70">
              ฝึกทำโจทย์ที่คัดสรรมาเป็นลำดับ
              เพื่อพัฒนาความแม่นยำด้านโครงสร้างข้อมูลและการปรับประสิทธิภาพ
            </p>
          </article>

          {/* Seamless Ecosystem - 1/3 width (bottom-left) */}
          <article className="lg:col-span-1 rounded-3xl border py-12 border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
              <Icon name="feature-3" className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-semibold">
              ระบบนิเวศที่เชื่อมต่อไร้รอยต่อ
            </h3>
            <p className="mt-2 text-lg text-white/70">
              เชื่อมต่อกับ GitHub, VS Code และระบบ API ต่างๆ
              เพื่อเวิร์กโฟลว์การเขียนโค้ดระดับมืออาชีพ
            </p>
          </article>

          {/* Enterprise-Grade Sandboxing - 2/3 width bottom-right */}
          <article className="lg:col-span-2 grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-[#0a0f1f]/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:p-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="text-2xl text-white/70">Sandbox ระดับองค์กร</p>
              <h3 className="mt-2 text-lg font-semibold">
                รันไทม์แยกส่วน รองรับมากกว่า 40 ภาษา พร้อมโหมดเคอร์เนลที่ปลอดภัย
              </h3>
              <p className="mt-3 text-sm text-white/70">
                ทีมพัฒนาชั้นนำไว้วางใจ เพื่อการประเมินผลที่ปลอดภัยและขยายระบบได้
              </p>
              <div className="mt-4 text-xs text-white/50">
                คะแนนเฉลี่ย 4.9 จากฟีดแบ็กคลัสเตอร์แบบเรียลไทม์
              </div>
            </div>
            <div className="w-full max-w-[320px] justify-self-start rounded-2xl border border-cyan-300/15 bg-black p-3 shadow-[0_10px_30px_rgba(0,0,0,0.65)] md:col-span-2 md:justify-self-end">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-cyan-400" />
                <span className="h-3 w-3 rounded-full bg-indigo-300" />
              </div>
              <div className="font-mono text-sm leading-relaxed text-cyan-300/90 sm:text-base">
                <p>$ docker run codearea-v4</p>
                <p>&gt; กำลังเริ่มต้นเคอร์เนล...</p>
                <p>&gt; แยกเครือข่ายเรียบร้อย</p>
                <p>&gt; พร้อมใช้งาน</p>
              </div>
            </div>
          </article>
        </ScrollRevealSection>

        <ScrollRevealSection className="mt-16 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">โจทย์ยอดนิยม</h2>
            <Link
              href="/dashboard/problems"
              className="text-sm text-primary hover:text-white"
            >
              ดูโจทย์ทั้งหมด
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {missions.map((mission) => {
              const difficultyColors = {
                HARD: "text-rose-300 border-rose-300/40 bg-rose-500/10",
                MEDIUM: "text-cyan-300 border-cyan-300/40 bg-cyan-500/10",
                EASY: "text-emerald-300 border-emerald-300/40 bg-emerald-500/10",
              };
              const difficultyLabels = {
                HARD: "ยาก",
                MEDIUM: "ปานกลาง",
                EASY: "ง่าย",
              };
              return (
                <div
                  key={mission.title}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/90 via-slate-900/80 to-indigo-950/60 p-6 shadow-[0_12px_36px_rgba(4,8,28,0.38)] transition duration-300 hover:border-white/20 hover:shadow-[0_16px_42px_rgba(7,10,35,0.45)]"
                >
                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${difficultyColors[mission.difficulty]}`}
                      >
                        {difficultyLabels[mission.difficulty]}
                      </span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/55">
                        โจทย์แนะนำ
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight text-white">
                      {mission.title}
                    </h3>
                    <p className="mt-3 min-h-12 text-sm leading-relaxed text-white/65">
                      {mission.description ?? "ยังไม่มีคำอธิบายโจทย์"}
                    </p>
                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                      <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/35 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-100">
                        <Icon name="feature-2" className="h-3.5 w-3.5" />
                        <span>{mission.points} คะแนน</span>
                      </div>
                      <Link
                        href={`/questions/${mission.code}`}
                        className="text-xs font-semibold text-white/70 transition hover:text-white"
                      >
                        ดูรายละเอียด
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollRevealSection>

        {!isLoggedIn ? (
          <ScrollRevealSection className="mt-16 rounded-3xl py-12 border border-white/10 bg-linear-to-r from-violet-900/20 via-blue-950/15 to-sky-900/20 p-8 text-center">
            <h2 className="text-2xl font-bold">
              พร้อมก้าวข้ามขีดจำกัดของคุณหรือยัง?
            </h2>
            <p className="mt-2 text-white/70">
              เข้าร่วมกับนักพัฒนากว่า 10,000 คน ที่กำลังขยายขอบเขตความเป็นไปได้
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(139,92,246,0.45)] hover:brightness-110 transition"
            >
              สร้างบัญชีฟรี
            </Link>
          </ScrollRevealSection>
        ) : null}
      </div>
    </main>
  );
}
