import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      lineHeight: {'64': '64px'},
      marginTop: {'0.5': '2px'},
      width: {
        '520': '520px',
        '350': '350px'
      },
      height: {
        '0.5': '1px'
      },
      animation: {
        'rotate-slow': 'rotate 5s linear infinite',  // 定义一个旋转动画
      },
      keyframes: {
        rotate: {
          '0%': {
            transform: 'rotate(0deg)',  // 起始角度
          },
          '100%': {
            transform: 'rotate(360deg)',  // 结束角度
          }
        }
      }
    }
  },
  plugins: [],
};
export default config;
