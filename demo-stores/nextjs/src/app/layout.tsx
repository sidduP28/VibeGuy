import Script from 'next/script';

export const metadata = {
  title: 'Apex Performance Store',
  description: 'Premium performance supplements and gear for serious athletes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="canonical" href="https://store.example.com/" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600&display=swap"
          rel="stylesheet"
        />
        <Script src="http://localhost:3000/api/sdk/site_demo" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
