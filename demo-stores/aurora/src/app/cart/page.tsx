'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

export default function CartPage() {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    appliedDiscount,
    applyDiscountCode,
    removeDiscountCode,
  } = useStore();

  const [inputCode, setInputCode] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    const res = applyDiscountCode(inputCode);
    setFeedback({ text: res.message, isError: !res.success });
  };

  const discountAmount = appliedDiscount
    ? (cartSubtotal * appliedDiscount.percent) / 100
    : 0;
  const grandTotal = Math.max(0, cartSubtotal - discountAmount);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-fg tracking-tight">
          Your Shopping Cart
        </h1>
        {cart.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs text-muted hover:text-fg underline"
          >
            Clear All
          </button>
        )}
      </div>

      {cart.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-2xl bg-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center font-bold text-lg">
            0
          </div>
          <h2 className="text-lg font-heading font-bold text-fg">Your cart is currently empty</h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Discover precision goods tailored for athletic conditioning, calm home living, and workspace efficiency.
          </p>
          <Link
            href="/shop"
            className="inline-flex px-6 py-2.5 rounded-lg bg-fg text-bg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-bg border border-border overflow-hidden p-1 flex-shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <Link
                      href={`/product/${product.id}`}
                      className="font-heading font-bold text-sm text-fg hover:text-accent transition-colors"
                    >
                      {product.name}
                    </Link>
                    <div className="text-xs text-muted mt-0.5">
                      ${product.price} each · {product.category.replace('-', ' ')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-border rounded-md bg-bg">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-xs text-fg hover:bg-fg/5"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-xs font-bold text-fg">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-xs text-fg hover:bg-fg/5"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal & Delete */}
                  <div className="text-right">
                    <div className="font-heading font-bold text-sm text-fg">
                      ${product.price * quantity}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-[11px] text-muted hover:text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card space-y-5">
              <h2 className="font-heading font-bold text-base text-fg border-b border-border pb-3">
                Order Summary
              </h2>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="font-medium text-fg">${cartSubtotal.toFixed(2)}</span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-accent font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>Promo ({appliedDiscount.code})</span>
                      <button
                        onClick={removeDiscountCode}
                        className="text-[10px] text-muted hover:text-fg"
                      >
                        [✕]
                      </button>
                    </div>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted">
                  <span>Estimated Shipping</span>
                  <span className="text-accent font-medium">Free</span>
                </div>

                <div className="pt-3 border-t border-border flex justify-between items-baseline">
                  <span className="font-heading font-bold text-sm text-fg">Total</span>
                  <span className="font-heading font-extrabold text-xl text-fg" id="cart-grand-total">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo code form */}
              <form onSubmit={handleApply} className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Discount code (e.g. FIT20)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-bg text-fg placeholder:text-muted text-xs uppercase focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="submit"
                    id="apply-coupon-btn"
                    className="px-3.5 py-1.5 rounded-lg bg-fg text-bg text-xs font-semibold hover:opacity-90"
                  >
                    Apply
                  </button>
                </div>
                {feedback && (
                  <p
                    id="discount-feedback"
                    className={`text-[11px] ${
                      feedback.isError ? 'text-red-500' : 'text-accent'
                    }`}
                  >
                    {feedback.text}
                  </p>
                )}
              </form>

              <Link
                href="/checkout"
                id="cart-checkout-btn"
                className="w-full py-3.5 rounded-xl bg-accent text-bg font-heading font-bold text-sm text-center block hover:opacity-90 transition-opacity shadow-md btn-tactile"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
