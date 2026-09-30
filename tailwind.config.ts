import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "2rem",
        lg: "3rem",
        xl: "4rem",
      },
    },
    extend: {
      colors: {
        ivory: "#FAF7F2",
        paper: "#FFFDFB",
        ink: {
          DEFAULT: "#1B1917",
          soft: "#332F2B",
        },
        taupe: {
          DEFAULT: "#8C8377",
          light: "#B3AA9E",
        },
        rose: {
          DEFAULT: "#C9A199",
          deep: "#A97C74",
          pale: "#EFE1DC",
        },
        line: "#E7E1D8",
        cream: "#F2ECE3",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
      letterSpacing: {
        widest2: "0.28em",
      },
      maxWidth: {
        "8xl": "90rem",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(1.04)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        crescentSpin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.8s cubic-bezier(0.22,1,0.36,1) both",
        fadeIn: "fadeIn 0.6s ease both",
        scaleIn: "scaleIn 1.1s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 28s linear infinite",
        crescentSpin: "crescentSpin 8s linear infinite",
      },
      transitionTimingFunction: {
        lune: "cubic-bezier(0.22,1,0.36,1)",
      },
    },
  },
  plugins: [],
};

export default config;
