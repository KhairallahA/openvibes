"use client";

import { useTheme, useMounted } from "@/lib/stores";
import { IconMoon, IconSun } from "./icons";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const mounted = useMounted();
  const label = mounted && theme === "light" ? "Switch to dark mode" : "Switch to light mode";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid size-9 place-items-center rounded-full border border-line text-muted transition hover:border-line-2 hover:text-ink"
    >
      {mounted && theme === "light" ? <IconMoon /> : <IconSun />}
    </button>
  );
}
