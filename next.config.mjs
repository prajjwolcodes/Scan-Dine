/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // allow images hosted on Cloudinary
    domains: ["res.cloudinary.com"],
    // If you later need more control, use remotePatterns instead:
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'res.cloudinary.com',
    //     port: '',
    //     pathname: '/**',
    //   },
    // ],
  },
};

export default nextConfig;
