'use client';

import { useState } from 'react';

export function GuidedDemoModal() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = [
    'Pick Ava Pulse — fitness energy tokens load into the split preview.',
    'Copy the vibe link (?vibe=ava-fit) and open the Shopify-style demo store.',
    'Slots swap via textContent only. Title and canonical stay generic.',
    'Simulate traffic, then read the two-proportion z-test on Uplift.',
  ];
  return (
    <>
      <button className="btn gold" type="button" onClick={() => setOpen(true)}>
        90-second demo
      </button>
      {open ? (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="demo-title">
          <div className="modal">
            <p className="kicker">Guided walkthrough</p>
            <h2 id="demo-title" style={{ fontFamily: 'var(--font-serif)' }}>
              {steps[step]}
            </h2>
            <div className="row">
              <button className="btn ghost" type="button" onClick={() => setOpen(false)}>
                Close
              </button>
              <button
                className="btn"
                type="button"
                onClick={() => setStep((s) => (s + 1) % steps.length)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
