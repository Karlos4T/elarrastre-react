"use client";

import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="rounded-[36px] border-4 border-[var(--color-ink)] bg-white px-8 py-6 text-lg font-semibold text-[var(--color-ink)] flex flex-col items-center shadow-[0_12px_0_rgba(27,27,31,0.08)]">
      <p>
        © {new Date().getFullYear()} El Arrastre Solidario · Cultura que abraza, comunidad que
        transforma.
      </p>
      <Link
        href="/admin"
        className="button-secondary flex-1 text-center text-lg mt-8 lg:text-xl max-w-100"
      >
        Ir al panel admin
      </Link>
    </footer>
  );
}
