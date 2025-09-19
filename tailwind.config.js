/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cute Pastel Pink Theme
        pink: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9d174d',
          900: '#831843',
          950: '#500724'
        },
        pastel: {
          pink: '#fce7f3',
          'pink-light': '#fdf2f8',
          'pink-medium': '#f9a8d4',
          'pink-dark': '#f472b6',
          blue: '#dbeafe',
          'blue-light': '#eff6ff',
          'blue-medium': '#93c5fd',
          'blue-dark': '#3b82f6',
          white: '#ffffff',
          'white-soft': '#fefefe',
          'white-warm': '#fefcfb'
        },
        // Soft grays for text and borders
        soft: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          900: '#18181b'
        }
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'noto': ['Noto Serif', 'serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-down': 'slideDown 0.6s ease-out',
        'bounce-gentle': 'bounceGentle 1s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
        'float': 'float 4s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'shimmer': 'shimmer 2s linear infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'bounce-cute': 'bounceCute 0.6s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        slideUp: {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-8px)' },
          '60%': { transform: 'translateY(-4px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '50%': { transform: 'translateY(-15px) rotate(1deg)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(236, 72, 153, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(236, 72, 153, 0.5)' }
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        },
        bounceCute: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0) scale(1)' },
          '40%': { transform: 'translateY(-10px) scale(1.05)' },
          '60%': { transform: 'translateY(-5px) scale(1.02)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 2px 20px -5px rgba(236, 72, 153, 0.1), 0 8px 16px -8px rgba(236, 72, 153, 0.05)',
        'medium': '0 4px 30px -8px rgba(236, 72, 153, 0.15), 0 12px 20px -12px rgba(236, 72, 153, 0.08)',
        'large': '0 10px 50px -15px rgba(236, 72, 153, 0.2), 0 20px 30px -20px rgba(236, 72, 153, 0.1)',
        'glow': '0 0 25px rgba(236, 72, 153, 0.4)',
        'inner-soft': 'inset 0 2px 4px 0 rgba(236, 72, 153, 0.1)',
        'cute': '0 4px 20px -5px rgba(252, 231, 243, 0.8), 0 2px 8px -2px rgba(236, 72, 153, 0.2)',
        'floating': '0 8px 32px -8px rgba(236, 72, 153, 0.2), 0 4px 16px -4px rgba(219, 234, 254, 0.3)'
      },
      borderRadius: {
        'cute': '20px',
        'soft': '16px',
        'pill': '50px'
      }
    },
  },
  plugins: [],
};