import { Suspense } from "react";
import { MessageSquare, Filter, RefreshCw } from "lucide-react";

import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/ui/search-input";
import { InquiryKanbanBoard } from "@/components/inquiries/inquiry-kanban-board";
import { InquiryListView } from "@/components/inquiries/inquiry-list-view";
import { api } from "@/lib/api";
import { InquiriesPageClient } from "./inquiries-page-client";

async function getInquiries() {
  try {
    return await api.get("/inquiries");
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

export default async function InquiriesPage() {
  const [inquiries, students] = await Promise.all([
    getInquiries(),
    getStudents(),
  ]);
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">문의 관리</h1>
          <p className="text-muted-foreground">
            학생 문의사항 접수 및 처리 현황 관리
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <InquiriesPageClient
            initialInquiries={inquiries}
            initialStudents={students}
          />
        </Suspense>
      </div>
    </Layout>
  );
}
