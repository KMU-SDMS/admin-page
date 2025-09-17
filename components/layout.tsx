"use client";

import type React from "react";

import { Header } from "./header";
import { Sidebar } from "./sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* 모바일에서는 사이드바 숨김, 데스크톱에서는 표시 */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-2 sm:p-3 lg:p-4 xl:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
