"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Check,
  Clock,
  X,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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

interface NoticesPageClientProps {
  initialNoticesData: {
    notices: Notice[];
    pageInfo: {
      total_notice: number;
      total_page: number;
      now_page: number;
    };
  };
}

export function NoticesPageClient({
  initialNoticesData,
}: NoticesPageClientProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [timeFilter, setTimeFilter] = useState<
    "this-week" | "this-month" | "all"
  >("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const { toast } = useToast();
  const {
    data: notices,
    pageInfo,
    isLoading: noticesLoading,
    refetch: refetchNotices,
    mutate: mutateNotice,
  } = useNotices({
    page: currentPage,
    timeFilter: timeFilter as "this-week" | "this-month" | "all",
    sortFilter: "latest", // 기본값으로 고정
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${month}.${day} ${hours}:${minutes}`;
  };

  // Use server pagination data
  const displayNotices =
    notices.length > 0 ? notices : initialNoticesData.notices;
  const displayPageInfo = pageInfo || initialNoticesData.pageInfo;
  const totalItems = displayPageInfo?.total_notice || 0;
  const totalPages = displayPageInfo?.total_page || 1;
  const startIndex = ((displayPageInfo?.now_page || 1) - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalItems);

  // 동적으로 빈 행 개수 계산 (항상 10개 행 유지)
  const emptyRowsCount = Math.max(0, 10 - displayNotices.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    const notice = displayNotices.find((n) => n.id === id);
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

  // Handle filter changes - 현재 페이지 유지

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
    <div className="flex flex-col h-full">
      {/* Search Box Area */}
      <div className="flex items-center px-20 pt-[48px]">
        {/* Page Title */}
        <h1
          className="text-[28px] font-bold leading-[38.024px] tracking-[-0.661px]"
          style={{ color: "#16161d" }}
        >
          공지사항
        </h1>
        {/* Search Box */}
        <div className="flex items-center gap-2 w-[614px] h-[48px] ml-[161px]">
          <Input
            placeholder="공지 이름, 대상자명 검색"
            className="flex-1 h-full"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-20 flex-1 min-h-0 px-20 pb-[30px] pt-4">
        {/* Left Sidebar Container */}
        <div className="w-[176px] flex-shrink-0">
          {/* Create Button */}
          <Button
            onClick={() => setShowEditModal(true)}
            className="w-[131px] h-[48px] text-[17px] font-bold leading-[24.004px] tracking-[0px]"
            style={{
              backgroundColor: "#374a95",
              color: "#f7f7f8",
              border: "1px solid #67678b38",
            }}
          >
            신규 작성
            <Plus className="h-4 w-4 mr-2" style={{ color: "#ffffff" }} />
          </Button>

          {/* Total Count with Refresh Button */}
          <div className="flex items-center gap-[10px] mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-[32px] w-[32px] rounded-full flex-shrink-0"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <div
              className="text-[16px] font-bold leading-[26px] tracking-[0.091px]"
              style={{ color: "#16161d" }}
            >
              총 {totalItems}건
            </div>
          </div>

          {/* Filters Card */}
          <Card className="w-[176px] h-[616px] mt-4">
            <CardContent className="px-4 space-y-6 overflow-y-auto h-full">
              {/* Status Filter */}
              <div className="space-y-3">
                <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                  게시 상태
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="published" defaultChecked />
                      <Label
                        htmlFor="published"
                        className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                      >
                        공지 완료
                      </Label>
                    </div>
                    <Check className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="scheduled" defaultChecked />
                      <Label
                        htmlFor="scheduled"
                        className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                      >
                        작성 예약
                      </Label>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="deleted" defaultChecked />
                      <Label
                        htmlFor="deleted"
                        className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                      >
                        공지 삭제
                      </Label>
                    </div>
                    <X className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="border-t" />

              {/* Toggle Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Switch defaultChecked />
                  <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]">
                    중요공지 맨 앞
                  </Label>
                </div>
                <div className="flex items-center justify-between">
                  <Switch defaultChecked />
                  <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]">
                    만료 공지 표시
                  </Label>
                </div>
              </div>

              <div className="border-t" />

              {/* Date Filter */}
              <div className="space-y-2">
                <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                  날짜
                </Label>
                <Button
                  variant="outline"
                  className="w-[75px] h-[32px] rounded-md justify-start text-[15px] font-medium leading-[22.005px] tracking-[0.144px] px-2"
                  onClick={() => {}}
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  전체
                </Button>
              </div>

              <div className="border-t" />

              {/* Target Group Filter */}
              <div className="space-y-3">
                <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                  대상 그룹
                </Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="retired" defaultChecked />
                    <Label
                      htmlFor="retired"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      퇴사생
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="freshman" defaultChecked />
                    <Label
                      htmlFor="freshman"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      신입생
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="year1" defaultChecked />
                    <Label
                      htmlFor="year1"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      1학년
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="year2" defaultChecked />
                    <Label
                      htmlFor="year2"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      2학년
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="year3" defaultChecked />
                    <Label
                      htmlFor="year3"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      3학년
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="year4" defaultChecked />
                    <Label
                      htmlFor="year4"
                      className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                    >
                      4학년
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table Area */}
        <Card className="flex-1 flex flex-col min-h-0 w-[1187px] h-[938px]">
          <CardContent className="px-4 py-0 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="w-12"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      상태
                    </TableHead>
                    <TableHead
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      제목/내용
                    </TableHead>
                    <TableHead
                      className="hidden md:table-cell"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      작성자/작성일
                    </TableHead>
                    <TableHead
                      className="hidden lg:table-cell"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      대상
                    </TableHead>
                    <TableHead
                      className="hidden xl:table-cell"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      조회 현황
                    </TableHead>
                    <TableHead
                      className="w-24"
                      style={{
                        paddingTop: "14px",
                        paddingBottom: "14px",
                        paddingLeft: "19.5px",
                        paddingRight: "19.5px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      작업
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody style={{ marginTop: "8px" }}>
                  {noticesLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : displayNotices.length > 0 ? (
                    <>
                      {displayNotices.map((notice) => (
                        <TableRow
                          key={notice.id}
                          className="cursor-pointer"
                          onClick={() => handleNoticeClick(notice)}
                        >
                          <TableCell>
                            {notice.is_important ? (
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                <span className="text-green-600 text-xs">
                                  ★
                                </span>
                              </div>
                            ) : (
                              <div className="w-8 h-8"></div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  lineHeight: "24px",
                                  letterSpacing: "0.144px",
                                  color: "#16161d",
                                }}
                              >
                                {notice.title}
                              </div>
                              <div
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  lineHeight: "16.008px",
                                  letterSpacing: "0.302px",
                                  color: "#39394e9c",
                                }}
                              >
                                {notice.content.length > 70
                                  ? `${notice.content.substring(0, 70)}...`
                                  : notice.content}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="text-sm">관리자</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(notice.date)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <span className="px-2 py-1 rounded-md text-xs bg-primary/10 text-primary">
                              신입생
                            </span>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <div className="text-sm">3/45명 미읽음</div>
                            <div className="text-xs text-muted-foreground">
                              96%
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNoticeClick(notice);
                              }}
                            >
                              ⋮
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {Array.from({ length: emptyRowsCount }, (_, i) => (
                        <TableRow key={`empty-${i}`}>
                          <TableCell colSpan={6}></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <>
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          공지사항이 없습니다.
                        </TableCell>
                      </TableRow>
                      {Array.from({ length: 9 }, (_, i) => (
                        <TableRow key={`empty-${i}`}>
                          <TableCell colSpan={6}></TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination */}
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              총 {totalItems}건 중 {startIndex + 1}-{endIndex}건 표시
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={displayPageInfo?.now_page === 1}
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange((displayPageInfo?.now_page || 1) - 1)
                  }
                  disabled={displayPageInfo?.now_page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: Math.min(10, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={
                        displayPageInfo?.now_page === pageNum
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange((displayPageInfo?.now_page || 1) + 1)
                  }
                  disabled={displayPageInfo?.now_page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={displayPageInfo?.now_page === totalPages}
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Notice Preview Modal */}
      {showModal && selectedNotice && (
        <NoticePreviewModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedNotice(null);
          }}
          noticeData={{
            title: selectedNotice.title,
            body: selectedNotice.content,
            is_important: selectedNotice.is_important,
            date: selectedNotice.date,
            id: selectedNotice.id,
          }}
          onEdit={handleEditNotice}
          onDelete={handleDeleteNotice}
        />
      )}

      {/* Notice Edit/Create Modal */}
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
  );
}
