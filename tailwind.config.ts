import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"] ,
  theme: {
    extend: {
      colors: {
        ink: "#0f2f33",
        parchment: "#f1fbfb",
        accent: "#1d8f97",
        accentSoft: "#bde7e8",
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
