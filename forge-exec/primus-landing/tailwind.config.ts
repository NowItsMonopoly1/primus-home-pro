import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Primus OS Theme
        'primus': {
          'bg-deep': '#020617', // slate-950
          'bg-surface': '#0f172a', // slate-900
          'accent': '#34d399', // emerald-400
          'accent-bright': '#10b981', // emerald-500
          'text-muted': '#94a3b8', // slate-400
          'border': '#1e293b', // slate-800
        }
      },
      fontFamily: {
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
