import { Suspense } from "react";
import { Users, Filter, RefreshCw, Plus, Search } from "lucide-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StudentListTable } from "@/components/students/student-list-table";
import { api } from "@/lib/api";
import { Student } from "@/lib/types";
import { StudentsPageClient } from "./students-page-client";

async function getStudents() {
  try {
    return await api.students.getAll();
  } catch (error) {
    console.error("Failed to fetch students:", error);
    return [];
  }
}

async function getRooms() {
  try {
    return await api.get("/rooms");
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    return [];
  }
}

export default async function StudentsPage() {
  const [students, rooms] = await Promise.all([getStudents(), getRooms()]);

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

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">전체 학생</span>
              </div>
              <div className="text-2xl font-bold mt-2">{students.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Client Component for Interactive Features */}
        <Suspense fallback={<div>Loading...</div>}>
          <StudentsPageClient initialStudents={students} initialRooms={rooms} />
        </Suspense>
      </div>
    </Layout>
  );
}
