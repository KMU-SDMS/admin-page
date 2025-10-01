const fs = require("fs");
const path = require("path");

/**
 * ⚠️ Atomic 토큰은 임시 스캐폴딩 전용입니다.
 * 컴포넌트에서 직접 사용하지 마세요.
 * 항상 semantic 토큰을 이러한 atomic 값에 매핑하여 사용하세요.
 */

// tokens.json 파일 읽기 및 파싱
let atomicTokens = {};
try {
  const tokensPath = path.join(__dirname, "tokens.json");
  const tokensData = JSON.parse(fs.readFileSync(tokensPath, "utf-8"));

  // Atomic 토큰 추출 및 CSS 변수 형식으로 변환
  if (tokensData.Atomic && tokensData.Atomic.Atomic) {
    const atomic = tokensData.Atomic.Atomic;

    Object.keys(atomic).forEach((colorGroup) => {
      const group = atomic[colorGroup];
      Object.keys(group).forEach((shade) => {
        const token = group[shade];
        if (token.$value && token.$type === "color") {
          // --atomic-blue-500: #212e5d 형식으로 변환
          atomicTokens[`--atomic-${colorGroup}-${shade}`] = token.$value;
        }
      });
    });
  }
} catch (error) {
  console.warn("⚠️ tokens.json 파일을 읽을 수 없습니다:", error.message);
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      spacing: {
        "1/10": "10%",
      },
      width: {
        "1/10": "10%",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // Atomic 토큰을 CSS 변수로 주입하는 플러그인
    function ({ addBase }) {
      addBase({
        ":root": atomicTokens,
      });
    },
  ],
};
