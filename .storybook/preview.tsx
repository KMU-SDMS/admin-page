import "../app/globals.css";
import { ThemeProvider } from "../components/theme-provider";
import type { Preview, Decorator } from "@storybook/nextjs-vite";
import React from "react";

// 전역 데코레이터 - Theme Provider 추가
const withTheme: Decorator = (Story) => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <div className="min-h-screen bg-background text-foreground p-8">
      <Story />
    </div>
  </ThemeProvider>
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#0f0f10",
        },
      ],
    },
  },
  decorators: [withTheme],
};

export default preview;
