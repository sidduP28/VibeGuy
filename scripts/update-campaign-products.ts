import { getDb } from '../apps/console/src/db';
import { campaigns } from '../apps/console/src/db/schema';
import { eq } from 'drizzle-orm';

async function main() {
  const db = getDb();
  const updates = [
    {
      id: 'cmp_fit',
      productTitle: 'Pro-Tension Resistance Bands Set',
      productUrl: 'http://localhost:3002/product/fit-bands',
      productImage: '/images/prod-bands.jpg',
      productPrice: '$34.00',
      themeId: 'theme_energy_demo',
    },
    {
      id: 'cmp_min',
      productTitle: 'Anodized Aluminum Desk Organizer Tray',
      productUrl: 'http://localhost:3002/product/home-organizer',
      productImage: '/images/prod-organizer.jpg',
      productPrice: '$52.00',
      themeId: 'theme_calm_demo',
    },
    {
      id: 'cmp_lux',
      productTitle: 'Active Radiance Multi-Peptide Serum',
      productUrl: 'http://localhost:3002/product/beauty-serum',
      productImage: '/images/prod-serum.jpg',
      productPrice: '$88.00',
      themeId: 'theme_gold_demo',
    },
    {
      id: 'cmp_fitfiona_demo',
      productTitle: 'High-Density Grip Alignment Yoga Mat',
      productUrl: 'http://localhost:3002/product/fit-mat',
      productImage: '/images/prod-mat.jpg',
      productPrice: '$68.00',
      themeId: 'theme_energy_demo',
    },
    {
      id: 'cmp_minimal_max_demo',
      productTitle: 'Handcrafted Matte Ceramic Mug',
      productUrl: 'http://localhost:3002/product/home-mug',
      productImage: '/images/prod-mug.jpg',
      productPrice: '$26.00',
      themeId: 'theme_calm_demo',
    },
    {
      id: 'cmp_luxe_lena_demo',
      productTitle: 'Niche Santal Eau De Parfum (50ml)',
      productUrl: 'http://localhost:3002/product/beauty-perfume',
      productImage: '/images/prod-perfume.jpg',
      productPrice: '$145.00',
      themeId: 'theme_gold_demo',
    },
    {
      id: 'cmp_techtom_demo',
      productTitle: 'Acoustic Pro Wireless ANC Earbuds',
      productUrl: 'http://localhost:3002/product/tech-earbuds',
      productImage: '/images/prod-earbuds.jpg',
      productPrice: '$129.00',
      themeId: 'theme_cyber_demo',
    },
  ];

  for (const u of updates) {
    await db
      .update(campaigns)
      .set({
        productTitle: u.productTitle,
        productUrl: u.productUrl,
        productImage: u.productImage,
        productPrice: u.productPrice,
        themeId: u.themeId,
      })
      .where(eq(campaigns.id, u.id));
  }

  console.log('Successfully assigned separate products and themes to all campaigns!');
}

main().catch(console.error);
