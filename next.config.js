const path = require("path");
/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: false,
  sassOptions: {
    includePaths: [path.resolve("./app/styles")],
    prependData: `@import "globals.scss";`,
  },
};

module.exports = nextConfig;
