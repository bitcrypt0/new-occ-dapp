/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 * - `frame-ancestors 'none'` + X-Frame-Options block clickjacking — the dapp
 *   must never be iframed by a third party (a phishing vector for wallets).
 * - `img-src data:` lets on-chain SVG (`data:image/svg+xml;base64,…`) and
 *   EIP-6963 wallet icons render via <img>.
 * - `connect-src https: wss:` permits the configurable public RPC endpoints
 *   and websocket subscriptions.
 * - `object-src 'none'`, `base-uri 'self'`, `form-action 'self'` close off
 *   common injection sinks.
 * Next.js injects inline bootstrap scripts/styles, so 'unsafe-inline' is
 * required; 'unsafe-eval' is dev-only (React Refresh) and dropped in prod.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https: wss:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
