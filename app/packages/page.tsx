import { Suspense } from "react";
import { Package, Filter, RefreshCw, Eye } from "lucide-react";

// 동적 렌더링 강제
export const dynamic = "force-dynamic";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { DataTable, type Column } from "@/components/ui/data-table";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import { PackageDetailModal } from "@/components/packages/package-detail-modal";
import { api } from "@/lib/api";
import type { Parcel } from "@/lib/types";
import { PackagesPageClient } from "./packages-page-client";

async function getParcels() {
  try {
    return await api.get("/parcels");
  } catch (error) {
    console.error("Failed to fetch parcels:", error);
    return [];
  }
}

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

export default async function PackagesPage() {
  const [parcels, students, rooms] = await Promise.all([
    getParcels(),
    getStudents(),
    getRooms(),
  ]);
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">택배 관리</h1>
          <p className="text-muted-foreground">
            학생 택배 도착 및 수령 현황 관리
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <PackagesPageClient
            initialParcels={parcels}
            initialStudents={students}
            initialRooms={rooms}
          />
        </Suspense>
      </div>
    </Layout>
  );
}
