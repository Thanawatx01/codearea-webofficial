import type { LibrarySectionItem } from "@/components/library/types";

type LibrarySidebarProps = {
  sections: LibrarySectionItem[];
};

export function LibrarySidebar({ sections }: LibrarySidebarProps) {
  return (
    <aside className="h-fit rounded-xl bg-base-100 p-4 shadow-lg lg:sticky lg:top-6">
      <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-widest text-base-content/50">
        Library Sections
      </p>
      <nav className="space-y-1">
        {sections.map((section) => (
          <a
            key={section.id}
            href={`#${section.id}`}
            className="block rounded-lg px-3 py-2 text-sm text-base-content/70 transition hover:bg-base-200 hover:text-base-content"
          >
            {section.title}
          </a>
        ))}
      </nav>
    </aside>
  );
}
