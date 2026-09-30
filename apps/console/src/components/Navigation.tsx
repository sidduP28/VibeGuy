'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  ['/', 'Overview'],
  ['/campaigns', 'Campaigns'],
  ['/campaigns/new', 'Builder'],
  ['/themes', 'Theme Lab'],
  ['/vibedna', 'VibeDNA'],
  ['/analytics', 'Uplift'],
  ['/installer', 'Installer'],
  ['/extractor', 'Extractor'],
  ['/pilot', 'VibePilot'],
  ['/docs', 'Docs'],
];

export function Navigation() {
  const path = usePathname();
  return (
    <aside className="nav">
      <div className="brand">
        Vibe<span>Personalize</span>
      </div>
      <nav aria-label="Console">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="nav-meta">
        Hackzen 2026 · Topic 13
        <br />
        G1–G5 live
      </div>
    </aside>
  );
}
