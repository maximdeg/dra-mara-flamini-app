/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the file-tracing root to this project. A stray lockfile higher up the
  // filesystem (in the user's home dir) otherwise makes Next infer the wrong
  // workspace root.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
