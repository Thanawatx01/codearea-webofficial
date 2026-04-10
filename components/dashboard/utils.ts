export function pieFillForLabel(
  name: string,
  successGradientId: string,
  failGradientId: string,
): string {
  if (name.includes("ไม่")) return `url(#${failGradientId})`;
  return `url(#${successGradientId})`;
}

export function formatThaiDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
}

export function initials(name: string) {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  }
  return t.charAt(0).toUpperCase();
}
