const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['rearview-stipulate-said.ngrok-free.dev'],
  async rewrites() {
    return [
      {
        source: '/googlebb38bcbf804ae382.html',
        destination: '/api/google-verify',
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/sitemap',
        destination: '/sitemap.xml',
        permanent: true,
      },
      {
        // Catch direct requests to /sitemap.js and redirect to the real XML endpoint
        source: '/sitemap.js',
        destination: '/sitemap.xml',
        permanent: true,
      },
    ]
  },
  // Enable server actions
  experimental: {},
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: ['pdfkit'],
};

module.exports = nextConfig;
