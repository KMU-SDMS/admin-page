import type React from "react";
import { Suspense } from "react";
import { Layout } from "@/components/layout";
import { NoticesPageClient } from "./notices-page-client";

export default function NoticesPage() {
  return (
    <Layout>
      <div className="h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <NoticesPageClient />
        </Suspense>
      </div>
    </Layout>
  );
}
