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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">학생 관리</h1>
            <p className="text-muted-foreground">
              기숙사 학생 정보 관리 및 현황 확인
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            학생 추가
          </Button>
        </div>

        {/* Client Component for Interactive Features */}
        <Suspense fallback={<div>Loading...</div>}>
          <StudentsPageClient initialStudents={students} />
        </Suspense>
      </div>
    </Layout>
  );
}
