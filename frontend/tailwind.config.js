/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#0F0F0F',
          white: '#F8F8F8',
          gray1: '#EAEAEA',
          gray2: '#BDBDBD',
          caramel: '#C6A15B',
          caramelDark: '#A67C3B'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 15, 15, 0.08)',
        'soft-lg': '0 18px 44px rgba(15, 15, 15, 0.14)'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      }
    }
  },
  plugins: []
};
