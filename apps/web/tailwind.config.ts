import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary, #2563eb)',
          'primary-hover': 'var(--brand-primary-hover, #1d4ed8)',
          secondary: 'var(--brand-secondary, #64748b)',
          'secondary-hover': 'var(--brand-secondary-hover, #475569)',
          accent: 'var(--brand-accent, #f59e0b)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        brand: 'var(--brand-radius, 0.5rem)',
      },
    },
  },
  plugins: [],
};

export default config;
