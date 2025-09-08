"use client";

import { useState } from "react";
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
import { useInquiries } from "@/hooks/use-inquiries";
import { useStudents } from "@/hooks/use-students";
import { useToast } from "@/hooks/use-toast";

export default function InquiriesPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [nameSearch, setNameSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const { toast } = useToast();

  const {
    data: inquiries,
    isLoading: inquiriesLoading,
    refetch: refetchInquiries,
    mutate: mutateInquiry,
  } = useInquiries({
    status: statusFilter === "all" ? undefined : statusFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    name: nameSearch || undefined,
  });

  const { data: students } = useStudents();

  // Get unique categories for filter
  const categories = Array.from(
    new Set(inquiries.map((i) => i.category)),
  ).sort();

  // Enrich inquiries with student information
  const enrichedInquiries = inquiries.map((inquiry) => {
    const student = students.find((s) => s.id === inquiry.studentId);
    return {
      ...inquiry,
      studentName: student?.name || `학생 ${inquiry.studentId}`,
    };
  });

  const handleStatusChange = async (
    inquiryId: number,
    newStatus: "OPEN" | "IN_PROGRESS" | "RESOLVED",
  ) => {
    try {
      await mutateInquiry(inquiryId, { status: newStatus });
      toast({
        title: "상태 변경 완료",
        description: "문의 상태가 성공적으로 변경되었습니다.",
      });
    } catch (error) {
      toast({
        title: "상태 변경 실패",
        description:
          error instanceof Error ? error.message : "상태 변경에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  // Statistics
  const stats = {
    total: enrichedInquiries.length,
    open: enrichedInquiries.filter((i) => i.status === "OPEN").length,
    inProgress: enrichedInquiries.filter((i) => i.status === "IN_PROGRESS")
      .length,
    resolved: enrichedInquiries.filter((i) => i.status === "RESOLVED").length,
  };

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

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              필터 및 검색
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>상태</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="전체 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 상태</SelectItem>
                    <SelectItem value="OPEN">접수</SelectItem>
                    <SelectItem value="IN_PROGRESS">처리중</SelectItem>
                    <SelectItem value="RESOLVED">완료</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>카테고리</Label>
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="전체 카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>학생명 검색</Label>
                <SearchInput
                  placeholder="학생명 입력..."
                  value={nameSearch}
                  onChange={setNameSearch}
                />
              </div>

              <div className="space-y-2">
                <Label>보기 방식</Label>
                <div className="pt-2">
                  <Tabs
                    value={viewMode}
                    onValueChange={(value) =>
                      setViewMode(value as "kanban" | "list")
                    }
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="kanban">칸반</TabsTrigger>
                      <TabsTrigger value="list">목록</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <div className="space-y-2">
                <Label>작업</Label>
                <div className="pt-2">
                  <Button
                    onClick={refetchInquiries}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    새로고침
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">전체 문의</span>
              </div>
              <div className="text-2xl font-bold mt-2">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">접수</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-blue-600">
                {stats.open}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">처리중</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-orange-600">
                {stats.inProgress}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">완료</span>
              </div>
              <div className="text-2xl font-bold mt-2 text-green-600">
                {stats.resolved}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {viewMode === "kanban" ? (
          <InquiryKanbanBoard
            inquiries={enrichedInquiries}
            isLoading={inquiriesLoading}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <InquiryListView
            inquiries={enrichedInquiries}
            isLoading={inquiriesLoading}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </Layout>
  );
}
