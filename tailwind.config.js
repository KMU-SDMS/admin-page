import { designTokens, generateCSSVariables } from "./lib/design-tokens.js";

/**
 * 디자인 시스템 기반 Tailwind 설정
 * design-tokens.json의 토큰을 기반으로 한 색상 및 타이포그래피 시스템
 */

// CSS 변수 생성
const cssVariables = generateCSSVariables();

/** @type {import('tailwindcss').Config} */
const config = {
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
        // Atomic Colors - 직접 사용 금지, semantic 토큰 사용 권장
        atomic: designTokens.atomic,
        // Semantic Colors - 권장 사용
        semantic: designTokens.semantic,
        // 기존 Tailwind 색상과의 호환성을 위한 매핑
        border: {
          DEFAULT: designTokens.semantic.line.solid.normal,
          input: designTokens.semantic.line.solid.normal,
          ring: designTokens.semantic.primary.normal,
        },
        background: {
          DEFAULT: designTokens.semantic.background.normal.normal,
          secondary: designTokens.semantic.background.normal.alternative,
          muted: designTokens.semantic.fill.normal,
          accent: designTokens.semantic.fill.strong,
        },
        foreground: {
          DEFAULT: designTokens.semantic.label.normal,
          muted: designTokens.semantic.label.neutral,
          secondary: designTokens.semantic.label.alternative,
          destructive: designTokens.semantic.status.negative,
        },
        primary: {
          DEFAULT: designTokens.semantic.primary.normal,
          foreground: designTokens.semantic.static.white,
          strong: designTokens.semantic.primary.strong,
          heavy: designTokens.semantic.primary.heavy,
        },
        secondary: {
          DEFAULT: designTokens.semantic.secondary.normal,
          foreground: designTokens.semantic.label.normal,
          strong: designTokens.semantic.secondary.strong,
          heavy: designTokens.semantic.secondary.heavy,
        },
        destructive: {
          DEFAULT: designTokens.semantic.status.negative,
          foreground: designTokens.semantic.static.white,
        },
        warning: {
          DEFAULT: designTokens.semantic.status.cautionary,
          foreground: designTokens.semantic.static.white,
        },
        success: {
          DEFAULT: designTokens.semantic.status.positive,
          foreground: designTokens.semantic.static.white,
        },
        muted: {
          DEFAULT: designTokens.semantic.fill.normal,
          foreground: designTokens.semantic.label.alternative,
        },
        accent: {
          DEFAULT: designTokens.semantic.fill.strong,
          foreground: designTokens.semantic.label.normal,
        },
        card: {
          DEFAULT: designTokens.semantic.background.normal.normal,
          foreground: designTokens.semantic.label.normal,
        },
        popover: {
          DEFAULT: designTokens.semantic.background.normal.normal,
          foreground: designTokens.semantic.label.normal,
        },
      },
      fontFamily: {
        sans: ["Pretendard", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Display
        "display-1": [
          designTokens.typography["display-1"].regular.fontSize,
          {
            lineHeight: designTokens.typography["display-1"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["display-1"].regular.letterSpacing,
          },
        ],
        "display-2": [
          designTokens.typography["display-2"].regular.fontSize,
          {
            lineHeight: designTokens.typography["display-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["display-2"].regular.letterSpacing,
          },
        ],
        // Title
        "title-1": [
          designTokens.typography["title-1"].regular.fontSize,
          {
            lineHeight: designTokens.typography["title-1"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["title-1"].regular.letterSpacing,
          },
        ],
        "title-2": [
          designTokens.typography["title-2"].regular.fontSize,
          {
            lineHeight: designTokens.typography["title-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["title-2"].regular.letterSpacing,
          },
        ],
        "title-3": [
          designTokens.typography["title-3"].regular.fontSize,
          {
            lineHeight: designTokens.typography["title-3"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["title-3"].regular.letterSpacing,
          },
        ],
        // Heading
        "heading-1": [
          designTokens.typography["heading-1"].regular.fontSize,
          {
            lineHeight: designTokens.typography["heading-1"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["heading-1"].regular.letterSpacing,
          },
        ],
        "heading-2": [
          designTokens.typography["heading-2"].regular.fontSize,
          {
            lineHeight: designTokens.typography["heading-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["heading-2"].regular.letterSpacing,
          },
        ],
        // Headline
        "headline-1": [
          designTokens.typography["headline-1"].regular.fontSize,
          {
            lineHeight:
              designTokens.typography["headline-1"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["headline-1"].regular.letterSpacing,
          },
        ],
        "headline-2": [
          designTokens.typography["headline-2"].regular.fontSize,
          {
            lineHeight:
              designTokens.typography["headline-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["headline-2"].regular.letterSpacing,
          },
        ],
        // Body
        "body-1": [
          designTokens.typography["body-1"]["normal-regular"].fontSize,
          {
            lineHeight:
              designTokens.typography["body-1"]["normal-regular"].lineHeight,
            letterSpacing:
              designTokens.typography["body-1"]["normal-regular"].letterSpacing,
          },
        ],
        "body-1-reading": [
          designTokens.typography["body-1"]["reading-regular"].fontSize,
          {
            lineHeight:
              designTokens.typography["body-1"]["reading-regular"].lineHeight,
            letterSpacing:
              designTokens.typography["body-1"]["reading-regular"]
                .letterSpacing,
          },
        ],
        "body-2": [
          designTokens.typography["body-2"]["normal-regular"].fontSize,
          {
            lineHeight:
              designTokens.typography["body-2"]["normal-regular"].lineHeight,
            letterSpacing:
              designTokens.typography["body-2"]["normal-regular"].letterSpacing,
          },
        ],
        "body-2-reading": [
          designTokens.typography["body-2"]["reading-regular"].fontSize,
          {
            lineHeight:
              designTokens.typography["body-2"]["reading-regular"].lineHeight,
            letterSpacing:
              designTokens.typography["body-2"]["reading-regular"]
                .letterSpacing,
          },
        ],
        // Label
        "label-1": [
          designTokens.typography["label-1"]["normal-regular"].fontSize,
          {
            lineHeight:
              designTokens.typography["label-1"]["normal-regular"].lineHeight,
            letterSpacing:
              designTokens.typography["label-1"]["normal-regular"]
                .letterSpacing,
          },
        ],
        "label-2": [
          designTokens.typography["label-2"].regular.fontSize,
          {
            lineHeight: designTokens.typography["label-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["label-2"].regular.letterSpacing,
          },
        ],
        // Caption
        "caption-1": [
          designTokens.typography["caption-1"].regular.fontSize,
          {
            lineHeight: designTokens.typography["caption-1"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["caption-1"].regular.letterSpacing,
          },
        ],
        "caption-2": [
          designTokens.typography["caption-2"].regular.fontSize,
          {
            lineHeight: designTokens.typography["caption-2"].regular.lineHeight,
            letterSpacing:
              designTokens.typography["caption-2"].regular.letterSpacing,
          },
        ],
      },
      fontWeight: {
        regular: designTokens.typography["body-1"]["normal-regular"].fontWeight,
        medium: designTokens.typography["body-1"]["normal-medium"].fontWeight,
        bold: designTokens.typography["body-1"]["normal-bold"].fontWeight,
      },
      opacity: designTokens.opacity,
    },
  },
  plugins: [
    (await import("tailwindcss-animate")).default,
    // 디자인 토큰을 CSS 변수로 주입하는 플러그인
    function ({ addBase }) {
      addBase({
        ":root": cssVariables,
      });
    },
  ],
};

export default config;
