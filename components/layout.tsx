"use client";

import type React from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex compact-height bg-background">
      {/* 모바일에서는 사이드바 숨김, 데스크톱에서는 표시 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="compact-main">{children}</main>
      </div>
    </div>
  );
}
