/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      // Add any other domains you need here
    ],
  },
  // Add this to help with hydration warnings
  compiler: {
    styledComponents: true,
  },
}

module.exports = nextConfig