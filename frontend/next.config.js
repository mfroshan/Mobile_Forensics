// import withPWAInit from "next-pwa";
const withPWAInit = require("next-pwa");


const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig = {
  reactStrictMode: true,
};

// export default withPWA(nextConfig);
module.exports = withPWA({
  reactStrictMode: true,
});
