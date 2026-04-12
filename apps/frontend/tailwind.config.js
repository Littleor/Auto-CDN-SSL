/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      fontFamily: {
        sans: ["SF Pro Display", "SF Pro Text", "Geist", "Helvetica Neue", "sans-serif"],
        display: ["SF Pro Display", "SF Pro Text", "Geist", "Helvetica Neue", "sans-serif"],
        mono: ["SF Mono", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        glow: "0 24px 56px -40px rgba(63, 128, 215, 0.18), 0 0 0 1px rgba(63, 128, 215, 0.08)",
        soft: "0 22px 52px -38px rgba(15, 23, 42, 0.16)",
        diffuse: "0 30px 80px -48px rgba(15, 23, 42, 0.16)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "-100% 50%" }
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.8s linear infinite",
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};
