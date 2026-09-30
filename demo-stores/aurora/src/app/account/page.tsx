'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '../../context/StoreContext';

export default function AccountPage() {
  const { currentUser, logoutUser } = useStore();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-xl font-heading font-bold text-fg">Not Signed In</h1>
        <p className="text-xs text-muted">Please log in to view your order history and account details.</p>
        <Link
          href="/login"
          className="inline-block px-5 py-2.5 rounded-lg bg-fg text-bg text-xs font-semibold"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Account Profile Header */}
      <div className="p-6 rounded-2xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-accent text-bg font-extrabold text-lg flex items-center justify-center">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-heading font-extrabold text-fg tracking-tight" id="account-user-name">
              {currentUser.name}
            </h1>
            <p className="text-xs text-muted" id="account-user-email">
              {currentUser.email}
            </p>
          </div>
        </div>

        <button
          onClick={logoutUser}
          id="account-logout-btn"
          className="px-4 py-2 rounded-lg border border-border text-fg text-xs font-semibold hover:bg-fg/5 transition-colors self-start sm:self-auto"
        >
          Sign Out
        </button>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="border-b border-border pb-3 flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-fg">
            Order History ({currentUser.orders.length})
          </h2>
          <span className="text-xs text-muted">All orders</span>
        </div>

        {currentUser.orders.length > 0 ? (
          <div className="space-y-4" id="account-orders-list">
            {currentUser.orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-xl border border-border bg-card space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs border-b border-border pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-fg">{order.id}</span>
                    <span className="text-muted">{order.date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-accent/15 text-accent text-[11px] font-semibold">
                      {order.status}
                    </span>
                    <span className="font-heading font-extrabold text-sm text-fg">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-fg">
                      <span>{item.quantity}x {item.productName}</span>
                      <span className="text-muted">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center border border-dashed border-border rounded-xl text-xs text-muted">
            No past orders recorded for this account.
          </div>
        )}
      </div>
    </div>
  );
}
