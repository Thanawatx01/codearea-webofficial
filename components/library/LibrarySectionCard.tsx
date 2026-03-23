import type { ReactNode } from "react";

type LibrarySectionCardProps = {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
};

export function LibrarySectionCard({
  id,
  title,
  description,
  children,
}: LibrarySectionCardProps) {
  return (
    <section id={id} className="rounded-xl bg-base-100 p-6 shadow-lg">
      <h2 className="mb-2 text-xl font-semibold text-base-content">{title}</h2>
      {description ? (
        <p className="mb-4 text-sm text-base-content/70">{description}</p>
      ) : null}
      {children}
    </section>
  );
}
