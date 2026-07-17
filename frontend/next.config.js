const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Scoped to the CLIENT bundle only (isServer === false). The
    // earlier version of this alias applied everywhere, including
    // Next's own server-side RSC/metadata code -- which needs to
    // resolve React however Next's internals expect, not be forced
    // through this alias. Client-side is where @react-three/fiber
    // actually runs and needs a guaranteed single React instance.
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      };
    }
    return config;
  },
};

module.exports = nextConfig;