/** @type {import('next').NextConfig} */
const nextConfig = {
  output:
    process.env.NEXT_OUTPUT_MODE === "standalone" ? "standalone" : undefined,
};

module.exports = nextConfig;
