export async function GET() {
  return new Response('google-site-verification: googlebb38bcbf804ae382.html', {
    headers: { 'Content-Type': 'text/html' },
  });
}
