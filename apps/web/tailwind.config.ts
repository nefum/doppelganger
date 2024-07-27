import type { Config } from "tailwindcss";

// https://react-docs.relume.io/getting-started/tailwind
// @ts-expect-error -- don't require
import relumeTailwindPreset from "@relume_io/relume-tailwind";
const { extend: relumeThemeExtension, ...relumeTheme } =
  relumeTailwindPreset.theme;
const combinedThemeExtension = { ...relumeTheme, ...relumeThemeExtension };

const config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,md,mdx}",
    "./node_modules/@relume_io/relume-ui/dist/**/*.{js,ts,jsx,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        sm: "100%",
        md: "100%",
        lg: "992px",
        xl: "1280px",
        "2xl": "1400px",
      },
    },
    extend: {
      maxWidth: { ...combinedThemeExtension.maxWidth },
      boxShadow: { ...combinedThemeExtension.boxShadow },
      fontSize: { ...combinedThemeExtension.fontSize },
      spacing: { ...combinedThemeExtension.spacing },
      colors: {
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
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        ...combinedThemeExtension.keyframes,
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        ...combinedThemeExtension.animation,
      },
      screens: {
        xs: "450px",
        xxl: "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), ...relumeTailwindPreset.plugins],
} satisfies Config;

export default config;
