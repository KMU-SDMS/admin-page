// 디자인 토큰 타입 정의
export interface ColorToken {
  name: string;
  value: string;
  ref?: string;
}

export interface TypographyToken {
  description: string;
  fontSize: string;
  textDecoration: string;
  fontFamily: string;
  fontWeight: number;
  fontStyle: string;
  fontStretch: string;
  letterSpacing: string;
  lineHeight: string;
  paragraphIndent: string;
  paragraphSpacing: string;
  textCase: string;
}

export interface OpacityToken {
  name: string;
  value: number;
}

// 디자인 토큰 데이터
export const designTokens = {
  // Atomic Colors
  atomic: {
    blue: {
      100: "#070913",
      200: "#0e1225",
      300: "#141c38",
      400: "#1c2549",
      500: "#212e5d",
      600: "#293770",
      700: "#304082",
      800: "#374a95",
      900: "#4158b1",
      1000: "#576dc1",
      1100: "#7385cb",
      1200: "#8f9dd6",
      1300: "#abb6e0",
      1400: "#c7ceea",
      1500: "#e3e7f5",
    },
    green: {
      10: "#00230b",
      99: "#f2fff6",
      200: "#004416",
      300: "#006d24",
      400: "#009632",
      500: "#00bf40",
      600: "#1dd35a",
      700: "#49e57d",
      800: "#7df5a5",
      900: "#acfcc7",
      950: "#d9ffe6",
    },
    neutral: {
      100: "#0f0f10",
      200: "#141415",
      300: "#171719",
      400: "#1b1c1e",
      500: "#212225",
      600: "#292a2d",
      700: "#2e2f33",
      800: "#333438",
      900: "#37383c",
      1000: "#46474c",
      1100: "#5a5c63",
      1200: "#70737c",
      1300: "#878a93",
      1400: "#989ba2",
      1500: "#aeb0b6",
      1600: "#c2c4c8",
      1700: "#dbdcdf",
      1800: "#e1e2e4",
      1900: "#eaebec",
      2000: "#f4f4f5",
      2100: "#f7f7f8",
    },
    orange: {
      99: "#fffcf7",
      100: "#361e00",
      200: "#663900",
      300: "#9b5800",
      400: "#d37700",
      500: "#ff9200",
      600: "#ffa838",
      700: "#ffc06d",
      800: "#ffd39b",
      900: "#fee5c6",
      950: "#fef4e6",
    },
    purple: {
      100: "#0d002f",
      200: "#1b005f",
      300: "#28008e",
      400: "#3600bf",
      500: "#4300ee",
      600: "#5d1eff",
      700: "#7f4eff",
      800: "#a17dff",
      900: "#c3acff",
      1000: "#d9ccff",
      1100: "#e5dcff",
      1200: "#ece2ff",
      1300: "#f2edff",
      1400: "#f0eaff",
    },
    red: {
      100: "#3a0000",
      200: "#730303",
      300: "#b00c0c",
      400: "#e52222",
      500: "#ff4242",
      600: "#ff6363",
      700: "#ff8c8c",
      800: "#ffb5b5",
      900: "#fed5d5",
      950: "#feecec",
      990: "#fffafa",
    },
    warmneutral: {
      100: "#09090c",
      200: "#0d0d12",
      300: "#111118",
      400: "#16161d",
      500: "#1a1a23",
      600: "#1e1e29",
      700: "#23232f",
      800: "#39394e",
      900: "#50506d",
      1000: "#67678b",
      1100: "#8484a4",
      1200: "#a3a3bb",
      1300: "#c1c1d1",
      1400: "#e0e0e8",
      1500: "#f0f0f4",
      1600: "#f7f7f8",
    },
    common: {
      0: "#000000",
      2200: "#ffffff",
    },
  },

  // Semantic Colors
  semantic: {
    background: {
      interaction: {
        disable: "#f0f0f4",
        inactive: "#a3a3bb",
      },
      normal: {
        alternative: "#f7f7f8",
        normal: "#ffffff",
      },
    },
    fill: {
      alternative: "#67678b0d",
      normal: "#67678b14",
      strong: "#67678b29",
    },
    inverse: {
      background: "#1a1a23",
      label: "#f7f7f8",
      primary: "#374a95",
    },
    label: {
      alternative: "#39394e9c",
      assistive: "#39394e47",
      disable: "#37383c29",
      neutral: "#39394ee0",
      normal: "#16161d",
      strong: "#000000",
    },
    line: {
      normal: {
        alternative: "#67678b14",
        neutral: "#67678b29",
        normal: "#67678b38",
        strong: "#67678b85",
      },
      solid: {
        alternative: "#f7f7f8",
        neutral: "#f0f0f4",
        normal: "#e0e0e8",
        strong: "#c1c1d1",
      },
    },
    material: {
      dimmer: "#16161d82",
    },
    primary: {
      heavy: "#293770",
      normal: "#374a95",
      strong: "#304082",
    },
    secondary: {
      heavy: "#c3acff",
      normal: "#e5dcff",
      strong: "#d9ccff",
    },
    static: {
      black: "#000000",
      white: "#ffffff",
    },
    status: {
      cautionary: "#ff9200",
      negative: "#ff4242",
      positive: "#00bf40",
    },
  },

  // Typography
  typography: {
    "display-1": {
      bold: {
        fontSize: "56px",
        fontWeight: 700,
        lineHeight: "72.016px",
        letterSpacing: "-1.786px",
      },
      medium: {
        fontSize: "56px",
        fontWeight: 500,
        lineHeight: "72.016px",
        letterSpacing: "-1.786px",
      },
      regular: {
        fontSize: "56px",
        fontWeight: 400,
        lineHeight: "72.016px",
        letterSpacing: "-1.786px",
      },
    },
    "display-2": {
      bold: {
        fontSize: "40px",
        fontWeight: 700,
        lineHeight: "52px",
        letterSpacing: "-1.128px",
      },
      medium: {
        fontSize: "40px",
        fontWeight: 500,
        lineHeight: "52px",
        letterSpacing: "-1.128px",
      },
      regular: {
        fontSize: "40px",
        fontWeight: 400,
        lineHeight: "52px",
        letterSpacing: "-1.128px",
      },
    },
    "title-1": {
      bold: {
        fontSize: "36px",
        fontWeight: 700,
        lineHeight: "48.024px",
        letterSpacing: "-0.972px",
      },
      medium: {
        fontSize: "36px",
        fontWeight: 500,
        lineHeight: "48.024px",
        letterSpacing: "-0.972px",
      },
      regular: {
        fontSize: "36px",
        fontWeight: 400,
        lineHeight: "48.024px",
        letterSpacing: "-0.972px",
      },
    },
    "title-2": {
      bold: {
        fontSize: "28px",
        fontWeight: 700,
        lineHeight: "38.024px",
        letterSpacing: "-0.661px",
      },
      medium: {
        fontSize: "28px",
        fontWeight: 500,
        lineHeight: "38.024px",
        letterSpacing: "-0.661px",
      },
      regular: {
        fontSize: "28px",
        fontWeight: 400,
        lineHeight: "38.024px",
        letterSpacing: "-0.661px",
      },
    },
    "title-3": {
      bold: {
        fontSize: "24px",
        fontWeight: 700,
        lineHeight: "32.016px",
        letterSpacing: "-0.552px",
      },
      medium: {
        fontSize: "24px",
        fontWeight: 500,
        lineHeight: "32.016px",
        letterSpacing: "-0.552px",
      },
      regular: {
        fontSize: "24px",
        fontWeight: 400,
        lineHeight: "32.016px",
        letterSpacing: "-0.552px",
      },
    },
    "heading-1": {
      bold: {
        fontSize: "22px",
        fontWeight: 700,
        lineHeight: "30.008px",
        letterSpacing: "-0.427px",
      },
      medium: {
        fontSize: "22px",
        fontWeight: 500,
        lineHeight: "30.008px",
        letterSpacing: "-0.427px",
      },
      regular: {
        fontSize: "22px",
        fontWeight: 400,
        lineHeight: "30.008px",
        letterSpacing: "-0.427px",
      },
    },
    "heading-2": {
      bold: {
        fontSize: "20px",
        fontWeight: 700,
        lineHeight: "28px",
        letterSpacing: "-0.24px",
      },
      medium: {
        fontSize: "20px",
        fontWeight: 500,
        lineHeight: "28px",
        letterSpacing: "-0.24px",
      },
      regular: {
        fontSize: "20px",
        fontWeight: 400,
        lineHeight: "28px",
        letterSpacing: "-0.24px",
      },
    },
    "headline-1": {
      bold: {
        fontSize: "18px",
        fontWeight: 700,
        lineHeight: "26.01px",
        letterSpacing: "-0.004px",
      },
      medium: {
        fontSize: "18px",
        fontWeight: 500,
        lineHeight: "26.01px",
        letterSpacing: "-0.004px",
      },
      regular: {
        fontSize: "18px",
        fontWeight: 400,
        lineHeight: "26.01px",
        letterSpacing: "-0.004px",
      },
    },
    "headline-2": {
      bold: {
        fontSize: "17px",
        fontWeight: 700,
        lineHeight: "24.004px",
        letterSpacing: "0px",
      },
      medium: {
        fontSize: "17px",
        fontWeight: 500,
        lineHeight: "24.004px",
        letterSpacing: "0px",
      },
      regular: {
        fontSize: "17px",
        fontWeight: 400,
        lineHeight: "24.004px",
        letterSpacing: "0px",
      },
    },
    "body-1": {
      "normal-regular": {
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "24px",
        letterSpacing: "0.091px",
      },
      "normal-medium": {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "24px",
        letterSpacing: "0.091px",
      },
      "normal-bold": {
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.091px",
      },
      "reading-regular": {
        fontSize: "16px",
        fontWeight: 400,
        lineHeight: "26px",
        letterSpacing: "0.091px",
      },
      "reading-medium": {
        fontSize: "16px",
        fontWeight: 500,
        lineHeight: "26px",
        letterSpacing: "0.091px",
      },
      "reading-bold": {
        fontSize: "16px",
        fontWeight: 700,
        lineHeight: "26px",
        letterSpacing: "0.091px",
      },
    },
    "body-2": {
      "normal-regular": {
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: "22.005px",
        letterSpacing: "0.144px",
      },
      "normal-medium": {
        fontSize: "15px",
        fontWeight: 500,
        lineHeight: "22.005px",
        letterSpacing: "0.144px",
      },
      "normal-bold": {
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "22.005px",
        letterSpacing: "0.144px",
      },
      "reading-regular": {
        fontSize: "15px",
        fontWeight: 400,
        lineHeight: "24px",
        letterSpacing: "0.144px",
      },
      "reading-medium": {
        fontSize: "15px",
        fontWeight: 500,
        lineHeight: "24px",
        letterSpacing: "0.144px",
      },
      "reading-bold": {
        fontSize: "15px",
        fontWeight: 700,
        lineHeight: "24px",
        letterSpacing: "0.144px",
      },
    },
    "label-1": {
      "normal-regular": {
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "20.006px",
        letterSpacing: "0.203px",
      },
      "normal-medium": {
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: "20.006px",
        letterSpacing: "0.203px",
      },
      "normal-bold": {
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "20.006px",
        letterSpacing: "0.203px",
      },
      "reading-regular": {
        fontSize: "14px",
        fontWeight: 400,
        lineHeight: "21.994px",
        letterSpacing: "0.203px",
      },
      "reading-medium": {
        fontSize: "14px",
        fontWeight: 500,
        lineHeight: "21.994px",
        letterSpacing: "0.203px",
      },
      "reading-bold": {
        fontSize: "14px",
        fontWeight: 700,
        lineHeight: "22px",
        letterSpacing: "0.203px",
      },
    },
    "label-2": {
      regular: {
        fontSize: "13px",
        fontWeight: 400,
        lineHeight: "18.005px",
        letterSpacing: "0.252px",
      },
      medium: {
        fontSize: "13px",
        fontWeight: 500,
        lineHeight: "18.005px",
        letterSpacing: "0.252px",
      },
      bold: {
        fontSize: "13px",
        fontWeight: 700,
        lineHeight: "18.005px",
        letterSpacing: "0.252px",
      },
    },
    "caption-1": {
      regular: {
        fontSize: "12px",
        fontWeight: 400,
        lineHeight: "16.008px",
        letterSpacing: "0.302px",
      },
      medium: {
        fontSize: "12px",
        fontWeight: 500,
        lineHeight: "16.008px",
        letterSpacing: "0.302px",
      },
      bold: {
        fontSize: "12px",
        fontWeight: 700,
        lineHeight: "16.008px",
        letterSpacing: "0.302px",
      },
    },
    "caption-2": {
      regular: {
        fontSize: "11px",
        fontWeight: 400,
        lineHeight: "14.003px",
        letterSpacing: "0.342px",
      },
      medium: {
        fontSize: "11px",
        fontWeight: 500,
        lineHeight: "14.003px",
        letterSpacing: "0.342px",
      },
      bold: {
        fontSize: "11px",
        fontWeight: 700,
        lineHeight: "14.003px",
        letterSpacing: "0.342px",
      },
    },
  },

  // Opacity
  opacity: {
    0: 0.0,
    5: 0.05,
    8: 0.08,
    12: 0.12,
    16: 0.16,
    22: 0.22,
    28: 0.28,
    35: 0.35,
    43: 0.43,
    52: 0.52,
    61: 0.61,
    74: 0.74,
    88: 0.88,
    97: 0.97,
    100: 1.0,
  },
};

// CSS 변수로 변환하는 헬퍼 함수
export function generateCSSVariables() {
  const variables: Record<string, string> = {};

  // Atomic colors
  Object.entries(designTokens.atomic).forEach(([colorFamily, shades]) => {
    Object.entries(shades).forEach(([shade, value]) => {
      variables[`--color-${colorFamily}-${shade}`] = value;
    });
  });

  // Semantic colors
  Object.entries(designTokens.semantic).forEach(([category, subcategory]) => {
    if (typeof subcategory === "object" && !Array.isArray(subcategory)) {
      Object.entries(subcategory).forEach(([key, value]) => {
        if (typeof value === "object" && !Array.isArray(value)) {
          Object.entries(value).forEach(([subkey, colorValue]) => {
            variables[`--color-${category}-${key}-${subkey}`] =
              colorValue as string;
          });
        } else {
          variables[`--color-${category}-${key}`] = value as string;
        }
      });
    }
  });

  // Typography
  Object.entries(designTokens.typography).forEach(([level, variants]) => {
    Object.entries(variants).forEach(([variant, styles]) => {
      Object.entries(styles).forEach(([property, value]) => {
        variables[`--typography-${level}-${variant}-${property}`] =
          value as string;
      });
    });
  });

  // Opacity
  Object.entries(designTokens.opacity).forEach(([name, value]) => {
    variables[`--opacity-${name}`] = value.toString();
  });

  return variables;
}

// 타이포그래피 스타일을 CSS 클래스로 변환하는 헬퍼 함수
export function getTypographyClass(level: string, variant: string) {
  const typography =
    designTokens.typography[level as keyof typeof designTokens.typography];
  if (!typography) return {};

  const styles = typography[variant as keyof typeof typography];
  if (!styles || typeof styles !== "object") return {};

  return {
    fontSize: (styles as any).fontSize,
    fontWeight: (styles as any).fontWeight,
    lineHeight: (styles as any).lineHeight,
    letterSpacing: (styles as any).letterSpacing,
    fontFamily: "Pretendard, system-ui, sans-serif",
  };
}
