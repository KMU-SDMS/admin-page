"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Send,
  RefreshCw,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { NoticePreviewModal } from "@/components/notices/notice-preview-modal";
import { useNotices } from "@/hooks/use-notices";
import { useToast } from "@/hooks/use-toast";
import type { Notice } from "@/lib/types";

interface NoticeForm {
  title: string;
  content: string;
  is_important: boolean;
}

export default function NoticesPage() {
  const [form, setForm] = useState<NoticeForm>({
    title: "",
    content: "",
    is_important: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>("this-week");
  const [sortFilter, setSortFilter] = useState<string>("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { toast } = useToast();
  const {
    data: notices,
    isLoading: noticesLoading,
    refetch: refetchNotices,
    mutate: mutateNotice,
  } = useNotices();

  const handleInputChange = (field: keyof NoticeForm, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await mutateNotice({
        title: form.title.trim(),
        content: form.content.trim(),
        is_important: form.is_important,
      });

      toast({
        title: "공지 작성 완료",
        description: "공지사항이 성공적으로 작성되었습니다.",
      });

      // Reset form
      setForm({
        title: "",
        content: "",
        is_important: false,
      });
      setShowModal(false);
    } catch (error) {
      toast({
        title: "공지 작성 실패",
        description:
          error instanceof Error ? error.message : "공지 작성에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTargetDisplay = (notice: Notice) => {
    return notice.is_important ? "중요공지" : "일반공지";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}.${day} ${hours}:${minutes}`;
  };

  // Filter and sort notices
  const getFilteredNotices = () => {
    if (!notices) return [];

    let filtered = [...notices];

    // Time filter
    if (timeFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();

      if (timeFilter === "this-week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (timeFilter === "this-month") {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(
        (notice) => new Date(notice.date) >= filterDate
      );
    }

    // Sort filter
    filtered.sort((a, b) => {
      if (sortFilter === "latest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else if (sortFilter === "oldest") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return 0;
    });

    return filtered;
  };

  // Pagination logic
  const itemsPerPage = 10;
  const totalItems = getFilteredNotices().length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotices = getFilteredNotices().slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, sortFilter]);

  const isFormValid = form.title.trim() && form.content.trim();

  const handleNoticeClick = (notice: Notice) => {
    setSelectedNotice(notice);
    setShowModal(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchNotices();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle F5 refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      setIsRefreshing(true);
    };

    const handleLoad = () => {
      setIsRefreshing(false);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("load", handleLoad);

    // Check if page is being refreshed
    if (document.readyState === "complete") {
      setIsRefreshing(false);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">공지 시스템</h1>
          <p className="text-muted-foreground">기숙사 공지사항 작성 및 관리</p>
        </div>

        <div className="flex gap-6">
          {/* Notice Creation Form - Left Panel */}
          <div
            className={`space-y-6 transition-all duration-700 ease-in-out ${
              isListExpanded
                ? "w-0 opacity-0 overflow-hidden"
                : "w-2/3 opacity-100"
            }`}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  공지 작성
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">제목</Label>
                    <Input
                      id="title"
                      placeholder="제목을 입력하세요"
                      value={form.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      maxLength={100}
                    />
                  </div>

                  {/* Important Notice Checkbox */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_important"
                      checked={form.is_important}
                      onCheckedChange={(checked) =>
                        handleInputChange("is_important", checked)
                      }
                    />
                    <Label
                      htmlFor="is_important"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      중요공지
                    </Label>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      placeholder="공지사항 내용을 입력하세요"
                      value={form.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      rows={8}
                      maxLength={2000}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(true)}
                      disabled={!isFormValid}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      미리보기
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          작성 중...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          공지 작성
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Notice List - Right Panel */}
          <div
            className={`space-y-6 transition-all duration-700 ease-in-out ${
              isListExpanded ? "w-full" : "w-1/3"
            }`}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsListExpanded(!isListExpanded)}
                      title={isListExpanded ? "축소" : "확대"}
                      className="transition-transform duration-300 ease-in-out"
                    >
                      <div className="transition-transform duration-300 ease-in-out">
                        {isListExpanded ? (
                          <ChevronLeft className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                    <CardTitle className="whitespace-nowrap">
                      공지 목록
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="이번 주" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-week">이번 주</SelectItem>
                        <SelectItem value="this-month">이번 달</SelectItem>
                        <SelectItem value="all">전체</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortFilter} onValueChange={setSortFilter}>
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="최신순" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="latest">최신순</SelectItem>
                        <SelectItem value="oldest">오래된순</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${
                          isRefreshing ? "animate-spin" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] flex flex-col">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="hover:bg-transparent">
                          제목
                        </TableHead>
                        <TableHead className="hover:bg-transparent">
                          공지유형
                        </TableHead>
                        <TableHead className="hover:bg-transparent">
                          작성일
                        </TableHead>
                        <TableHead className="hover:bg-transparent">
                          작성자
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {noticesLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            <LoadingSpinner />
                          </TableCell>
                        </TableRow>
                      ) : paginatedNotices.length > 0 ? (
                        <>
                          {paginatedNotices.map((notice) => (
                            <TableRow
                              key={notice.id}
                              className="cursor-pointer hover:bg-gray-50"
                              onClick={() => handleNoticeClick(notice)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  {notice.is_important && (
                                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                  )}
                                  {notice.title}
                                </div>
                              </TableCell>
                              <TableCell>
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    notice.is_important
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {notice.is_important
                                    ? "중요공지"
                                    : "일반공지"}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(notice.date)}</TableCell>
                              <TableCell>관리자</TableCell>
                            </TableRow>
                          ))}
                          {/* Fill remaining rows to maintain height */}
                          {Array.from(
                            {
                              length: Math.max(0, 10 - paginatedNotices.length),
                            },
                            (_, i) => (
                              <TableRow key={`empty-${i}`} className="h-[60px]">
                                <TableCell
                                  colSpan={4}
                                  className="h-[60px]"
                                ></TableCell>
                              </TableRow>
                            )
                          )}
                        </>
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center text-muted-foreground"
                          >
                            공지사항이 없습니다.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {/* Pagination */}
              {totalPages >= 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    총 {totalItems}개 중 {startIndex + 1}-
                    {Math.min(endIndex, totalItems)}개 표시
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPage - 2)
                            ) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => handlePageChange(pageNum)}
                              className="w-8 h-8 p-0"
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Notice Preview Modal */}
        <NoticePreviewModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedNotice(null);
          }}
          noticeData={
            selectedNotice
              ? {
                  title: selectedNotice.title,
                  body: selectedNotice.content,
                  is_important: selectedNotice.is_important,
                  date: selectedNotice.date,
                }
              : {
                  title: form.title,
                  body: form.content,
                  is_important: form.is_important,
                  date: new Date().toISOString().split("T")[0],
                }
          }
        />
      </div>
    </Layout>
  );
}
