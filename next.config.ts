import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Cafe24 웹호스팅 (정적 파일) 배포 설정 */
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 정적 빌드 시 trailing slash 권장
  trailingSlash: true,
  // Cafe24 하위 디렉토리 배포 (/www/krxwatch) - 개발 중에는 주석 처리
  basePath: '/krxwatch',
};

export default nextConfig;
