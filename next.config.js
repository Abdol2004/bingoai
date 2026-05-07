/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'oaidalleapiprodscus.blob.core.windows.net' },
      { protocol: 'https', hostname: '*.openai.com' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'agenda', 'telegraf'],
    instrumentationHook: true,
  },
}

module.exports = nextConfig
