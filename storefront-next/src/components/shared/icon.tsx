import { cn } from "@/lib/utils";

interface IconProps {
  name:
    | "coffee"
    | "cart"
    | "calendar"
    | "user"
    | "spark"
    | "cup"
    | "arrow-right"
    | "check"
    | "clock"
    | "map";
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-5 fill-none stroke-current stroke-[1.7]", className)}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {name === "coffee" && (
        <>
          <path d="M4 10h11v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />
          <path d="M15 11h1.5a2.5 2.5 0 0 1 0 5H15" />
          <path d="M7 5c.7.7.7 1.8 0 2.5" />
          <path d="M10 4.5c.9.9.9 2.4 0 3.3" />
        </>
      )}
      {name === "cart" && (
        <>
          <circle cx="9" cy="20" r="1.4" />
          <circle cx="18" cy="20" r="1.4" />
          <path d="M3 4h2l2.1 9.2A2 2 0 0 0 9 15h8.8a2 2 0 0 0 1.9-1.4L21 8H7.1" />
        </>
      )}
      {name === "calendar" && (
        <>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </>
      )}
      {name === "user" && (
        <>
          <circle cx="12" cy="8" r="3.2" />
          <path d="M5 20a7 7 0 0 1 14 0" />
        </>
      )}
      {name === "spark" && (
        <>
          <path d="M12 3l1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2z" />
          <path d="M18.5 15.5l.7 2 .8.2-1.8.6-.6 1.7-.6-1.7-1.8-.6 1.8-.6z" />
        </>
      )}
      {name === "cup" && (
        <>
          <path d="M7 8h10l-.8 8.2a2 2 0 0 1-2 1.8H9.8a2 2 0 0 1-2-1.8z" />
          <path d="M17 9h1.2a2.3 2.3 0 0 1 0 4.6H17" />
          <path d="M9 5c.8.8.8 2 0 2.8" />
        </>
      )}
      {name === "arrow-right" && (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      )}
      {name === "check" && <path d="m5 12 4.2 4.2L19 6.5" />}
      {name === "clock" && (
        <>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {name === "map" && (
        <>
          <path d="M12 21s6-5.6 6-11a6 6 0 1 0-12 0c0 5.4 6 11 6 11Z" />
          <circle cx="12" cy="10" r="2.2" />
        </>
      )}
    </svg>
  );
}
