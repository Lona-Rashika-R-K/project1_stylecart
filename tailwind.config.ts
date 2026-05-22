import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#181717",
        clay: "#b0563c",
        leaf: "#58725f",
        linen: "#f7f1ea",
        smoke: "#efede9"
      },
      boxShadow: {
        soft: "0 16px 45px rgba(24, 23, 23, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
