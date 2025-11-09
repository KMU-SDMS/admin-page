"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import type { OvernightStayApplication } from "@/lib/types";
import { useOvernightStays } from "@/hooks/use-overnight-stays";
import { OvernightStayDetailModal } from "@/components/overnight-stays/overnight-stay-detail-modal";

const PAGE_SIZE = 10;

const statusLabelMap: Record<
  OvernightStayApplication["status"],
  { label: string; tone: "default" | "secondary" | "destructive" }
> = {
  pending: { label: "대기", tone: "secondary" },
  approved: { label: "승인", tone: "default" },
  rejected: { label: "거절", tone: "destructive" },
};

function formatDateRange(application: OvernightStayApplication) {
  const out = application.startDate ? new Date(application.startDate) : null;
  const back = application.endDate ? new Date(application.endDate) : null;

  const formatter = new Intl.DateTimeFormat("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });

  if (out && back) {
    return `${formatter.format(out)} - ${formatter.format(back)}`;
  }

  if (out) {
    return formatter.format(out);
  }

  if (back) {
    return formatter.format(back);
  }

  return "-";
}

function formatSubmittedAt(application: OvernightStayApplication) {
  if (!application.createdAt) {
    return "-";
  }

  const date = new Date(application.createdAt);
  return `${date.getMonth() + 1}.${String(date.getDate()).padStart(
    2,
    "0"
  )} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

export function OvernightStaysPageClient() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] =
    useState<OvernightStayApplication | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const queryParams = useMemo(
    () => ({
      page: currentPage,
      pageSize: PAGE_SIZE,
    }),
    [currentPage]
  );

  const { data, pageInfo, isLoading, error, refetch, updateStatus } =
    useOvernightStays(queryParams);

  const totalItems =
    pageInfo?.totalItems ?? (Array.isArray(data) ? data.length : 0);
  const totalPages = pageInfo?.totalPages ?? 1;
  const nowPage = pageInfo?.page ?? currentPage;
  const effectivePageSize = pageInfo?.pageSize ?? PAGE_SIZE;
  const startIndex = (nowPage - 1) * effectivePageSize;
  const endIndex = Math.min(startIndex + effectivePageSize, totalItems);

  const handleRowClick = (application: OvernightStayApplication) => {
    setSelectedApplication(application);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedApplication(null);
  };

  const emptyRowsCount = Math.max(0, effectivePageSize - data.length);

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: "var(--color-background-normal-alternative)",
      }}
    >
      <div className="flex items-center px-20 pt-[48px]">
        <h1
          style={{
            color: "var(--color-label-normal)",
            fontSize: "var(--typography-title-2-bold-fontSize)",
            fontWeight: "var(--typography-title-2-bold-fontWeight)",
            lineHeight: "var(--typography-title-2-bold-lineHeight)",
            letterSpacing: "var(--typography-title-2-bold-letterSpacing)",
          }}
        >
          외박계 관리
        </h1>

        <div className="flex items-center gap-4 ml-auto">
          <div
            style={{
              color: "var(--color-label-normal)",
              fontSize: "var(--typography-body-1-normal-bold-fontSize)",
              fontWeight: "var(--typography-body-1-normal-bold-fontWeight)",
              lineHeight: "var(--typography-body-1-normal-bold-lineHeight)",
              letterSpacing:
                "var(--typography-body-1-normal-bold-letterSpacing)",
            }}
          >
            총 {totalItems}건
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-[40px] w-[40px] rounded-full"
            disabled={isLoading}
            title="새로고침"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 px-20 pb-[30px] pt-4">
        <Card className="flex flex-col min-h-0 w-full h-[938px]">
          <CardContent className="px-4 py-0 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader>
                  <TableRow style={{ height: "68px", borderBottom: "none" }}>
                    <TableHead
                      style={{
                        padding: "16px 18px",
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
                        padding: "16px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      학생
                    </TableHead>
                    <TableHead
                      style={{
                        padding: "16px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      외박 기간
                    </TableHead>
                    <TableHead
                      style={{
                        padding: "16px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      남은 외박 횟수
                    </TableHead>
                    <TableHead
                      style={{
                        padding: "16px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      신청 사유
                    </TableHead>
                    <TableHead
                      style={{
                        padding: "16px 18px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      신청일
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow style={{ height: "76px", borderBottom: "none" }}>
                      <TableCell colSpan={6} className="text-center">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow style={{ height: "76px", borderBottom: "none" }}>
                      <TableCell
                        colSpan={6}
                        className="text-center text-destructive"
                      >
                        데이터를 불러오지 못했습니다. 다시 시도해주세요.
                      </TableCell>
                    </TableRow>
                  ) : data.length > 0 ? (
                    <>
                      {data.map((application) => {
                        const statusInfo =
                          statusLabelMap[application.status] ??
                          statusLabelMap.pending;
                        return (
                          <TableRow
                            key={application.id}
                            className="cursor-pointer hover:bg-muted/40"
                            onClick={() => handleRowClick(application)}
                            style={{ height: "72px", borderBottom: "none" }}
                          >
                            <TableCell>
                              <Badge variant={statusInfo.tone}>
                                {statusInfo.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {application.studentName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {application.studentIdNum}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {formatDateRange(application)}
                            </TableCell>
                            <TableCell className="text-sm text-foreground">
                              {application.remainingOvernights != null
                                ? `${application.remainingOvernights}회`
                                : "-"}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {application.reason?.length > 42
                                ? `${application.reason.slice(0, 42)}...`
                                : application.reason || "-"}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              {formatSubmittedAt(application)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {Array.from({ length: emptyRowsCount }, (_, index) => (
                        <TableRow
                          key={`empty-${index}`}
                          style={{ height: "72px", borderBottom: "none" }}
                        >
                          <TableCell colSpan={6} />
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <>
                      <TableRow style={{ height: "76px", borderBottom: "none" }}>
                        <TableCell
                          colSpan={6}
                          className="text-center text-muted-foreground"
                        >
                          외박 신청 내역이 없습니다.
                        </TableCell>
                      </TableRow>
                      {Array.from({ length: PAGE_SIZE - 1 }, (_, index) => (
                        <TableRow
                          key={`empty-${index}`}
                          style={{ height: "72px", borderBottom: "none" }}
                        >
                          <TableCell colSpan={6} />
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          <div className="border-t p-4 flex items-center relative">
            <div className="text-sm text-muted-foreground absolute left-4">
              총 {totalItems}건 중 {totalItems > 0 ? startIndex + 1 : 0}-
              {endIndex}건 표시
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 mx-auto">
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === nowPage;
                  return (
                    <Button
                      key={pageNumber}
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="h-8 w-8 rounded-full p-0"
                      style={{
                        backgroundColor: "transparent",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: isActive ? 700 : 500,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: isActive ? "#16161d" : "#39394e9c",
                        fontFamily: "Pretendard, system-ui, sans-serif",
                      }}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      <OvernightStayDetailModal
        isOpen={isDetailOpen}
        onClose={closeDetail}
        application={selectedApplication}
        onStatusChangeSuccess={refetch}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}

