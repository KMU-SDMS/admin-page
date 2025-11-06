"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { roomsApi, studentsApi } from "@/lib/api";

interface BillRecord {
  id: number;
  roomNumber: string;
  studentName: string;
  paymentDate: string | null;
  status: "paid" | "unpaid";
  floor: number;
}

export function BillPageClient() {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [filterPaid, setFilterPaid] = useState(true);
  const [filterUnpaid, setFilterUnpaid] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [billRecords, setBillRecords] = useState<BillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // API에서 데이터 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [rooms, students] = await Promise.all([
          roomsApi.getAll(),
          studentsApi.getAll(),
        ]);

        // 호실별 학생 매핑
        const studentMap = new Map(students.map((s) => [s.roomNumber, s.name]));

        // BillRecord 생성 (임시로 랜덤 납부 상태 생성)
        const records: BillRecord[] = rooms.map((room, index) => {
          const status = Math.random() > 0.3 ? "paid" : "unpaid";
          return {
            id: room.id,
            roomNumber: String(room.id),
            studentName: studentMap.get(room.id) || "-",
            paymentDate: status === "paid" ? "2025.12.05" : null,
            status,
            floor: Math.floor(room.id / 100),
          };
        });

        setBillRecords(records);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return dateString;
  };

  // 필터링된 데이터
  const filteredRecords = billRecords.filter((record) => {
    // 상태 필터
    const statusMatch =
      (filterPaid && record.status === "paid") ||
      (filterUnpaid && record.status === "unpaid");

    // 층 필터
    const floorMatch = record.floor === selectedFloor;

    return statusMatch && floorMatch;
  });

  const displayRecords = filteredRecords.slice(
    (currentPage - 1) * 10,
    currentPage * 10
  );
  const totalItems = filteredRecords.length;
  const totalPages = Math.ceil(totalItems / 10);
  const startIndex = (currentPage - 1) * 10;
  const endIndex = Math.min(startIndex + 10, totalItems);

  // 동적으로 빈 행 개수 계산 (항상 10개 행 유지)
  const emptyRowsCount = Math.max(0, 10 - displayRecords.length);

  // API에서 받아온 데이터에서 존재하는 층만 추출
  const availableFloors = useMemo(() => {
    return Array.from(new Set(billRecords.map((record) => record.floor))).sort(
      (a, b) => a - b
    );
  }, [billRecords]);

  // 사용 가능한 층이 변경되면 첫 번째 층 자동 선택
  useEffect(() => {
    if (
      availableFloors.length > 0 &&
      !availableFloors.includes(selectedFloor)
    ) {
      setSelectedFloor(availableFloors[0]);
    }
  }, [availableFloors, selectedFloor]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "var(--color-background-normal-alternative)" }}
    >
      {/* Search Box Area */}
      <div className="flex items-center px-20 pt-[48px]">
        {/* Page Title */}
        <h1
          style={{
            color: "var(--color-label-normal)",
            fontSize: "var(--typography-title-2-bold-fontSize)",
            fontWeight: "var(--typography-title-2-bold-fontWeight)",
            lineHeight: "var(--typography-title-2-bold-lineHeight)",
            letterSpacing: "var(--typography-title-2-bold-letterSpacing)",
          }}
        >
          납부관리
        </h1>
        {/* Search Box */}
        <div className="flex items-center gap-2 w-[614px] h-[48px] ml-[161px]">
          <Input
            placeholder="납부일, 납부일, 호실 등 검색"
            className="flex-1 h-full"
            style={{
              backgroundColor: "var(--color-fill-alternative)",
              color: "var(--color-label-alternative)",
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-20 flex-1 min-h-0 px-20 pb-[30px] pt-4">
        {/* Left Sidebar Container */}
        <div className="w-[176px] flex-shrink-0">
          {/* Create Button */}
          <Button
            onClick={() => {}}
            className="w-[136px] h-[48px]"
            style={{
              backgroundColor: "var(--color-semantic-primary-normal)",
              color: "var(--color-semantic-inverse-label)",
              borderRadius: "10px",
              fontSize: "var(--typography-headline-2-bold-fontSize)",
              fontWeight: "var(--typography-headline-2-bold-fontWeight)",
              lineHeight: "var(--typography-headline-2-bold-lineHeight)",
              letterSpacing: "var(--typography-headline-2-bold-letterSpacing)",
            }}
          >
            미납 송금 요청
          </Button>

          {/* Date Filter */}
          <div className="mt-6">
            <Label
              style={{
                color: "var(--color-label-normal)",
                fontSize: "var(--typography-label-1-normal-bold-fontSize)",
                fontWeight: "var(--typography-label-1-normal-bold-fontWeight)",
                lineHeight: "var(--typography-label-1-normal-bold-lineHeight)",
                letterSpacing:
                  "var(--typography-label-1-normal-bold-letterSpacing)",
              }}
            >
              날짜
            </Label>
            <Button
              variant="outline"
              className="w-[131px] h-[32px] mt-4 flex items-center justify-start gap-1 px-3"
              style={{
                backgroundColor: "var(--color-background-normal-normal)",
                border: "1px solid var(--color-line-normal-neutral)",
                borderRadius: "27.75px",
              }}
              onClick={() => {}}
            >
              <Calendar className="h-4 w-4" />
              <span
                style={{
                  color: "var(--color-label-normal)",
                  fontSize: "var(--typography-body-2-normal-medium-fontSize)",
                  fontWeight:
                    "var(--typography-body-2-normal-medium-fontWeight)",
                  lineHeight:
                    "var(--typography-body-2-normal-medium-lineHeight)",
                  letterSpacing:
                    "var(--typography-body-2-normal-medium-letterSpacing)",
                }}
              >
                {selectedYear}년 {selectedMonth}월
              </span>
            </Button>
          </div>

          {/* Payment Status Filter */}
          <div className="mt-4 space-y-3">
            <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
              게시 상태
            </Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="paid"
                    checked={filterPaid}
                    onCheckedChange={(checked) =>
                      setFilterPaid(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="paid"
                    className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                  >
                    납부 완료
                  </Label>
                </div>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unpaid"
                    checked={filterUnpaid}
                    onCheckedChange={(checked) =>
                      setFilterUnpaid(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="unpaid"
                    className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                  >
                    미납부
                  </Label>
                </div>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Floor Filter */}
          {availableFloors.length > 0 && (
            <div style={{ marginTop: "51px" }} className="space-y-3">
              <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                대상 그룹
              </Label>
              <div className="space-y-2">
                {availableFloors.map((floor) => (
                  <button
                    key={floor}
                    onClick={() => handleFloorSelect(floor)}
                    className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px] cursor-pointer">
                      {floor}층
                    </Label>
                    {selectedFloor === floor && (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Table Area */}
        <Card className="flex-1 flex flex-col min-h-0 w-[1187px] h-[938px]">
          <CardContent className="px-4 py-0 flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="overflow-auto flex-1">
              <Table style={{ tableLayout: "fixed", width: "960px" }}>
                <TableHeader>
                  <TableRow style={{ height: "80px", borderBottom: "none" }}>
                    <TableHead
                      style={{
                        width: "120px",
                        padding: "0",
                        paddingLeft: "60px",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      호실
                    </TableHead>
                    <TableHead
                      style={{
                        width: "160px",
                        padding: "0",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      납부인/납부일
                    </TableHead>
                    <TableHead
                      style={{
                        width: "200px",
                        padding: "0",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      작업
                    </TableHead>
                    <TableHead
                      style={{
                        width: "120px",
                        padding: "0",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      호실
                    </TableHead>
                    <TableHead
                      style={{
                        width: "160px",
                        padding: "0",
                        fontSize: "14px",
                        fontWeight: 700,
                        lineHeight: "20.006px",
                        letterSpacing: "0.203px",
                        color: "#16161d",
                      }}
                    >
                      납부인/납부일
                    </TableHead>
                    <TableHead
                      style={{
                        width: "200px",
                        padding: "0",
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
                  {isLoading ? (
                    <TableRow style={{ height: "76px", borderBottom: "none" }}>
                      <TableCell colSpan={3} className="text-center">
                        <LoadingSpinner />
                      </TableCell>
                    </TableRow>
                  ) : displayRecords.length > 0 ? (
                    <>
                      {displayRecords.map((record) => (
                        <TableRow
                          key={record.id}
                          className="cursor-pointer"
                          style={{ height: "76px", borderBottom: "none" }}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {record.status === "paid" ? (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                              ) : (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
                                  <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                              )}
                              <span
                                style={{
                                  fontSize: "15px",
                                  fontWeight: 700,
                                  lineHeight: "24px",
                                  letterSpacing: "0.144px",
                                  color: "#16161d",
                                }}
                              >
                                {record.roomNumber}호
                              </span>
                            </div>
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
                                {record.studentName}
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
                                {record.paymentDate || "-"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {record.status === "paid" ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  className="h-[28px] w-[56px] p-0"
                                  style={{
                                    borderRadius: "262.5px",
                                    fontSize: "12px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  📷 사진
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-[28px] w-[56px] p-0"
                                  style={{
                                    borderRadius: "262.5px",
                                    fontSize: "12px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  ✕ 취소
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-[28px] w-[56px] p-0"
                                  style={{
                                    borderRadius: "262.5px",
                                    fontSize: "12px",
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  재요청
                                </Button>
                              </div>
                            ) : (
                              <span
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 500,
                                  color: "#39394e9c",
                                }}
                              >
                                송금요청
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {Array.from({ length: emptyRowsCount }, (_, i) => (
                        <TableRow
                          key={`empty-${i}`}
                          style={{ height: "76px", borderBottom: "none" }}
                        >
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      ))}
                    </>
                  ) : (
                    <>
                      <TableRow
                        style={{ height: "76px", borderBottom: "none" }}
                      >
                        <TableCell
                          colSpan={3}
                          className="text-center text-muted-foreground"
                        >
                          납부 기록이 없습니다.
                        </TableCell>
                      </TableRow>
                      {Array.from({ length: 9 }, (_, i) => (
                        <TableRow
                          key={`empty-${i}`}
                          style={{ height: "76px", borderBottom: "none" }}
                        >
                          <TableCell colSpan={3}></TableCell>
                        </TableRow>
                      ))}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>

          {/* Pagination */}
          <div className="border-t p-4 flex items-center relative">
            <div className="text-sm text-muted-foreground absolute left-4">
              총 {totalItems}건 중 {startIndex + 1}-{endIndex}건 표시
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 mx-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-full p-0"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <ChevronsLeft
                    className="h-4 w-4"
                    style={{
                      color: currentPage === 1 ? "#37383c29" : "#16161d",
                    }}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 rounded-full p-0"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    style={{
                      color: currentPage === 1 ? "#37383c29" : "#16161d",
                    }}
                  />
                </Button>
                {(() => {
                  const maxVisiblePages = 10;
                  let startPage = 1;
                  let endPage = Math.min(maxVisiblePages, totalPages);

                  if (totalPages > maxVisiblePages) {
                    const halfVisible = Math.floor(maxVisiblePages / 2);
                    startPage = Math.max(1, currentPage - halfVisible);
                    endPage = Math.min(
                      totalPages,
                      startPage + maxVisiblePages - 1
                    );

                    if (endPage === totalPages) {
                      startPage = Math.max(1, totalPages - maxVisiblePages + 1);
                    }
                  }

                  return Array.from(
                    { length: endPage - startPage + 1 },
                    (_, i) => {
                      const pageNum = startPage + i;
                      const isSelected = currentPage === pageNum;
                      return (
                        <Button
                          key={pageNum}
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 rounded-full p-0"
                          style={{
                            backgroundColor: "transparent",
                            border: "none",
                            fontSize: "14px",
                            fontWeight: isSelected ? 700 : 500,
                            lineHeight: "20.006px",
                            letterSpacing: "0.203px",
                            color: isSelected ? "#16161d" : "#39394e9c",
                            fontFamily: "Pretendard, system-ui, sans-serif",
                          }}
                        >
                          {pageNum}
                        </Button>
                      );
                    }
                  );
                })()}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-full p-0"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <ChevronRight
                    className="h-4 w-4"
                    style={{
                      color:
                        currentPage === totalPages ? "#37383c29" : "#16161d",
                    }}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 rounded-full p-0"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <ChevronsRight
                    className="h-4 w-4"
                    style={{
                      color:
                        currentPage === totalPages ? "#37383c29" : "#16161d",
                    }}
                  />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
