'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../data/products';
import { useStore } from '../context/StoreContext';

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();

  return (
    <div className="group rounded-xl border border-border bg-card overflow-hidden flex flex-col transition-all hover:border-fg/30 hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block relative aspect-square bg-bg/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded bg-bg/90 text-fg border border-border/80">
          {product.category.replace('-', ' ')}
        </span>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-muted mb-1">
            <span className="flex items-center gap-1 font-medium">
              ★ {product.rating}
            </span>
            <span className="text-[10px]">({product.reviewsCount} reviews)</span>
          </div>

          <Link href={`/product/${product.id}`}>
            <h3 className="font-heading font-bold text-sm text-fg group-hover:text-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-border flex items-center justify-between">
          <span className="font-heading font-extrabold text-base text-fg">
            ${product.price}
          </span>
          <button
            onClick={() => addToCart(product, 1)}
            id={`add-to-cart-${product.id}`}
            className="px-3 py-1.5 rounded bg-fg text-bg text-xs font-semibold hover:opacity-90 active:scale-95 transition-all btn-tactile"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
