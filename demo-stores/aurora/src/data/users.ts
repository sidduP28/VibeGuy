export interface PastOrder {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'Delivered' | 'In Transit' | 'Processing';
  creatorAttribution?: string;
}

export interface ShopperUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string; // SHA-256 hash of password
  orders: PastOrder[];
}

// SHA-256 hash of 'Demo@1234':
// b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb9
export const DEMO_PASSWORD_HASH = 'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb9';

export const SEEDED_USERS: ShopperUser[] = [
  {
    id: 'user_asha',
    email: 'asha@demo.dev',
    name: 'Asha Patel',
    passwordHash: DEMO_PASSWORD_HASH,
    orders: [
      {
        id: 'ord_9182',
        date: '2026-02-14',
        items: [
          { productId: 'fit-bands', productName: 'Pro-Tension Resistance Bands Set', quantity: 1, price: 34 },
          { productId: 'fit-shaker', productName: 'Double-Wall Insulated Steel Shaker', quantity: 1, price: 28 },
        ],
        total: 49.6, // with 20% discount
        status: 'Delivered',
        creatorAttribution: 'fitfiona',
      },
      {
        id: 'ord_9341',
        date: '2026-03-01',
        items: [
          { productId: 'tech-smartbottle', productName: 'UV-C Self-Purifying Smart Thermal Bottle', quantity: 1, price: 59 },
        ],
        total: 59.0,
        status: 'Delivered',
      },
    ],
  },
  {
    id: 'user_ravi',
    email: 'ravi@demo.dev',
    name: 'Ravi Sharma',
    passwordHash: DEMO_PASSWORD_HASH,
    orders: [
      {
        id: 'ord_8412',
        date: '2026-01-22',
        items: [
          { productId: 'home-mug', productName: 'Handcrafted Matte Ceramic Mug', quantity: 2, price: 26 },
          { productId: 'home-organizer', productName: 'Anodized Aluminum Desk Organizer Tray', quantity: 1, price: 52 },
        ],
        total: 88.4, // with 15% discount
        status: 'Delivered',
        creatorAttribution: 'minimal-max',
      },
    ],
  },
  {
    id: 'user_meera',
    email: 'meera@demo.dev',
    name: 'Meera Iyer',
    passwordHash: DEMO_PASSWORD_HASH,
    orders: [
      {
        id: 'ord_7749',
        date: '2026-02-28',
        items: [
          { productId: 'beauty-serum', productName: 'Active Radiance Multi-Peptide Serum', quantity: 1, price: 88 },
          { productId: 'beauty-pillowcase', productName: 'Grade 6A Mulberry Silk Pillowcase Set', quantity: 1, price: 75 },
        ],
        total: 122.25, // with 25% discount
        status: 'Delivered',
        creatorAttribution: 'luxe-lena',
      },
      {
        id: 'ord_7890',
        date: '2026-03-15',
        items: [
          { productId: 'tech-earbuds', productName: 'Acoustic Pro Wireless ANC Earbuds', quantity: 1, price: 129 },
        ],
        total: 116.1, // with 10% discount
        status: 'In Transit',
        creatorAttribution: 'techtom',
      },
    ],
  },
];

export function isDemoMode(): boolean {
  if (typeof process === 'undefined' || !process.env) return true;
  return process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' && process.env.DEMO_MODE !== 'false';
}

export function findUserByEmail(email: string): ShopperUser | undefined {
  if (!isDemoMode()) return undefined;
  return SEEDED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function hashPassword(plain: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return DEMO_PASSWORD_HASH;
}
