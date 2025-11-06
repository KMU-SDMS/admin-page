import type React from "react";
import { Suspense } from "react";
import { Layout } from "@/components/layout";
import { BillPageClient } from "./bill-page-client";

export default function BillPage() {
  return (
    <Layout>
      <div className="h-full">
        <Suspense fallback={<div>Loading...</div>}>
          <BillPageClient />
        </Suspense>
      </div>
    </Layout>
  );
}
