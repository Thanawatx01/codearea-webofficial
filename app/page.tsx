import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white relative overflow-hidden flex flex-col font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute top-[20%] right-[15%] w-32 h-32 bg-accent-purple/20 rounded-full blur-[60px] pointer-events-none animate-pulse"></div>

      {/* Tech Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none mask-[radial-gradient(ellipse_at_center,black,transparent_80%)]"></div>

      {/* Navigation */}
      <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <CodeAreaLogo
          showText
          iconClassName="h-8 w-8"
          textClassName="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60"
        />

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="h-10 px-6 inline-flex items-center justify-center bg-white/5 border border-white/10 text-sm font-medium rounded-full hover:bg-white/10 transition-all backdrop-blur-sm"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="h-10 px-6 inline-flex items-center justify-center bg-primary text-white text-sm font-medium rounded-full hover:bg-primary-hover transition-all shadow-[0_0_20px_rgba(139,92,246,0.4)]"
          >
            Get Started Now
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col relative z-10 w-full">
        {/* Full-height Hero Container */}
        <div
          className="w-full flex flex-col items-center justify-center px-6"
          style={{ minHeight: "calc(100vh - 80px)" }}
        >
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700">
              Welcome to Your{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/40">
                Gateway
              </span>
              <br />
              to the{" "}
              <span className="text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                Future of Coding
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
              Master algorithms, prepare for interviews, and level up your
              career with the world's most advanced coding ecosystem.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 fill-mode-both">
              <Link
                href="/register"
                className="h-14 px-10 inline-flex items-center justify-center bg-primary text-white text-base font-semibold rounded-full hover:bg-primary-hover transition-all shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95"
              >
                Get Started Now
              </Link>
              <Link
                href="/dashboard/problems"
                className="h-14 px-10 inline-flex items-center justify-center bg-white/5 border border-white/10 text-white text-base font-semibold rounded-full hover:bg-white/10 transition-all backdrop-blur-md"
              >
                Enter Dashboard
              </Link>
            </div>

            {/* Sub-hero glow element */}
            <div className="w-full max-w-4xl h-[100px] md:h-[200px] bg-primary/20 rounded-[100%] blur-[100px] absolute -bottom-10 left-1/2 -translate-x-1/2 pointer-events-none opacity-40"></div>
          </div>
        </div>

        {/* Features Preview - Modern Cards */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-6 pb-20 mt-12 md:mt-24 relative z-10">
          {[
            {
              title: "Real-Time Tracking",
              desc: "Stay informed about your progress with real-time analytics and performance metrics.",
              icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
            },
            {
              title: "AI-Powered Previews",
              desc: "Get intelligent feedback and pattern analysis on your solutions using our advanced engine.",
              icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.9-.4-2.593-1.003L8.86 17.2z",
            },
            {
              title: "Ecosystem Integration",
              desc: "Connect with GitHub, VS Code, and other popular developer tools seamlessly.",
              icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group p-8 rounded-4xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300 backdrop-blur-xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={feature.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-white/40 leading-relaxed text-sm">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full py-12 px-6 flex flex-col md:flex-row items-center justify-between border-t border-white/5 relative z-10 bg-[#0B0B0F]">
        <CodeAreaLogo
          showText
          className="mb-4 md:mb-0 flex items-center gap-2"
          iconClassName="h-6 w-6"
          textClassName="text-sm font-bold text-white/80"
        />
        <div className="flex gap-8 text-xs text-white/30">
          <Link href="#" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Terms of Use
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            Cookie Settings
          </Link>
        </div>
        <p className="text-[10px] text-white/20 mt-4 md:mt-0 uppercase tracking-widest font-medium">
          &copy; {new Date().getFullYear()} CodeArea. Global Coding Standard.
        </p>
      </footer>
    </div>
  );
}
