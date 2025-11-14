/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './sections/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#00BA88',
        secondary: '#FF6B00',
        background: {
          dark: 'rgb(23,25,29)',
          light: '#ffffff',
        },
        card: {
          dark: 'rgb(35,36,42)',
          light: '#f5f5f5',
        },
        search: {
          dark: '#1E1F24',
          light: '#ffffff',
        },
        category: {
          dark: 'rgb(35,36,42)',
          light: '#f0f0f0',
        },
        text: {
          dark: '#ffffff',
          light: '#000000',
        },
        header: {
          dark: 'rgb(23,25,29)',
          light: '#ffffff',
        },
        modal: {
          dark: '#1E1F24',
          light: '#ffffff',
        },
        surface: {
          dark: '#2A2B30',
          light: '#f8f8f8',
        },
        'input-border': {
          light: 'rgba(0,0,0,0.1)',
          dark: 'rgba(255,255,255,0.1)',
        },
        hover: {
          light: 'rgba(0,0,0,0.05)',
          dark: 'rgba(255,255,255,0.05)',
        },
      },
      maxHeight: {
        'search-results': '300px',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'scroll-to': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        blink: 'blink 1.2s ease-in-out',
        'scroll-to': 'scroll-to 0.6s ease-in-out',
      },
      screens: {
        'mobile-440': { max: '440px' },
      },
      // Add CSS scroll behavior
      scrollBehavior: {
        smooth: 'smooth',
      },
    },
  },
  plugins: [],
};
