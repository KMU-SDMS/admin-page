"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  Send,
  RefreshCw,
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
import { NoticeEditModal } from "@/components/notices/notice-edit-modal";
import { NoticeDeleteDialog } from "@/components/notices/notice-delete-dialog";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timeFilter, setTimeFilter] = useState<string>("this-week");
  const [sortFilter, setSortFilter] = useState<string>("latest");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { toast } = useToast();
  const {
    data: notices,
    pageInfo,
    isLoading: noticesLoading,
    refetch: refetchNotices,
    mutate: mutateNotice,
  } = useNotices({ page: currentPage });

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

  // 서버에서 페이지네이션된 데이터를 사용
  const displayNotices = notices || [];
  const totalItems = pageInfo?.total_notice || 0;
  const totalPages = pageInfo?.total_page || 1;
  const startIndex = ((pageInfo?.now_page || 1) - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalItems);

  // 동적으로 빈 행 개수 계산 (항상 10개 행 유지)
  const emptyRowsCount = Math.max(0, 10 - displayNotices.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset page when filters change (현재는 서버 페이지네이션을 사용하므로 주석 처리)
  // useEffect(() => {
  //   setCurrentPage(1);
  // }, [timeFilter, sortFilter]);

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

  const handleEditNotice = (id: number) => {
    const notice = displayNotices.find((n) => n.id === id);
    if (notice) {
      setSelectedNotice(notice);
      setShowEditModal(true);
      setShowModal(false);
    }
  };

  const handleDeleteNotice = (id: number) => {
    console.log("handleDeleteNotice 호출:", id);
    const notice = displayNotices.find((n) => n.id === id);
    console.log("찾은 공지사항:", notice);
    if (notice) {
      setSelectedNotice(notice);
      setShowDeleteDialog(true);
      setShowModal(false);
    }
  };

  const handleEditSuccess = () => {
    refetchNotices();
  };

  const handleDeleteSuccess = () => {
    refetchNotices();
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
        <div className="flex flex-col xl:flex-row gap-1.5">
          {/* Notice Creation Form - Left Panel */}
          <div
            className={`space-y-6 transition-all duration-700 ease-in-out ${
              isListExpanded
                ? "w-0 opacity-0 overflow-hidden pointer-events-none"
                : "w-full xl:w-5/8 opacity-100"
            }`}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  공지 작성
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col h-full space-y-4"
                >
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
                  <div className="space-y-2 flex-1 flex flex-col">
                    <Label htmlFor="content">내용</Label>
                    <Textarea
                      id="content"
                      placeholder="공지사항 내용을 입력하세요"
                      value={form.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      className="flex-1 resize-none"
                      maxLength={2000}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowModal(true)}
                      disabled={!isFormValid}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      미리보기
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full sm:w-auto"
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
              isListExpanded ? "w-full min-w-0" : "w-full xl:w-3/8"
            }`}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between w-full gap-4 overflow-x-auto">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsListExpanded(!isListExpanded)}
                      title={isListExpanded ? "축소" : "확대"}
                      className="transition-transform duration-300 ease-in-out"
                    >
                      <div className="transition-transform duration-300 ease-in-out">
                        {isListExpanded ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </div>
                    </Button>
                    <CardTitle className="whitespace-nowrap">
                      공지 목록
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-24 [&>svg]:bg-transparent [&>svg]:text-muted-foreground">
                        <SelectValue placeholder="이번 주" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this-week">이번 주</SelectItem>
                        <SelectItem value="this-month">이번 달</SelectItem>
                        <SelectItem value="all">전체</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortFilter} onValueChange={setSortFilter}>
                      <SelectTrigger className="w-24 [&>svg]:bg-transparent [&>svg]:text-muted-foreground">
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
                      className="flex-shrink-0"
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
              <CardContent className="flex flex-col h-full">
                <div className="flex flex-col overflow-x-auto min-w-0 h-[410px]">
                  <Table className="min-w-full">
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
                        <TableRow className="h-[33px]">
                          <TableCell
                            colSpan={4}
                            className="text-center h-[33px]"
                          >
                            <LoadingSpinner />
                          </TableCell>
                        </TableRow>
                      ) : displayNotices.length > 0 ? (
                        <>
                          {displayNotices.map((notice) => (
                            <TableRow
                              key={notice.id}
                              className="cursor-pointer hover:bg-gray-50 h-[33px]"
                              onClick={() => handleNoticeClick(notice)}
                            >
                              <TableCell className="font-medium min-w-0">
                                <div className="flex items-center gap-2 truncate">
                                  {notice.title.length > 7
                                    ? `${notice.title.substring(0, 7)}...`
                                    : notice.title}
                                </div>
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
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
                              <TableCell className="whitespace-nowrap">
                                {formatDate(notice.date)}
                              </TableCell>
                              <TableCell className="whitespace-nowrap">
                                관리자
                              </TableCell>
                            </TableRow>
                          ))}
                          {/* Fill remaining rows to maintain height */}
                          {Array.from({ length: emptyRowsCount }, (_, i) => (
                            <TableRow key={`empty-${i}`} className="h-[33px]">
                              <TableCell
                                colSpan={4}
                                className="h-[33px]"
                              ></TableCell>
                            </TableRow>
                          ))}
                        </>
                      ) : (
                        <>
                          <TableRow className="h-[33px]">
                            <TableCell
                              colSpan={4}
                              className="text-center text-muted-foreground h-[33px]"
                            >
                              공지사항이 없습니다.
                            </TableCell>
                          </TableRow>
                          {/* Fill remaining rows to maintain height */}
                          {Array.from({ length: 9 }, (_, i) => (
                            <TableRow key={`empty-${i}`} className="h-[33px]">
                              <TableCell
                                colSpan={4}
                                className="h-[33px]"
                              ></TableCell>
                            </TableRow>
                          ))}
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              {/* Pagination */}
              {totalPages >= 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t gap-4">
                  <div className="text-sm text-muted-foreground text-center sm:text-left">
                    총 {totalItems}개 중 {startIndex + 1}-
                    {Math.min(endIndex, totalItems)}개 표시
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={pageInfo?.now_page === 1}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handlePageChange((pageInfo?.now_page || 1) - 1)
                      }
                      disabled={pageInfo?.now_page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 flex-wrap">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          const currentPageNum = pageInfo?.now_page || 1;
                          const pageNum =
                            Math.max(
                              1,
                              Math.min(totalPages - 4, currentPageNum - 2)
                            ) + i;
                          if (pageNum > totalPages) return null;
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPageNum === pageNum
                                  ? "default"
                                  : "outline"
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
                      onClick={() =>
                        handlePageChange((pageInfo?.now_page || 1) + 1)
                      }
                      disabled={pageInfo?.now_page === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(totalPages)}
                      disabled={pageInfo?.now_page === totalPages}
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
                  id: selectedNotice.id,
                }
              : {
                  title: form.title,
                  body: form.content,
                  is_important: form.is_important,
                  date: new Date().toISOString().split("T")[0],
                }
          }
          onEdit={handleEditNotice}
          onDelete={handleDeleteNotice}
        />

        {/* Notice Edit Modal */}
        <NoticeEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedNotice(null);
          }}
          notice={selectedNotice}
          onSuccess={handleEditSuccess}
        />

        {/* Notice Delete Dialog */}
        <NoticeDeleteDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedNotice(null);
          }}
          notice={selectedNotice}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </Layout>
  );
}
