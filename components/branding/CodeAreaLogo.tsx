import { Icon } from "@/components/icons/Icon";

type CodeAreaLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
};

export function CodeAreaLogo({
  className = "flex items-center gap-2.5",
  iconClassName = "h-10 w-10",
  textClassName = "text-xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60",
  showText = false,
}: CodeAreaLogoProps) {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "CodeArea";

  return (
    <div className={className}>
      <Icon name="codearea-logo" className={iconClassName} />
      {showText ? <span className={textClassName}>{appName}</span> : null}
    </div>
  );
}
