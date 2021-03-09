module.exports = {
  purge: {
    enabled: false,
    mode: "all",
    preserveHtmlElements: false,
    content: [
      "./src/**/*.handlebars",
      "./src/**/*.html",
      "./src/**/*.js"
    ],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      backgroundColor: ["active"],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
