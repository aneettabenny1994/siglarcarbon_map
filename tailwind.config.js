/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#00b0b8",
          green: "#30A788",
          'dark-blue': "#1f5c70",
          'muted-blue': "#546681",
          light: "#F4F8F9",
          accent: "#E2EEF1"
        },
        text: {
          primary: "#1A1A1A",
          secondary: "#4F4F4F",
          muted: "#7A7A7A"
        },
        background: {
          page: "#FFFFFF",
          sidebar: "#F9FAFB"
        },
        status: {
          active: "#30A788",
          upcoming: "#ffb607",
          discussion: "#DB3E42"
        }
      },
      fontFamily: {
        sans: ['Lato', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Freight Sans Pro', 'Lato', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        regular: 400,
        bold: 700,
        black: 900
      },
      lineHeight: {
        normal: '1.5',
        relaxed: '1.75'
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px'
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px'
      }
    },
  },
  plugins: [],
};
