import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", md: "2rem", lg: "3rem", "2xl": "4rem" },
      screens: { "2xl": "1440px" },
    },
    extend: {
      colors: {
        cream: "#FBF8F3",
        "warm-white": "#FDFCFA",
        beige: "#F1E9DC",
        "beige-dark": "#E4D8C3",
        charcoal: "#1B1815",
        "charcoal-soft": "#2A2521",
        ink: "#211E1A",
        tangerine: {
          DEFAULT: "#E86A2C",
          50: "#FDF1E9",
          100: "#FBE3D2",
          200: "#F5C29B",
          300: "#F0A164",
          400: "#EC833F",
          500: "#E86A2C",
          600: "#D2551D",
          700: "#AC4318",
          800: "#853318",
          900: "#5C2313",
        },
        border: "#E7DFD1",
        muted: "#8A8177",
      },
      fontFamily: {
        display: ["var(--font-manrope)", "sans-serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      boxShadow: {
        soft: "0 2px 24px -4px rgba(27, 24, 21, 0.08)",
        lift: "0 20px 48px -12px rgba(27, 24, 21, 0.18)",
        card: "0 1px 2px rgba(27,24,21,0.04), 0 8px 24px -8px rgba(27,24,21,0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.6s linear infinite",
        marquee: "marquee 32s linear infinite",
        "accordion-down": "accordion-down 0.25s ease-premium",
        "accordion-up": "accordion-up 0.25s ease-premium",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      transitionDuration: {
        // Slow, cinematic reveal for product art scaling on hover.
        "900": "900ms",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
