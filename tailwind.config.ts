import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
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
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        content: '80rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(13, 29, 50, 0.04), 0 1px 3px rgba(13, 29, 50, 0.06)',
        raised: '0 4px 12px rgba(13, 29, 50, 0.08), 0 1px 3px rgba(13, 29, 50, 0.05)',
        pop: '0 12px 32px rgba(13, 29, 50, 0.12)',
      },
      colors: {
        canvas: "rgb(var(--rw-canvas) / <alpha-value>)",
        surface: "rgb(var(--rw-surface) / <alpha-value>)",
        sunken: "rgb(var(--rw-surface-sunken) / <alpha-value>)",
        hairline: {
          DEFAULT: "rgb(var(--rw-border) / <alpha-value>)",
          strong: "rgb(var(--rw-border-strong) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--rw-ink) / <alpha-value>)",
          muted: "rgb(var(--rw-ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--rw-ink-subtle) / <alpha-value>)",
          inverse: "rgb(var(--rw-ink-inverse) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "rgb(var(--rw-brand) / <alpha-value>)",
          hover: "rgb(var(--rw-brand-hover) / <alpha-value>)",
          soft: "rgb(var(--rw-brand-soft) / <alpha-value>)",
        },
        gold: {
          DEFAULT: "rgb(var(--rw-gold) / <alpha-value>)",
          soft: "rgb(var(--rw-gold-soft) / <alpha-value>)",
        },
        ok: {
          DEFAULT: "rgb(var(--rw-ok) / <alpha-value>)",
          soft: "rgb(var(--rw-ok-soft) / <alpha-value>)",
        },
        caution: {
          DEFAULT: "rgb(var(--rw-caution) / <alpha-value>)",
          soft: "rgb(var(--rw-caution-soft) / <alpha-value>)",
        },
        alert: {
          DEFAULT: "rgb(var(--rw-alert) / <alpha-value>)",
          soft: "rgb(var(--rw-alert-soft) / <alpha-value>)",
        },
        info: {
          DEFAULT: "rgb(var(--rw-info) / <alpha-value>)",
          soft: "rgb(var(--rw-info-soft) / <alpha-value>)",
        },
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
