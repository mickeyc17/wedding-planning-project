import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#101010",
        parchment: "#f7f1e8",
        accent: "#2f6f76",
        accentSoft: "#b9d6d4",
        alert: "#b45309"
      },
      boxShadow: {
        panel: "0 10px 30px rgba(16,16,16,0.12)",
        card: "0 8px 20px rgba(16,16,16,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
