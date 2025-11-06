"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "#registro", label: "Apúntate", emoji: "📝" },
  { href: "#colaboradores", label: "Colaboradores", emoji: "🌟" },
  { href: "#ediciones", label: "Ediciones", emoji: "🎉" },
  { href: "#contacto", label: "Contacto", emoji: "🤝" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (!isHome) {
    return null;
  }

  return (
    <nav className="mobile-nav md:hidden" aria-label="Navegación principal">
      {LINKS.map((item) => (
        <Link key={item.href} href={item.href} className="mobile-nav__link">
          <span aria-hidden="true" className="mobile-nav__icon">
            {item.emoji}
          </span>
          <span className="mobile-nav__label">{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
