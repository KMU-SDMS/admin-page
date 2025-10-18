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
  // 개발 환경에서는 정적 내보내기 비활성화
  ...(process.env.NODE_ENV === "production" && {
    output: "export",
    trailingSlash: true,
  }),
};

export default nextConfig;
