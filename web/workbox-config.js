module.exports = {
  globDirectory: "dist",
  globPatterns: ["**/*.{html,js,css,json}"],
  swDest: "dist/sw.js",
  // Custom cache file size limit
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,

  // Define runtime caching rules.
  runtimeCaching: [
    {
      // Match any request that ends with .png, .jpg, .jpeg or .svg.
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
      // Apply a stale-while-revalidate strategy.
      handler: "StaleWhileRevalidate",
      options: {
        // Use a custom cache name.
        cacheName: "images",
        // Only cache 25 images.
        expiration: {
          maxEntries: 25,
        },
      },
    },
  ],
};
