import { Suspense } from "react";
import { Plus } from "lucide-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { StudentsPageClient } from "./students-page-client";

async function getStudents() {
  try {
    return await api.students.getAll();
  } catch (error) {
    return [];
  }
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Client Component for Interactive Features */}
        <Suspense fallback={<div>Loading...</div>}>
          <StudentsPageClient initialStudents={students} />
        </Suspense>
      </div>
    </Layout>
  );
}
