import React from 'react';
import Link from 'next/link';
import { headers } from 'next/headers';
import { VibeSlot } from '@vibe/react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { InstallShowcase } from '../components/InstallShowcase';
import { getAuroraSiteConfig } from '../lib/site-config';

export default async function HomePage() {
  const headersList = await headers();
  const vibeSlug = headersList.get('x-aurora-vibe') || null;
  const siteConfig = await getAuroraSiteConfig();
  const activeCreator = vibeSlug && siteConfig.creators[vibeSlug] ? siteConfig.creators[vibeSlug] : null;

  // Reorder featured products to prioritize creator's category
  const sortedProducts = [...PRODUCTS].sort((a, b) => {
    if (activeCreator) {
      const aAffinity = a.vibeAffinity.includes(activeCreator.slug) || a.category === activeCreator.category;
      const bAffinity = b.vibeAffinity.includes(activeCreator.slug) || b.category === activeCreator.category;
      if (aAffinity && !bAffinity) return -1;
      if (!aAffinity && bAffinity) return 1;
    }
    return b.rating - a.rating;
  });

  const featured = sortedProducts.slice(0, 8);

  return (
    <div style={{ display: 'contents' }}>
    <div className="space-y-16 pb-20">
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 md:pt-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-medium text-muted">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              <span>{activeCreator ? `Curated by ${activeCreator.name}` : 'Aurora Atelier Edit'}</span>
            </div>

            <VibeSlot
              name="headline"
              tag="h1"
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight leading-[1.08] text-fg"
            >
              Deliberate Objects Engineered for Precision Living
            </VibeSlot>

            <VibeSlot
              name="subheadline"
              tag="p"
              className="text-base sm:text-lg text-muted max-w-xl leading-relaxed"
            >
              Tactile home goods, performance conditioning tools, and high-density tech essentials crafted to eliminate daily friction.
            </VibeSlot>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <VibeSlot
                name="cta"
                tag="a"
                href="/shop"
                id="hero-cta-btn"
                className="px-6 py-3.5 rounded bg-accent text-bg font-semibold text-sm hover:opacity-90 transition-all shadow-md btn-tactile inline-flex items-center justify-center gap-2"
              >
                Shop Collection
              </VibeSlot>
              <Link
                href="/shop"
                className="px-5 py-3.5 rounded border border-border text-fg font-medium text-sm hover:bg-card transition-colors inline-flex items-center justify-center"
              >
                Browse All Catalog
              </Link>
            </div>

            {/* Bundle highlight slot */}
            <div className="p-4 rounded-lg bg-card border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
                  Featured Bundle Offer
                </span>
                <VibeSlot
                  name="bundle"
                  tag="div"
                  className="text-xs font-semibold text-fg"
                >
                  Atelier Starter Set · Free Express Dispatch
                </VibeSlot>
              </div>
              <span className="text-xs font-mono font-bold text-accent px-2 py-1 rounded bg-accent/10">
                {activeCreator ? activeCreator.discountCode : 'AURORA10'}
              </span>
            </div>
          </div>

          {/* Right Hero Image Column */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-lg aspect-[4/3] flex items-center justify-center">
              <VibeSlot
                name="hero-image"
                tag="div"
                className="w-full h-full"
                alt="Aurora Hero Showcase"
              >
                <img
                  src={activeCreator?.heroImage || '/images/hero-default.jpg'}
                  alt={activeCreator ? `${activeCreator.name} Showcase` : 'Aurora Store Showcase'}
                  className="w-full h-full object-cover"
                />
              </VibeSlot>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => {
            const isCategoryActive = activeCreator?.category === cat.id;
            return (
              <Link
                key={cat.id}
                href={`/shop?cat=${cat.id}`}
                className={`p-4 rounded-xl border transition-all text-center group ${
                  isCategoryActive
                    ? 'border-accent bg-accent/5 ring-1 ring-accent'
                    : 'border-border bg-card hover:border-fg/40'
                }`}
              >
                <span className="block text-xs font-semibold uppercase tracking-wider text-muted group-hover:text-fg">
                  Collection
                </span>
                <span className="block font-heading font-bold text-sm text-fg mt-1">
                  {cat.label}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-end justify-between border-b border-border pb-4">
          <div>
            <h2 className="text-2xl font-heading font-extrabold text-fg tracking-tight">
              {activeCreator ? `${activeCreator.name}’s Priority Edits` : 'Curated Essentials'}
            </h2>
            <p className="text-xs text-muted mt-1">
              Hand-selected items meeting strict standards for materiality, utility, and form.
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
          >
            <span>View All ({PRODUCTS.length})</span>
            <span>&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* TESTIMONIAL SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 sm:p-12 text-center space-y-4">
          <span className="text-[11px] font-bold text-accent uppercase tracking-widest">
            Verified Creator Endorsement
          </span>
          <VibeSlot
            name="testimonial"
            tag="blockquote"
            className="text-lg sm:text-2xl font-medium text-fg italic max-w-3xl mx-auto leading-relaxed"
          >
            &ldquo;Every piece in the collection combines uncompromised utility with sculptural elegance. Zero fluff.&rdquo;
          </VibeSlot>
          <div className="pt-2 text-xs font-medium text-muted">
            {activeCreator ? (
              <span>
                — {activeCreator.testimonials[0].author}, {activeCreator.testimonials[0].role}
              </span>
            ) : (
              <span>— Atelier Design Guild</span>
            )}
          </div>
        </div>
      </section>
    </div>

    {/* SDK INSTALL SHOWCASE — full-bleed dark section */}
    <InstallShowcase storeHost="http://localhost:3002" />
    </div>
  );
}
