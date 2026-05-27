/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@post-forge/db",
    "@post-forge/retrieval",
    "@post-forge/proposals",
    "@post-forge/templates",
    "@post-forge/scheduler",
    "@post-forge/publisher",
    "@post-forge/calendar",
  ],
};

export default nextConfig;
