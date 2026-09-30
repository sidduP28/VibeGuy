'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { PRODUCTS } from '../../../data/products';
import { useStore } from '../../../context/StoreContext';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const product = PRODUCTS.find((p) => p.id === id);

  const { addToCart, trackStoreEvent } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (product) {
      trackStoreEvent('view_product', {
        productId: product.id,
        productName: product.name,
        price: product.price,
        category: product.category,
      });
    }
  }, [product]);

  if (!product) {
    return notFound();
  }

  const handleAdd = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted flex items-center gap-2">
        <Link href="/" className="hover:text-fg">Home</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-fg">Shop</Link>
        <span>/</span>
        <span className="text-fg font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Product Artwork */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-border bg-card overflow-hidden aspect-square flex items-center justify-center p-6 sm:p-12 shadow-sm">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain max-h-[500px]"
            />
          </div>
        </div>

        {/* Right: Info & Purchase */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-accent/15 text-accent uppercase tracking-wider">
              {product.category.replace('-', ' ')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-fg tracking-tight leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="font-semibold text-fg">★ {product.rating}</span>
              <span>·</span>
              <span>{product.reviewsCount} customer reviews</span>
            </div>
          </div>

          <div className="text-3xl font-heading font-extrabold text-fg">
            ${product.price}
          </div>

          <p className="text-sm text-muted leading-relaxed">
            {product.description}
          </p>

          {/* Vibe Affinity Badge */}
          {product.vibeAffinity.length > 0 && (
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-1.5">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">
                Creator Affinity
              </span>
              <div className="flex flex-wrap gap-1.5">
                {product.vibeAffinity.map((v) => {
                  const label = v.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                  return (
                    <span
                      key={v}
                      className="text-xs font-medium px-2 py-0.5 rounded-full bg-fg text-bg"
                    >
                      ★ Favored by {label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                Quantity
              </span>
              <div className="flex items-center border border-border rounded-lg bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-xs text-fg hover:bg-fg/5"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-fg">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-1.5 text-xs text-fg hover:bg-fg/5"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleAdd}
                id="pdp-add-to-cart-btn"
                className="flex-1 py-3.5 rounded-xl bg-accent text-bg font-heading font-bold text-sm hover:opacity-90 active:scale-98 transition-all shadow-md btn-tactile"
              >
                {added ? 'Added to Cart ✓' : `Add ${quantity} to Cart · $${product.price * quantity}`}
              </button>
              <Link
                href="/cart"
                className="px-5 py-3.5 rounded-xl border border-border text-fg text-xs font-semibold hover:bg-card transition-colors flex items-center justify-center"
              >
                View Cart
              </Link>
            </div>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-border text-xs text-muted">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Free Carbon-Neutral Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>30-Day Atelier Trial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
