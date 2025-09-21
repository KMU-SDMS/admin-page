"use client";

import type React from "react";
import { useState } from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex compact-height bg-background">
      {/* 데스크톱 사이드바 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* 모바일 사이드바 오버레이 */}
      <div
        className={`
          fixed inset-0 z-40 bg-black transition-opacity duration-300 ease-in-out lg:hidden
          ${mobileSidebarOpen ? "opacity-50" : "opacity-0 pointer-events-none"}
        `}
        onClick={() => setMobileSidebarOpen(false)}
      />

      {/* 모바일 사이드바 */}
      <div
        className="fixed inset-y-0 z-50 w-44 transition-all duration-300 ease-in-out lg:hidden"
        style={{
          left: mobileSidebarOpen ? "0" : "-100%",
        }}
      >
        <Sidebar onMobileClose={() => setMobileSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />
        <main className="compact-main bg-background">{children}</main>
      </div>
    </div>
  );
}
