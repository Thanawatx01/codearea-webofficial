import ScrollRevealSection from "@/components/home/ScrollRevealSection";
import Link from "next/link";

const featureCards = [
  {
    title: "Real-Time AI Guidance",
    desc: "Our neural co-pilot analyzes your code path and offers insights without spoiling the solution.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
  },
  {
    title: "Algorithm Practice",
    desc: "Solve curated challenge chains to build mastery in data structures and optimization.",
    icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-1.003L8.86 17.2z",
  },
  {
    title: "Seamless Ecosystem",
    desc: "Integrate with GitHub, VS Code, and system APIs for professional coding workflow.",
    icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
  },
];

const trendingMissions = [
  {
    title: "Recursive Vault Breach",
    difficulty: "HARD",
    description:
      "Design memory-safe recursive exploitation with monitored performance.",
    points: 500,
  },
  {
    title: "Neural Path Finder",
    difficulty: "MEDIUM",
    description: "Find optimal paths with heuristics in massive graphs.",
    points: 300,
  },
  {
    title: "Binary Star Search",
    difficulty: "EASY",
    description:
      "Mini-mize runtime for binary coordinate search over 1M nodes.",
    points: 150,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen text-white overflow-x-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25)_0,transparent_45%)] pointer-events-none" />
        {/* Mobile: smaller circles */}
        <div className="absolute -left-20 sm:-left-32 lg:-left-44 top-[-80px] sm:top-[-100px] lg:top-[-120px] h-[280px] w-[280px] sm:h-[240px] sm:w-[240px] lg:h-[600px] lg:w-[600px] rounded-full bg-violet-700/30 blur-3xl" />
        <div className="absolute -right-16 sm:-right-20 lg:right-[-120px] top-20 sm:top-24 lg:top-28 h-[260px] w-[260px] sm:h-[240px] sm:w-[240px] lg:h-[500px] lg:w-[500px] rounded-full bg-blue-600/25 blur-3xl" />
        <div className="absolute -left-20 sm:-left-32 lg:-left-44 top-[800px] sm:top-[1200px] lg:top-[2000px] h-[280px] w-[280px] sm:h-[240px] sm:w-[240px] lg:h-[600px] lg:w-[600px] rounded-full bg-indigo-700/20 blur-3xl" />
        <div className="absolute -right-16 sm:-right-20 lg:right-[-120px] top-[600px] sm:top-[900px] lg:top-[1500px] h-[260px] w-[240px] sm:h-[240px] sm:w-[240px] lg:h-[500px] lg:w-[500px] rounded-full bg-violet-700/25 blur-3xl" />
      </div>

      <main className="w-full flex flex-col items-center pt-16 md:pt-20 lg:pt-24">
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-60 lg:space-y-45 sm:space-y-30">
          <ScrollRevealSection className="text-center rounded-3xl p-8">
            <p className="inline-flex items-center gap-2 mb-6 rounded-full border border-primary px-4 py-1 text-xs font-semibold tracking-wide text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              SYSTEM VERSION 1.0.0 NOW LIVE
            </p>
            <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tight">
              Welcome to Your <span className="text-primary">Gateway</span> to
              the
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
                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_15px_30px_rgba(139,92,246,0.45)] transition hover:brightness-110"
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
            <article className="lg:col-span-2 rounded-3xl border py-12 border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl flex items-center justify-between gap-6">
              <div className="flex-1">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={featureCards[0].icon}
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold mb-2">
                  {featureCards[0].title}
                </h3>
                <p className="text-lg text-white/70">{featureCards[0].desc}</p>
              </div>

              {/* Neural Network SVG Illustration */}
              <svg
                className="w-28 h-28 flex-shrink-0"
                viewBox="0 0 280 280"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background glow */}
                <defs>
                  <filter
                    id="glow"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                      <feMergeNode in="coloredBlur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Head outline */}
                <circle
                  cx="140"
                  cy="100"
                  r="45"
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1.5"
                />

                {/* Brain nodes */}
                <circle cx="120" cy="85" r="4" fill="#8B5CF6" opacity="0.8" />
                <circle cx="140" cy="70" r="5" fill="#8B5CF6" opacity="1" />
                <circle cx="160" cy="85" r="4" fill="#8B5CF6" opacity="0.8" />
                <circle cx="125" cy="110" r="4" fill="#8B5CF6" opacity="0.7" />
                <circle cx="155" cy="110" r="4" fill="#8B5CF6" opacity="0.7" />
                <circle cx="140" cy="120" r="3" fill="#8B5CF6" opacity="0.6" />

                {/* Neural connections */}
                <line
                  x1="120"
                  y1="85"
                  x2="140"
                  y2="70"
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="140"
                  y1="70"
                  x2="160"
                  y2="85"
                  stroke="rgba(139, 92, 246, 0.4)"
                  strokeWidth="1"
                />
                <line
                  x1="120"
                  y1="85"
                  x2="125"
                  y2="110"
                  stroke="rgba(139, 92, 246, 0.35)"
                  strokeWidth="1"
                />
                <line
                  x1="160"
                  y1="85"
                  x2="155"
                  y2="110"
                  stroke="rgba(139, 92, 246, 0.35)"
                  strokeWidth="1"
                />
                <line
                  x1="125"
                  y1="110"
                  x2="140"
                  y2="120"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                />
                <line
                  x1="155"
                  y1="110"
                  x2="140"
                  y2="120"
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="1"
                />

                {/* Body/neck */}
                <rect
                  x="130"
                  y="140"
                  width="20"
                  height="30"
                  fill="none"
                  stroke="rgba(139, 92, 246, 0.2)"
                  strokeWidth="1.5"
                  rx="2"
                />

                {/* Activation pulses */}
                <circle
                  cx="140"
                  cy="70"
                  r="6"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="1"
                  opacity="0.6"
                >
                  <animate
                    attributeName="r"
                    from="6"
                    to="12"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
            </article>

            {/* Algorithm Practice - 1/3 width */}
            <article className="lg:col-span-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={featureCards[1].icon}
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">
                {featureCards[1].title}
              </h3>
              <p className="mt-2 text-lg text-white/70">
                {featureCards[1].desc}
              </p>
            </article>

            {/* Seamless Ecosystem - 1/3 width (bottom-left) */}
            <article className="lg:col-span-1 rounded-3xl border py-12 border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-500/20 text-primary">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={featureCards[2].icon}
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold">
                {featureCards[2].title}
              </h3>
              <p className="mt-2 text-lg text-white/70">
                {featureCards[2].desc}
              </p>
            </article>

            {/* Enterprise-Grade Sandboxing - 2/3 width bottom-right */}
            <article className="lg:col-span-2 flex items-end rounded-3xl border border-white/10 bg-[#0a0f1f]/80 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.4)]">
              <div>
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
              {trendingMissions.map((mission) => (
                <div
                  key={mission.title}
                  className="rounded-2xl border py-12 border-white/10 bg-[#0f1324]/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:border-primary/50 transition"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs uppercase tracking-widest text-white/50">
                      {mission.difficulty}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                      {mission.points} pts
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold">{mission.title}</h3>
                  <p className="mt-2 text-sm text-white/70">
                    {mission.description}
                  </p>
                  <button className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-primary/20 transition">
                    Start Challenge
                  </button>
                </div>
              ))}
            </div>
          </ScrollRevealSection>

          <ScrollRevealSection className="mt-16 rounded-3xl py-12 border border-white/10 bg-gradient-to-r from-violet-900/20 via-blue-950/15 to-sky-900/20 p-8 text-center">
            <h2 className="text-2xl font-bold">
              Ready to Rewrite Your Limits?
            </h2>
            <p className="mt-2 text-white/70">
              Join 10k+ developers pushing the boundaries of what&apos;s
              possible.
            </p>
            <Link
              href="/register"
              className="mt-5 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-8 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(139,92,246,0.45)] hover:brightness-110 transition"
            >
              Create Your Free Account
            </Link>
          </ScrollRevealSection>
        </div>
      </main>
    </div>
  );
}
