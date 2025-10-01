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
  // Surge 정적 배포를 위한 설정
  output: "export",
  // 정적 내보내기시 trailing slash 추가
  trailingSlash: true,
};

export default nextConfig;
