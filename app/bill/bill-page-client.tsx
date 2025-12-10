"use client";

import React from "react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  Calendar,
  Camera,
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
import { roomsApi, studentsApi, billsApi, calendarApi } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-viewport";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import { request } from "@/lib/api";
import { toast } from "sonner";
import type { CalendarSchedule, Bill } from "@/lib/types";

type PresignResponse = { url: string; headers: Record<string, string> };
type DownloadResponse = { url: string };

interface BillRecord {
  id: number;
  roomNumber: string;
  studentName: string;
  paymentDate: string | null;
  status: "paid" | "partial" | "unpaid" | "no_data";
  floor: number;
  hasUploadedImages: boolean;
  details: {
    electricity: boolean | null; // true: paid, false: unpaid, null: not billed
    water: boolean | null;
    gas: boolean | null;
  };
}

import { useSearchParams, useRouter } from "next/navigation";

export function BillPageClient() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // URL 쿼리 파라미터에서 초기값 읽기
  const initialYear = searchParams.get("year") 
    ? parseInt(searchParams.get("year")!, 10) 
    : new Date().getFullYear();
  const initialMonth = searchParams.get("month") 
    ? parseInt(searchParams.get("month")!, 10) 
    : new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);

  // 연/월 변경 시 URL 업데이트
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(selectedYear));
    params.set("month", String(selectedMonth));
    router.replace(`?${params.toString()}`, { scroll: false });
  }, [selectedYear, selectedMonth, router, searchParams]);
  const [viewMode, setViewMode] = useState<"bills" | "status">("bills");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [billRecords, setBillRecords] = useState<BillRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMonthOpen, setIsMonthOpen] = useState(false);
  const [isPhotoSheetOpen, setIsPhotoSheetOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState<BillRecord | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{
    water: string | null;
    gas: string | null;
    electricity: string | null;
  }>({ water: null, gas: null, electricity: null });
  const [noSchedule, setNoSchedule] = useState(false);

  const labels = ["전기", "수도", "가스"] as const;
  const toType = (
    label: (typeof labels)[number]
  ): "water" | "gas" | "electricity" => {
    if (label === "전기") return "electricity";
    if (label === "수도") return "water";
    return "gas";
  };

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // 모달 열릴 때 서버에 저장된 기존 이미지 URL 로드 (항상 네트워크 조회)
  useEffect(() => {
    if (!isPhotoSheetOpen || !activeRecord) return;

    // 기존 캐시/미리보기 무효화
    setPreviews({ water: null, gas: null, electricity: null });

    const query = (type: "water" | "gas" | "electricity") =>
      `/api/bill/image?roomId=${encodeURIComponent(
        String(activeRecord.roomNumber)
      )}` +
      `&type=${encodeURIComponent(type)}` +
      `&year=${encodeURIComponent(String(selectedYear))}` +
      `&month=${encodeURIComponent(String(selectedMonth))}`;

    (async () => {
      try {
        const [electricity, water, gas] = await Promise.all([
          request<DownloadResponse>(query("electricity"), {
            cache: "no-store",
          }).catch(() => null),
          request<DownloadResponse>(query("water"), {
            cache: "no-store",
          }).catch(() => null),
          request<DownloadResponse>(query("gas"), { cache: "no-store" }).catch(
            () => null
          ),
        ]);

        setPreviews({
          electricity: electricity?.url ?? null,
          water: water?.url ?? null,
          gas: gas?.url ?? null,
        });
      } catch {
        // 개별 실패는 무시 (없는 경우가 대부분)
      }
    })();
  }, [isPhotoSheetOpen, activeRecord, selectedYear, selectedMonth]);

  const getFileExtension = (mimeType: string) => {
    if (mimeType === "image/jpeg") return "jpg";
    if (mimeType === "image/png") return "png";
    if (mimeType === "image/webp") return "webp";
    if (mimeType === "image/heic") return "heic";
    const slash = mimeType.indexOf("/");
    return slash > -1 ? mimeType.substring(slash + 1) : "jpg";
  };

  const handleSelectFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !activeRecord) return;

      try {
        const label = labels[currentSlide];
        const type = toType(label);
        const allowedImageTypes = new Set([
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/bmp",
          "image/tiff",
          "image/svg+xml",
        ]);
        const contentTypeToSend = allowedImageTypes.has(file.type)
          ? file.type
          : "application/octet-stream";
        const body = {
          contentType: contentTypeToSend,
          // ext는 선택사항(현재 미사용)이나, 서버가 허용하면 전달
          ext: getFileExtension(file.type),
          roomId: String(activeRecord.roomNumber),
          type,
          year: String(selectedYear),
          month: String(selectedMonth),
        };

        // 세션 쿠키 포함 및 공통 에러 핸들링을 위해 공용 request 사용
        const presign = await request<PresignResponse>("/api/bill/presign", {
          method: "POST",
          body: JSON.stringify(body),
        });

        await fetch(presign.url, {
          method: "PUT",
          headers: presign.headers,
          body: file,
        });

        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => ({ ...prev, [type]: previewUrl }));
      } catch (error: any) {
        console.error("파일 업로드 실패:", error);
        let message = error.message || "이미지 업로드 중 오류가 발생했습니다.";

        // "HTTP 400: {...}" 형태의 에러 메시지에서 JSON 부분만 추출하여 파싱 시도
        try {
          const jsonStart = message.indexOf("{");
          if (jsonStart !== -1) {
            const jsonString = message.substring(jsonStart);
            const parsed = JSON.parse(jsonString);
            if (parsed.error) {
              message = parsed.error;
            }
          }
        } catch (e) {
          // JSON 파싱 실패 시 원래 메시지 사용
        }

        toast.error(message);
      } finally {
        // reset input to allow re-selecting the same file
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [activeRecord, currentSlide, labels, selectedMonth, selectedYear, toType]
  );

  // API에서 데이터 받아오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setNoSchedule(false);
        
        // 1. 캘린더 일정 조회 (해당 월)
        const schedules = await calendarApi
          .getSchedules({ year: selectedYear, month: selectedMonth })
          .catch(() => []);

        // 2. 현재 선택된 연/월에 해당하는 일정 찾기
        // paymentType이 있는 일정을 우선적으로 찾고, 그 중 가장 늦은 날짜를 선택
        const targetSchedule = schedules
          .filter((s) => s.paymentType !== null) // 관리비 관련 일정만 필터링
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

        if (!targetSchedule) {
          console.log(
            `[BillPage] 해당 월(${selectedMonth}월)에 관리비 일정이 없어 데이터 조회 중단`
          );
          setNoSchedule(true);
          setBillRecords([]);
          setIsLoading(false);
          return;
        }

        const endDate = targetSchedule.date;
        console.log(
          `[BillPage] 캘린더 일정 기반 종료일 설정: ${endDate} (유형: ${targetSchedule.paymentType})`
        );

        // 3. 데이터 조회 (일정이 있을 때만 수행)
        const [rooms, students, billsData] = await Promise.all([
          roomsApi.getAll(),
          studentsApi.getAll(),
          billsApi.getBills(endDate),
        ]);

        // 호실별 학생 매핑
        const studentMap = new Map(
          students.map((s) => [s.roomNumber, { name: s.name, studentIdNum: s.studentIdNum }])
        );

        // 각 학생의 관리비 조회
        const recordsPromises = rooms.map(async (room) => {
          const studentInfo = studentMap.get(room.id);
          
          // 기본적으로 이미지는 확인하지 않음 (서버 부하 감소)
          const hasUploadedImages = false;

          const details = {
            electricity: null as boolean | null,
            water: null as boolean | null,
            gas: null as boolean | null,
          };

          if (!studentInfo) {
            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: "-",
              paymentDate: null,
              status: "no_data" as const,
              floor: Math.floor(room.id / 100),
              hasUploadedImages,
              details,
            };
          }

          try {
            // 전체 관리비 데이터에서 해당 학생의 관리비 찾기
            const bills = billsData[studentInfo.studentIdNum] || [];
            
            // 납부 상태 결정: 모두 true면 "paid", 모두 false면 "unpaid", 아니면 "partial"
            let status: "paid" | "partial" | "unpaid" | "no_data";
            
            if (bills.length === 0) {
              // 관리비 항목이 없는 경우
              status = "no_data";
            } else {
              const allPaid = bills.every((bill) => bill.is_paid);
              const allUnpaid = bills.every((bill) => !bill.is_paid);
              
              if (allPaid) {
                // 모든 항목이 납부된 경우
                status = "paid";
              } else if (allUnpaid) {
                // 모든 항목이 미납부인 경우
                status = "unpaid";
              } else {
                // 일부만 납부된 경우
                status = "partial";
              }

              // 상세 납부 현황 파악
              bills.forEach((bill) => {
                if (bill.type === "electricity") details.electricity = bill.is_paid;
                if (bill.type === "water") details.water = bill.is_paid;
                if (bill.type === "gas") details.gas = bill.is_paid;
              });
            }
            
            // 가장 최근 납부일 찾기 (납부된 항목 중)
            const paidBills = bills.filter((bill) => bill.is_paid);
            const latestPaidDate = paidBills.length > 0
              ? paidBills.reduce((latest, bill) => {
                  const billDate = new Date(bill.endDate);
                  const latestDate = new Date(latest.endDate);
                  return billDate > latestDate ? bill : latest;
                }, paidBills[0])
              : null;

            // 날짜 포맷팅 (YYYY-MM-DD -> YYYY.MM.DD)
            const formattedDate = latestPaidDate
              ? latestPaidDate.endDate.replace(/-/g, ".")
              : null;

            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: studentInfo.name,
              paymentDate: formattedDate,
              status,
              floor: Math.floor(room.id / 100),
              hasUploadedImages,
              details,
            };
          } catch (error) {
            console.error(`학생 ${studentInfo.studentIdNum}의 관리비 조회 실패:`, error);
            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: studentInfo.name,
              paymentDate: null,
              status: "no_data" as const,
              floor: Math.floor(room.id / 100),
              hasUploadedImages: false,
              details,
            };
          }
        });

        const records = await Promise.all(recordsPromises);
        setBillRecords(records);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedMonth]);

  const formatDate = (dateString: string) => {
    return dateString;
  };

  // 필터링된 데이터
  const filteredRecords = billRecords.filter((record) => {
    // 층 필터
    const floorMatch = isMobile
      ? true
      : selectedFloor === null || record.floor === selectedFloor;

    return floorMatch;
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

  // 사용 가능한 층이 변경되면 전체로 유지 (기본값이 null이므로)

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFloorSelect = (floor: number | null) => {
    setSelectedFloor(floor);
  };

  // xs 전용 모바일 레이아웃
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white sm:hidden">
        {/* 상단 타이틀 (텍스트: 좌 30px, 아이콘: 우 16px) */}
        <div
          className="pb-3"
          style={{ paddingTop: 30, paddingLeft: 30, paddingRight: 16 }}
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-extrabold tracking-tight">
              {selectedMonth}월 납부
            </h1>
            <Popover open={isMonthOpen} onOpenChange={setIsMonthOpen}>
              <PopoverTrigger asChild>
                <button
                  className="flex h-6 w-6 items-center justify-center text-gray-600"
                  aria-label="월 선택"
                >
                  <Calendar className="h-6 w-6" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[264px] p-3">
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <Button
                      key={m}
                      variant={selectedMonth === m ? "default" : "outline"}
                      className="h-9"
                      onClick={() => {
                        setSelectedMonth(m);
                        setIsMonthOpen(false);
                      }}
                    >
                      {m}월
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 뷰 모드 탭 (고지서 조회 / 납부여부 조회) */}
        <div className="px-5 mt-5">
          <div className="flex items-center gap-3">
            <Button
              className="h-9 px-4 rounded-2xl"
              onClick={() => setViewMode("bills")}
              style={{
                backgroundColor: viewMode === "bills" ? "#000" : "#ffffff",
                color: viewMode === "bills" ? "#fff" : "#16161d",
                border: viewMode === "bills" ? "1px solid #000" : "1px solid #E5E7EB",
              }}
            >
              고지서 조회
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-2xl"
              onClick={() => setViewMode("status")}
              style={{
                backgroundColor: viewMode === "status" ? "#000" : "#ffffff",
                color: viewMode === "status" ? "#fff" : "#16161d",
                border: viewMode === "status"
                  ? "1px solid #000"
                  : "1px solid #E5E7EB",
              }}
            >
              납부여부 조회
            </Button>
          </div>
        </div>

        {/* 리스트 */}
        <div className="px-5 mt-5 pb-24 space-y-3">
          {viewMode === "bills" ? (
            noSchedule ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-lg font-semibold text-gray-500">
                  {selectedMonth}월의 관리비 납부 정보가 없습니다
                </div>
              </div>
            ) : (
              displayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
                >
                  <div className="flex-1">
                    <div className="text-[20px] font-extrabold leading-6 text-[#16161d]">
                      {record.roomNumber}호
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-[16px] font-semibold text-[#39394e] opacity-80">
                        {record.studentName}
                      </div>
                    </div>
                    <div className="mt-2">
                      {record.status === "paid" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#10b981",
                            color: "#ffffff",
                          }}
                        >
                          납부완료
                        </span>
                      )}
                      {record.status === "partial" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#f59e0b",
                            color: "#ffffff",
                          }}
                        >
                          일부납부
                        </span>
                      )}
                      {record.status === "unpaid" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#ef4444",
                            color: "#ffffff",
                          }}
                        >
                          미납부
                        </span>
                      )}
                      {record.status === "no_data" && (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            backgroundColor: "#E5E7EB",
                            color: "#9CA3AF",
                          }}
                        >
                          정보없음
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400"
                    aria-label="납부 사진 업로드"
                    onClick={() => {
                      setActiveRecord(record);
                      setIsPhotoSheetOpen(true);
                    }}
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                </div>
              ))
            )
          ) : (
            // 납부여부 조회 (Status Mode)
            noSchedule ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-lg font-semibold text-gray-500">
                  {selectedMonth}월의 관리비 납부 정보가 없습니다
                </div>
              </div>
            ) : (
              displayRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
                >
                  <div className="flex-1">
                    <div className="text-[20px] font-extrabold leading-6 text-[#16161d]">
                      {record.roomNumber}호
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="text-[16px] font-semibold text-[#39394e] opacity-80">
                        {record.studentName}
                      </div>
                    </div>
                    {/* 상세 납부 태그 */}
                    <div className="mt-2 flex items-center gap-1.5">
                      {[
                        { label: "전기", status: record.details.electricity },
                        { label: "수도", status: record.details.water },
                        { label: "가스", status: record.details.gas },
                      ].map((item) => {
                        let bgColor = "#E5E7EB"; // Default Gray (Disabled)
                        let textColor = "#9CA3AF";
                        if (item.status === true) {
                          bgColor = "#10b981"; // Green (Paid)
                          textColor = "#ffffff";
                        } else if (item.status === false) {
                          bgColor = "#ef4444"; // Red (Unpaid)
                          textColor = "#ffffff";
                        }

                        return (
                          <span
                            key={item.label}
                            style={{
                              fontSize: "11px",
                              fontWeight: 600,
                              padding: "2px 8px",
                              borderRadius: "12px",
                              backgroundColor: bgColor,
                              color: textColor,
                            }}
                          >
                            {item.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {/* 사진 업로드 바텀시트 */}
        <Sheet open={isPhotoSheetOpen} onOpenChange={setIsPhotoSheetOpen}>
          <SheetContent
            side="bottom"
            className="rounded-t-2xl p-0 h-[659px] max-h-[659px]"
          >
            <div className="pt-4 pb-6 h-full relative">
              <SheetHeader className="p-0">
                <SheetTitle className="text-center text-[22px] font-extrabold text-[#2b2b33]">
                  {activeRecord
                    ? `${activeRecord.roomNumber}호 ${activeRecord.studentName}`
                    : ""}
                </SheetTitle>
              </SheetHeader>

              <Carousel className="mt-3 relative" setApi={setCarouselApi}>
                <CarouselContent>
                  {labels.map((label) => (
                    <CarouselItem key={label}>
                      <div
                        className="relative rounded-xl bg-[#f2f2f5] mx-auto flex items-center justify-center overflow-hidden"
                        style={{
                          width: "calc(100vw * 346 / 375)",
                          height: 469,
                        }}
                      >
                        <div className="absolute left-3 top-3 text-[14px] font-semibold text-[#17171f]">
                          {label}
                        </div>
                        {(() => {
                          const type = toType(label);
                          const src = previews[type];
                          if (src) {
                            return (
                              <img
                                src={src}
                                alt={`${label} 미리보기`}
                                className="max-w-full max-h-full object-contain"
                              />
                            );
                          }
                          return (
                            <span className="text-[18px] font-semibold text-[#17171f]">
                              사진
                            </span>
                          );
                        })()}
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 bg-black/40 text-white border-0 hover:bg-black/60" />
                <CarouselNext className="right-2 bg-black/40 text-white border-0 hover:bg-black/60" />
              </Carousel>

              {/* hidden file input for upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                // 모바일에서는 카메라 우선, 데스크탑은 파일탐색기
                capture={isMobile ? "environment" : undefined}
                className="hidden"
                onChange={handleFileChange}
              />

              {/* 고정 크기 버튼(80x48, 255x48) + 가변 여백(14/11/15 비율) */}
              <div
                className="absolute left-0 right-0 w-full flex items-center"
                style={{ bottom: 46 }}
              >
                <div style={{ width: "calc((100vw - 335px) * 0.35)" }} />
                <Button
                  variant="outline"
                  className="h-[48px] rounded-2xl"
                  style={{
                    width: 80,
                    fontSize: "var(--typography-body-1-normal-bold-fontSize)",
                    fontWeight:
                      "var(--typography-body-1-normal-bold-fontWeight)",
                    lineHeight:
                      "var(--typography-body-1-normal-bold-lineHeight)",
                    letterSpacing:
                      "var(--typography-body-1-normal-bold-letterSpacing)",
                    color: "var(--color-label-normal)",
                  }}
                  onClick={() => setIsPhotoSheetOpen(false)}
                >
                  취소
                </Button>
                <div style={{ width: "calc((100vw - 335px) * 0.275)" }} />
                <Button
                  className="h-[48px] rounded-2xl"
                  style={{
                    width: 255,
                    fontSize: "var(--typography-body-1-normal-bold-fontSize)",
                    fontWeight:
                      "var(--typography-body-1-normal-bold-fontWeight)",
                    lineHeight:
                      "var(--typography-body-1-normal-bold-lineHeight)",
                    letterSpacing:
                      "var(--typography-body-1-normal-bold-letterSpacing)",
                    color: "var(--color-semantic-inverse-label)",
                  }}
                  onClick={handleSelectFile}
                >
                  사진 등록
                </Button>
                <div style={{ width: "calc((100vw - 335px) * 0.375)" }} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

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

          {/* View Mode Filter */}
          <div className="mt-4 space-y-3">
            <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
              메뉴
            </Label>
            <div className="space-y-2">
              <button
                onClick={() => setViewMode("bills")}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px] cursor-pointer">
                  고지서 조회
                </Label>
                {viewMode === "bills" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </button>
              <button
                onClick={() => setViewMode("status")}
                className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded transition-colors"
              >
                <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px] cursor-pointer">
                  납부여부 조회
                </Label>
                {viewMode === "status" && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </button>
            </div>
          </div>

          {/* Floor Filter */}
          {availableFloors.length > 0 && (
            <div style={{ marginTop: "51px" }} className="space-y-3">
              <Label className="text-[14px] font-bold leading-[20.006px] tracking-[0.203px]">
                대상 그룹
              </Label>
              <div className="space-y-2">
                <button
                  onClick={() => handleFloorSelect(null)}
                  className="w-full flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Label className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px] cursor-pointer">
                    전체
                  </Label>
                  {selectedFloor === null && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </button>
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
            {viewMode === "bills" ? (
              <div className="overflow-auto flex-1">
                <Table style={{ tableLayout: "fixed", width: "960px" }}>
                  {/* ... (Existing Bills Table Header) ... */}
                  <TableHeader>
                    <TableRow style={{ height: "80px", borderBottom: "none" }}>
                      <TableHead style={{ width: "120px", paddingLeft: "60px", color: "#16161d", fontWeight: 700 }}>호실</TableHead>
                      <TableHead style={{ width: "160px", color: "#16161d", fontWeight: 700 }}>납부인/납부일</TableHead>
                      <TableHead style={{ width: "200px", color: "#16161d", fontWeight: 700 }}>작업</TableHead>
                      <TableHead style={{ width: "120px", color: "#16161d", fontWeight: 700 }}>호실</TableHead>
                      <TableHead style={{ width: "160px", color: "#16161d", fontWeight: 700 }}>납부인/납부일</TableHead>
                      <TableHead style={{ width: "200px", color: "#16161d", fontWeight: 700 }}>작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody style={{ marginTop: "8px" }}>
                    {isLoading ? (
                      <TableRow style={{ height: "76px", borderBottom: "none" }}>
                        <TableCell colSpan={6} className="text-center">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : noSchedule ? (
                      <>
                        <TableRow style={{ height: "76px", borderBottom: "none" }}>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {selectedMonth}월의 관리비 납부 정보가 없습니다
                          </TableCell>
                        </TableRow>
                        {Array.from({ length: 9 }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : displayRecords.length > 0 ? (
                      <>
                        {displayRecords.reduce((rows: BillRecord[][], record, index) => {
                          if (index % 2 === 0) rows.push([record]);
                          else rows[rows.length - 1].push(record);
                          return rows;
                        }, []).map((row, rowIndex) => (
                          <TableRow key={rowIndex} style={{ height: "76px", borderBottom: "none" }}>
                            {row.map((record) => (
                              <React.Fragment key={record.id}>
                                <TableCell>
                                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#16161d" }}>
                                    {record.roomNumber}호
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#16161d" }}>
                                      {record.studentName}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <div style={{ fontSize: "12px", fontWeight: 500, color: "#39394e9c" }}>
                                        {record.paymentDate || "-"}
                                      </div>
                                      {record.status === "paid" && (
                                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#10b981", color: "#ffffff" }}>납부완료</span>
                                      )}
                                      {record.status === "partial" && (
                                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#f59e0b", color: "#ffffff" }}>일부납부</span>
                                      )}
                                      {record.status === "unpaid" && (
                                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#ef4444", color: "#ffffff" }}>미납부</span>
                                      )}
                                      {record.status === "no_data" && (
                                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "2px 8px", borderRadius: "12px", backgroundColor: "#E5E7EB", color: "#9CA3AF" }}>정보없음</span>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="outline"
                                    className="h-[28px] px-3 p-0"
                                    style={{ borderRadius: "262.5px", fontSize: "12px" }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveRecord(record);
                                      setIsPhotoSheetOpen(true);
                                    }}
                                  >
                                    📷 사진
                                  </Button>
                                </TableCell>
                              </React.Fragment>
                            ))}
                            {row.length === 1 && (
                              <>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                        {Array.from({ length: Math.max(0, 5 - Math.ceil(displayRecords.length / 2)) }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <>
                        <TableRow style={{ height: "76px", borderBottom: "none" }}>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            납부 기록이 없습니다.
                          </TableCell>
                        </TableRow>
                        {Array.from({ length: 9 }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            ) : (
              // 납부여부 조회 (Status Mode) - Desktop
              <div className="overflow-auto flex-1">
                <Table style={{ tableLayout: "fixed", width: "960px" }}>
                  <TableHeader>
                    <TableRow style={{ height: "80px", borderBottom: "none" }}>
                      <TableHead style={{ width: "120px", paddingLeft: "60px", color: "#16161d", fontWeight: 700 }}>호실</TableHead>
                      <TableHead style={{ width: "240px", color: "#16161d", fontWeight: 700 }}>납부 현황</TableHead>
                      <TableHead style={{ width: "120px", color: "#16161d", fontWeight: 700 }}></TableHead>
                      <TableHead style={{ width: "120px", color: "#16161d", fontWeight: 700 }}>호실</TableHead>
                      <TableHead style={{ width: "240px", color: "#16161d", fontWeight: 700 }}>납부 현황</TableHead>
                      <TableHead style={{ width: "120px", color: "#16161d", fontWeight: 700 }}></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody style={{ marginTop: "8px" }}>
                    {isLoading ? (
                      <TableRow style={{ height: "76px", borderBottom: "none" }}>
                        <TableCell colSpan={6} className="text-center">
                          <LoadingSpinner />
                        </TableCell>
                      </TableRow>
                    ) : noSchedule ? (
                      <>
                        <TableRow style={{ height: "76px", borderBottom: "none" }}>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {selectedMonth}월의 관리비 납부 정보가 없습니다
                          </TableCell>
                        </TableRow>
                        {Array.from({ length: 9 }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : displayRecords.length > 0 ? (
                      <>
                        {displayRecords.reduce((rows: BillRecord[][], record, index) => {
                          if (index % 2 === 0) rows.push([record]);
                          else rows[rows.length - 1].push(record);
                          return rows;
                        }, []).map((row, rowIndex) => (
                          <TableRow key={rowIndex} style={{ height: "76px", borderBottom: "none" }}>
                            {row.map((record) => (
                              <React.Fragment key={record.id}>
                                <TableCell>
                                  <span style={{ fontSize: "15px", fontWeight: 700, color: "#16161d" }}>
                                    {record.roomNumber}호
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div style={{ fontSize: "15px", fontWeight: 700, color: "#16161d" }}>
                                      {record.studentName}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      {[
                                        { label: "전기", status: record.details.electricity },
                                        { label: "수도", status: record.details.water },
                                        { label: "가스", status: record.details.gas },
                                      ].map((item) => {
                                        let bgColor = "#E5E7EB";
                                        let textColor = "#9CA3AF";
                                        if (item.status === true) {
                                          bgColor = "#10b981";
                                          textColor = "#ffffff";
                                        } else if (item.status === false) {
                                          bgColor = "#ef4444";
                                          textColor = "#ffffff";
                                        }
                                        return (
                                          <span
                                            key={item.label}
                                            style={{
                                              fontSize: "11px",
                                              fontWeight: 600,
                                              padding: "2px 8px",
                                              borderRadius: "12px",
                                              backgroundColor: bgColor,
                                              color: textColor,
                                            }}
                                          >
                                            {item.label}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell></TableCell>
                              </React.Fragment>
                            ))}
                            {row.length === 1 && (
                              <>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                        {Array.from({ length: Math.max(0, 5 - Math.ceil(displayRecords.length / 2)) }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    ) : (
                      <>
                        <TableRow style={{ height: "76px", borderBottom: "none" }}>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            납부 기록이 없습니다.
                          </TableCell>
                        </TableRow>
                        {Array.from({ length: 9 }, (_, i) => (
                          <TableRow key={`empty-${i}`} style={{ height: "76px", borderBottom: "none" }}>
                            <TableCell colSpan={6}></TableCell>
                          </TableRow>
                        ))}
                      </>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
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
