import { Suspense } from "react";
import { Users, Award } from "lucide-react";

import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";

import { RollCallPageClient } from "./rollcall-page-client";

async function getRooms() {
  try {
    return await api.rooms.getAll();
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
    return await api.rollcalls.getAll();
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
