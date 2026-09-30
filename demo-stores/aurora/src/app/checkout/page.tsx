'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

const VALID_DISCOUNT_CONFIG: Record<string, number> = {
  FIT20: 20,
  CALM15: 15,
  LUXE25: 25,
  TECH10: 10,
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    cartSubtotal,
    appliedDiscount,
    applyDiscountCode,
    clearCart,
    currentUser,
    trackStoreEvent,
  } = useStore();

  const [formData, setFormData] = useState({
    name: currentUser?.name || 'Asha Patel',
    email: currentUser?.email || 'asha@demo.dev',
    address: '742 Evergreen Terrace, Suite 100',
    city: 'San Francisco',
    postalCode: '94107',
  });

  const [promoInput, setPromoInput] = useState(appliedDiscount?.code || '');
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const discountPercent = appliedDiscount ? appliedDiscount.percent : 0;
  const discountAmount = (cartSubtotal * discountPercent) / 100;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoInput.trim().toUpperCase();
    if (!clean) return;

    if (VALID_DISCOUNT_CONFIG[clean]) {
      applyDiscountCode(clean);
      setPromoError('');
    } else {
      setPromoError(`Code "${clean}" is not recognized.`);
    }
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const orderId = `ord_${Math.floor(100000 + Math.random() * 900000)}`;

    // Track purchase event with beacon
    trackStoreEvent('purchase', {
      orderId,
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.price,
        qty: i.quantity,
      })),
      subtotal: cartSubtotal,
      discountCode: appliedDiscount?.code || null,
      discountAmount,
      total: finalTotal,
      customerEmail: formData.email,
    });

    // Clear cart and redirect
    clearCart();
    setTimeout(() => {
      router.push(`/order-success?orderId=${orderId}&total=${finalTotal.toFixed(2)}`);
    }, 600);
  };

  if (cart.length === 0 && !submitting) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-heading font-bold text-fg">Your cart is empty</h1>
        <p className="text-xs text-muted">Add products to your cart before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-block px-5 py-2 rounded-lg bg-fg text-bg text-xs font-semibold"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-fg tracking-tight">
          Express Atelier Checkout
        </h1>
        <p className="text-xs text-muted mt-1">
          Demo Mode · No real payment is processed. All transactions are simulated for testing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Checkout Form */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="font-heading font-bold text-sm text-fg uppercase tracking-wider">
              1. Customer Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  id="checkout-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  id="checkout-email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="font-heading font-bold text-sm text-fg uppercase tracking-wider">
              2. Shipping Address
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Postal Code</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-bg text-fg text-xs focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            id="place-order-btn"
            className="w-full py-4 rounded-xl bg-accent text-bg font-heading font-bold text-sm hover:opacity-90 active:scale-98 transition-all shadow-md btn-tactile disabled:opacity-50"
          >
            {submitting ? 'Confirming Order...' : `Place Simulated Order · $${finalTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary & Coupon Validation */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
            <h2 className="font-heading font-bold text-base text-fg border-b border-border pb-3">
              Order Summary ({cart.length} items)
            </h2>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map(({ product, quantity }) => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-bold text-fg">{quantity}x</span>
                    <span className="text-fg truncate">{product.name}</span>
                  </div>
                  <span className="font-mono text-muted flex-shrink-0">
                    ${product.price * quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Promo Code Validation Form */}
            <div className="pt-3 border-t border-border space-y-2">
              <label className="block text-xs font-semibold text-fg">
                Promotional Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Code (e.g. FIT20, CALM15)"
                  id="checkout-coupon-input"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-bg text-fg placeholder:text-muted text-xs uppercase focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button
                  type="button"
                  id="checkout-apply-coupon-btn"
                  onClick={handleApplyPromo}
                  className="px-3.5 py-1.5 rounded-lg bg-fg text-bg text-xs font-semibold hover:opacity-90"
                >
                  Verify
                </button>
              </div>

              {promoError && (
                <p id="checkout-coupon-error" className="text-[11px] text-red-500 font-medium">
                  {promoError}
                </p>
              )}

              {appliedDiscount && (
                <p id="checkout-coupon-success" className="text-[11px] text-accent font-medium">
                  ✓ Code {appliedDiscount.code} verified: {appliedDiscount.percent}% discount applied.
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-border space-y-2 text-xs">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>${cartSubtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-accent font-medium">
                  <span>Creator Discount ({appliedDiscount.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted">
                <span>Shipping</span>
                <span className="text-accent font-medium">Free Express</span>
              </div>
              <div className="pt-2 border-t border-border flex justify-between items-baseline font-heading font-extrabold text-lg text-fg">
                <span>Total Due</span>
                <span id="checkout-final-total">${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
