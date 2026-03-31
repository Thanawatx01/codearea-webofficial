import { CodeAreaLogo } from "@/components/branding/CodeAreaLogo";
import Link from "next/link";

export function Footer() {
  return (
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
  );
}
