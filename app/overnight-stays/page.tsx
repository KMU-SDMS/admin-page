import type React from "react";
import { Suspense } from "react";
import { Layout } from "@/components/layout";
import { OvernightStaysPageClient } from "./overnight-stays-page-client";

export default function OvernightStaysPage() {
  return (
    <Layout>
      <div className="h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <OvernightStaysPageClient />
        </Suspense>
      </div>
    </Layout>
  );
}

