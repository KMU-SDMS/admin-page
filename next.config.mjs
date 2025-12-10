/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Surge 배포 시에만 정적 내보내기 활성화
  ...(process.env.NEXT_PUBLIC_DEPLOY_TARGET === "surge" && {
    output: "export",
    trailingSlash: true,
  }),
};

export default nextConfig;
