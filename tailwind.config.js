import fs from "fs";
import path from "path";

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
        atomic: {
          "green-10": "#00230b",
          "green-200": "#004416",
          "green-300": "#006d24",
          "green-400": "#009632",
          "green-500": "#00bf40",
          "green-600": "#1dd35a",
          "green-700": "#49e57d",
          "green-800": "#7df5a5",
          "green-900": "#acfcc7",
          "green-950": "#d9ffe6",
          "green-99": "#f2fff6",
          "orange-100": "#361e00",
          "orange-200": "#663900",
          "orange-300": "#9b5800",
          "orange-400": "#d37700",
          "orange-500": "#ff9200",
          "orange-600": "#ffa838",
          "orange-700": "#ffc06d",
          "orange-800": "#ffd39b",
          "orange-900": "#fee5c6",
          "orange-950": "#fef4e6",
          "orange-99": "#fffcf7",
          "red-100": "#3a0000",
          "red-200": "#730303",
          "red-300": "#b00c0c",
          "red-400": "#e52222",
          "red-500": "#ff4242",
          "red-600": "#ff6363",
          "red-700": "#ff8c8c",
          "red-800": "#ffb5b5",
          "red-900": "#fed5d5",
          "red-950": "#feecec",
          "red-990": "#fffafa",
          "blue-100": "#070913",
          "blue-200": "#0e1225",
          "blue-300": "#141c38",
          "blue-400": "#1c2549",
          "blue-500": "#212e5d",
          "blue-600": "#293770",
          "blue-700": "#304082",
          "blue-800": "#374a95",
          "blue-900": "#4158b1",
          "blue-1000": "#576dc1",
          "blue-1100": "#7385cb",
          "blue-1200": "#8f9dd6",
          "blue-1300": "#abb6e0",
          "blue-1400": "#c7ceea",
          "blue-1500": "#e3e7f5",
          "common-0": "#000000",
          "common-2200": "#ffffff",
          "neutral-100": "#0f0f10",
          "neutral-200": "#141415",
          "neutral-300": "#171719",
          "neutral-400": "#1b1c1e",
          "neutral-500": "#212225",
          "neutral-600": "#292a2d",
          "neutral-700": "#2e2f33",
          "neutral-800": "#333438",
          "neutral-900": "#37383c",
          "neutral-1000": "#46474c",
          "neutral-1100": "#5a5c63",
          "neutral-1200": "#70737c",
          "neutral-1300": "#878a93",
          "neutral-1400": "#989ba2",
          "neutral-1500": "#aeb0b6",
          "neutral-1600": "#c2c4c8",
          "neutral-1700": "#dbdcdf",
          "neutral-1800": "#e1e2e4",
          "neutral-1900": "#eaebec",
          "neutral-2000": "#f4f4f5",
          "neutral-2100": "#f7f7f8",
          "purple-100": "#0d002f",
          "purple-200": "#1b005f",
          "purple-300": "#28008e",
          "purple-400": "#3600bf",
          "purple-500": "#4300ee",
          "purple-600": "#5d1eff",
          "purple-700": "#7f4eff",
          "purple-800": "#a17dff",
          "purple-900": "#c3acff",
          "purple-1000": "#d9ccff",
          "purple-1100": "#e5dcff",
          "purple-1200": "#ece2ff",
          "purple-1300": "#f2edff",
          "purple-1400": "#f0eaff",
          "warmneutral-100": "#09090c",
          "warmneutral-200": "#0d0d12",
          "warmneutral-300": "#111118",
          "warmneutral-400": "#16161d",
          "warmneutral-500": "#1a1a23",
          "warmneutral-600": "#1e1e29",
          "warmneutral-700": "#23232f",
          "warmneutral-800": "#39394e",
          "warmneutral-900": "#50506d",
          "warmneutral-1000": "#67678b",
          "warmneutral-1100": "#8484a4",
          "warmneutral-1200": "#a3a3bb",
          "warmneutral-1300": "#c1c1d1",
          "warmneutral-1400": "#e0e0e8",
          "warmneutral-1500": "#f0f0f4",
          "warmneutral-1600": "#f7f7f8",
        },
        semantic: {
          "background-interaction-disable": "#f0f0f4",
          "background-interaction-inactive": "#a3a3bb",
          "background-normal-alternative": "#f7f7f8",
          "background-normal-normal": "#ffffff",
          "fill-alternative": "#67678b0d",
          "fill-normal": "#67678b14",
          "fill-strong": "#67678b29",
          "inverse-background": "#1a1a23",
          "inverse-label": "#f7f7f8",
          "inverse-primary": "#374a95",
          "label-alternative": "#39394e9c",
          "label-assistive": "#39394e47",
          "label-disable": "#37383c29",
          "label-neutral": "#39394ee0",
          "label-normal": "#16161d",
          "label-strong": "#000000",
          "line-normal-alternative": "#67678b14",
          "line-normal-neutral": "#67678b29",
          "line-normal-normal": "#67678b38",
          "line-normal-strong": "#67678b85",
          "line-solid-alternative": "#f7f7f8",
          "line-solid-neutral": "#f0f0f4",
          "line-solid-normal": "#e0e0e8",
          "line-solid-strong": "#c1c1d1",
          "material-dimmer": "#16161d82",
          "primary-heavy": "#293770",
          "primary-normal": "#374a95",
          "primary-strong": "#304082",
          "secondary-heavy": "#c3acff",
          "secondary-normal": "#e5dcff",
          "secondary-strong": "#d9ccff",
          "static-black": "#000000",
          "static-white": "#ffffff",
          "status-cautionary": "#ff9200",
          "status-negative": "#ff4242",
          "status-positive": "#00bf40",
        },
      },
      opacity: {
        0: "0",
        5: "0.05",
        8: "0.08",
        12: "0.12",
        16: "0.16",
        22: "0.22",
        28: "0.28",
        35: "0.35",
        43: "0.43",
        52: "0.52",
        61: "0.61",
        74: "0.74",
        88: "0.88",
        97: "0.97",
        100: "1",
      },
    },
  },
  plugins: [
    (await import("tailwindcss-animate")).default,
    // Atomic 토큰을 CSS 변수로 주입하는 플러그인
    function ({ addBase }) {
      addBase({
        ":root": atomicTokens,
      });
    },
  ],
};

export default config;
