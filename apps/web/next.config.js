/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@badminton/core',
    '@badminton/firebase',
    '@badminton/store',
    '@badminton/types',
    '@badminton/ui-shared',
  ],
};

export default nextConfig;
