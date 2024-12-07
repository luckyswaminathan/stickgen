/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        'yc-orange': '#FF6600',
        'yc-bg': '#F6F6EF',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        walk: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' }
        },
        leftArmSwing: {
          '0%, 100%': { transform: 'rotate(30deg)' },
          '50%': { transform: 'rotate(-30deg)' },
        },
        rightArmSwing: {
          '0%, 100%': { transform: 'rotate(-30deg)' },
          '50%': { transform: 'rotate(30deg)' },
        },
        leftLegSwing: {
          '0%, 100%': { transform: 'rotate(-30deg)' },
          '50%': { transform: 'rotate(30deg)' },
        },
        rightLegSwing: {
          '0%, 100%': { transform: 'rotate(30deg)' },
          '50%': { transform: 'rotate(-30deg)' },
        },
        overlayShow: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        contentCollapse: {
          '0%': { 
            opacity: '0',
            transform: 'translate(-50%, 0%) scale(1)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(10px)' },
          to: { transform: 'translateY(0)' },
        },
      },
      animation: {
        'walk': 'walk 1s steps(4) infinite',
        'leftArmSwing': 'leftArmSwing 1s infinite',
        'rightArmSwing': 'rightArmSwing 1s infinite',
        'leftLegSwing': 'leftLegSwing 1s infinite',
        'rightLegSwing': 'rightLegSwing 1s infinite',
        'overlayShow': 'overlayShow 300ms ease-out',
        'contentCollapse': 'contentCollapse 500ms ease-out',
        'fadeIn': 'fadeIn 300ms ease-out',
        'slideUp': 'slideUp 400ms cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
} 
