import type { NextConfig } from "next";
import { APP_DOMAIN } from "@/lib/brand";

const nextConfig: NextConfig = {
  output: "standalone",
  allowedDevOrigins: ["quickly-tactics-uninstall.ngrok-free.dev"],
  serverActions: {
    allowedOrigins: [APP_DOMAIN, `www.${APP_DOMAIN}`],
  },
};

export default nextConfig;
