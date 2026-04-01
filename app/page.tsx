import ScrollRevealSection from "@/components/home/ScrollRevealSection";
import { Icon } from "@/components/icons/Icon";
import Link from "next/link";

const codeImage = "/asset/code.jpeg";
const aiGuidanceImage = "/asset/ai_human.jpeg";

type MissionDifficulty = "HARD" | "MEDIUM" | "EASY";

const trendingMissions = [
  {
    title: "Recursive Vault Breach",
    difficulty: "HARD" as MissionDifficulty,
    description:
      "Design memory-safe recursive exploitation with monitored performance.",
    points: 500,
    bgImage: codeImage,
  },
  {
    title: "Neural Path Finder",
    difficulty: "MEDIUM" as MissionDifficulty,
    description: "Find optimal paths with heuristics in massive graphs.",
    points: 300,
    bgImage: codeImage,
  },
  {
    title: "Binary Star Search",
    difficulty: "EASY" as MissionDifficulty,
    description:
      "Mini-mize runtime for binary coordinate search over 1M nodes.",
    points: 150,
    bgImage: codeImage,
  },
];

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center py-16 md:py-20 lg:py-24">
      <div className="relative z-10 w-full px-4 sm:px-6 md:px-20 lg:px-40 xl:px-60 lg:space-y-45 sm:space-y-30">
        <ScrollRevealSection className="text-center rounded-3xl p-8">
          <p className="inline-flex items-center gap-2 mb-6 rounded-full border border-blue-400 px-4 py-1 text-xs font-semibold tracking-wide text-blue-400">
            <Icon name="rocket" className="h-2 w-2 text-blue-400" />
            SYSTEM VERSION 1.0.0 NOW LIVE
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-tight tracking-tight">
            Welcome to Your{" "}
            <span className="bg-linear-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Gateway
            </span>{" "}
            to the
            <span className="text-white"> Future of Coding</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-3xl mx-auto">
            Elevate your engineering potential with AI-augmented environments,
            hyper-realistic competitive arenas, and a global network of elite
            architects.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.45)] transition hover:brightness-110"
            >
              Get Started Now
            </Link>
            <Link
              href="/dashboard/problems"
              className="rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Enter Dashboard
            </Link>
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
                  Real-Time AI Guidance
                </h3>
                <p className="text-base text-white/70 sm:text-lg">
                  Our neural co-pilot analyzes your code path and offers
                  insights without spoiling the solution.
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
            <h3 className="text-2xl font-semibold">Algorithm Practice</h3>
            <p className="mt-2 text-lg text-white/70">
              Solve curated challenge chains to build mastery in data structures
              and optimization.
            </p>
          </article>

          {/* Seamless Ecosystem - 1/3 width (bottom-left) */}
          <article className="lg:col-span-1 rounded-3xl border py-12 border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
              <Icon name="feature-3" className="h-5 w-5" />
            </div>
            <h3 className="text-2xl font-semibold">Seamless Ecosystem</h3>
            <p className="mt-2 text-lg text-white/70">
              Integrate with GitHub, VS Code, and system APIs for professional
              coding workflow.
            </p>
          </article>

          {/* Enterprise-Grade Sandboxing - 2/3 width bottom-right */}
          <article className="lg:col-span-2 grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-[#0a0f1f]/80 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.4)] sm:p-6 md:grid-cols-5">
            <div className="md:col-span-3">
              <p className="text-2xl text-white/70">
                Enterprise-Grade Sandboxing
              </p>
              <h3 className="mt-2 text-lg font-semibold">
                Isolated runtimes, 40+ languages, secure kernel mode.
              </h3>
              <p className="mt-3 text-sm text-white/70">
                Trusted by top dev teams for safe and scalable evaluation.
              </p>
              <div className="mt-4 text-xs text-white/50">
                Rated 4.9 based on real-time cluster feedback
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
                <p>&gt; Initializing kernel...</p>
                <p>&gt; Network isolated.</p>
                <p>&gt; Ready.</p>
              </div>
            </div>
          </article>
        </ScrollRevealSection>

        <ScrollRevealSection className="mt-16 rounded-3xl p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Trending Missions</h2>
            <Link
              href="/dashboard/problems"
              className="text-sm text-primary hover:text-white"
            >
              View All Challenges
            </Link>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {trendingMissions.map((mission) => {
              const difficultyColors = {
                HARD: "text-red-600",
                MEDIUM: "text-cyan-500",
                EASY: "text-gray-500",
              };
              return (
                <div
                  key={mission.title}
                  className="group rounded-3xl overflow-hidden shadow-[0_0px_100px_rgba(0,0,0,0.9),0_0_70px_rgba(255,255,255,0.3)] backdrop-blur-md"
                >
                  {/* Top Half - Image Section */}
                  <div
                    className="h-48 relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${mission.bgImage})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Dark overlay with binary pattern effect */}
                    <div className="absolute inset-0 bg-linear-to-b from-slate-900/70 via-slate-900/50 to-slate-900/80 flex items-center justify-center opacity-80 group-hover:opacity-70 transition">
                      <div className="text-center text-slate-600/50 text-xs font-mono tracking-wider">
                        <div>0110 1001 0101</div>
                        <div className="mt-1">101 010 11</div>
                        <div className="mt-1">1001 0110</div>
                      </div>
                    </div>

                    {/* Difficulty Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-block text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border ${difficultyColors[mission.difficulty]} border-opacity-40 bg-slate-900/40 backdrop-blur-sm`}
                      >
                        {mission.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Half - Content Section */}
                  <div className="p-6 bg-slate-950/60 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white uppercase tracking-wide leading-tight">
                      {mission.title}
                    </h3>
                    <p className="mt-3 text-sm text-white/70 leading-relaxed">
                      {mission.description}
                    </p>
                    <div className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs text-white shadow-sm shadow-white/30 hover:border-white/40 hover:bg-white/10 hover:shadow-[0_0_16px_rgba(255,255,255,0.35)]">
                      <span>{mission.points} pts</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollRevealSection>

        <ScrollRevealSection className="mt-16 rounded-3xl py-12 border border-white/10 bg-linear-to-r from-violet-900/20 via-blue-950/15 to-sky-900/20 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to Rewrite Your Limits?</h2>
          <p className="mt-2 text-white/70">
            Join 10k+ developers pushing the boundaries of what&apos;s possible.
          </p>
          <Link
            href="/register"
            className="mt-5 inline-flex items-center justify-center rounded-full bg-linear-to-r from-purple-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(139,92,246,0.45)] hover:brightness-110 transition"
          >
            Create Your Free Account
          </Link>
        </ScrollRevealSection>
      </div>
    </main>
  );
}
