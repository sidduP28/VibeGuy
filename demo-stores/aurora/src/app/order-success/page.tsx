'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ord_demo_complete';
  const total = searchParams.get('total') || '0.00';

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-accent/15 text-accent mx-auto flex items-center justify-center font-extrabold text-2xl">
        ✓
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-extrabold text-fg tracking-tight">
          Order Confirmed
        </h1>
        <p className="text-xs text-muted max-w-md mx-auto">
          Thank you for patronizing Aurora Atelier. Your simulated order has been registered and attributed.
        </p>
      </div>

      <div className="p-6 rounded-2xl border border-border bg-card text-left space-y-3">
        <div className="flex justify-between items-center text-xs pb-3 border-b border-border">
          <span className="text-muted">Order Identifier</span>
          <span className="font-mono font-bold text-fg" id="order-id-display">{orderId}</span>
        </div>
        <div className="flex justify-between items-center text-xs pb-3 border-b border-border">
          <span className="text-muted">Total Paid</span>
          <span className="font-mono font-bold text-accent">${total}</span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Fulfillment Status</span>
          <span className="px-2 py-0.5 rounded bg-accent/15 text-accent font-semibold text-[10px]">
            In Preparation
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-3 pt-4">
        <Link
          href="/shop"
          className="px-5 py-2.5 rounded-lg bg-fg text-bg text-xs font-semibold hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
        <Link
          href="/account"
          className="px-5 py-2.5 rounded-lg border border-border text-fg text-xs font-semibold hover:bg-card transition-colors"
        >
          View Account Orders
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-muted">Loading confirmation...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
