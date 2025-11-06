"use client";

const LINKS = [
  { href: "#admin-registrations", label: "Inscripciones", emoji: "🗒" },
  { href: "#admin-collaborators", label: "Colaboradores", emoji: "🌟" },
  { href: "#admin-proposals", label: "Propuestas", emoji: "💬" },
];

export default function MobileAdminNav() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    <nav className="mobile-nav md:hidden" aria-label="Atajos panel admin">
      {LINKS.map((item) => (
        <a key={item.href} href={item.href} className="mobile-nav__link">
          <span aria-hidden="true" className="mobile-nav__icon">
            {item.emoji}
          </span>
          <span className="mobile-nav__label">{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
