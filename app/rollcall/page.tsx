import { Suspense } from "react";
import { Users, Award } from "lucide-react";

import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { RollCallPageClient } from "./rollcall-page-client";

async function getRooms() {
  try {
    return await api.get("/rooms");
  } catch (error) {
    return [];
  }
}

async function getStudents() {
  try {
    return await api.students.getAll();
  } catch (error) {
    return [];
  }
}

async function getRollcalls() {
  try {
    return await api.get("/rollcalls");
  } catch (error) {
    return [];
  }
}

export default async function RollCallPage() {
  const [rooms, students, rollcalls] = await Promise.all([
    getRooms(),
    getStudents(),
    getRollcalls(),
  ]);
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">점호 관리</h1>
          <p className="text-muted-foreground">
            학생 출석 확인 및 상/벌점 관리
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <RollCallPageClient
            initialRooms={rooms}
            initialStudents={students}
            initialRollcalls={rollcalls}
          />
        </Suspense>
      </div>
    </Layout>
  );
}
