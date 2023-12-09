import starlightPlugin from '@astrojs/starlight-tailwind';

// Generated color palettes
const accent = {
  200: '#c7bfff',
  600: '#752af8',
  900: '#351c70',
  950: '#25184b',
};
const gray = {
  100: '#f4f6fd',
  200: '#eaedfa',
  300: '#bec1d1',
  400: '#8489a7',
  500: '#515671',
  700: '#32364f',
  800: '#21243d',
  900: '#151723',
};

/** @type {import('tailwindcss').Config} */
const config = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: { accent, gray },
    },
  },
  plugins: [starlightPlugin()],
};

export default config;
