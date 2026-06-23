/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the file-tracing root to this project. A stray lockfile higher up the
  // filesystem (in the user's home dir) otherwise makes Next infer the wrong
  // workspace root.
  outputFileTracingRoot: import.meta.dirname,
  // Hide the dev-only on-screen indicator so it never lands in visual-regression
  // baselines (dev-only overlay; no effect on production behavior or output).
  devIndicators: false,
  // Allow the visual-regression suite to build into an isolated directory
  // (NEXT_DIST_DIR=.next-e2e), so its production server never collides with a
  // co-running `next dev` that shares the default `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Serve next/image in modern formats (AVIF first, WebP fallback) so the hero
  // photo ships at a fraction of the JPEG size.
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
