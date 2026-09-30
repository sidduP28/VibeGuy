const GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64'
);

export async function GET() {
  return new Response(GIF, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store',
    },
  });
}
