import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    localFiles: {
      users: { exists: false, size: 0, path: '' },
      orders: { exists: false, size: 0, path: '' },
      settings: { exists: false, size: 0, path: '' },
    },
    wordpress: {
      url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://127.0.0.1/Testwp/graphql',
      reachable: false,
      schemaLoaded: false,
      error: null
    }
  };

  // 1. Check local files
  const files = {
    users: path.join(process.cwd(), '.users-fallback.json'),
    orders: path.join(process.cwd(), '.orders-fallback.json'),
    settings: path.join(process.cwd(), '.settings-fallback.json')
  };

  for (const [key, filepath] of Object.entries(files)) {
    diagnostics.localFiles[key].path = filepath;
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      diagnostics.localFiles[key].exists = true;
      diagnostics.localFiles[key].size = stats.size;
    }
  }

  // 2. Check WordPress GraphQL connection
  try {
    const query = `
      query {
        __type(name: "RootQuery") {
          fields {
            name
          }
        }
      }
    `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const res = await fetch(diagnostics.wordpress.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      diagnostics.wordpress.reachable = true;
      const json = await res.json();
      const fields = json.data?.__type?.fields || [];
      const customField = fields.find(f => f.name === 'grGroupProducts');
      if (customField) {
        diagnostics.wordpress.schemaLoaded = true;
      }
    } else {
      diagnostics.wordpress.error = `HTTP ${res.status}`;
    }
  } catch (error) {
    diagnostics.wordpress.error = error.message;
  }

  const success = diagnostics.wordpress.reachable;

  return Response.json({
    success,
    diagnostics
  }, { status: success ? 200 : 500 });
}
