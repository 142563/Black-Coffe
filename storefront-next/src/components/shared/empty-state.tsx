import type { ReactNode } from "react";
import { Icon } from "@/components/shared/icon";

interface EmptyStateProps {
  icon: Parameters<typeof Icon>[0]["name"];
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <section className="empty-card">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#c6a15b]">
        <Icon name={icon} className="size-7" />
      </div>
      <h2 className="mt-6 text-3xl font-semibold text-white" style={{ fontFamily: "var(--font-display), serif" }}>
        {title}
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-white/62 sm:text-base">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </section>
  );
}
