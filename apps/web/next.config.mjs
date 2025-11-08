/**
 * Next.js Configuration
 * 
 * Validates environment variables on build by importing the env schema.
 * This ensures all required environment variables are present before building.
 */

import { fileURLToPath } from "node:url";
import createJiti from "jiti";

const jiti = createJiti(fileURLToPath(import.meta.url));

// Import env here to validate during build. Using jiti we can import .ts files
jiti("./src/env");

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@t3-oss/env-nextjs", "@t3-oss/env-core"],
  cacheComponents: true,
}

export default nextConfig
