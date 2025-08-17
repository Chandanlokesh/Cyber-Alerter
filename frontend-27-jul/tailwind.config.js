/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Look for Tailwind classes in React components
    "./public/index.html",        // Include public HTML file for any global styles
  ],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'scan-pattern': "url('/src/images/bg.svg')", 
        'scan-patternn': "url('/src/images/Scanbg.svg')",// Adjust the path as necessary
      }),
    },
  },
  plugins: [],
};
