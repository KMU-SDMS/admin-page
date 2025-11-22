"use client";

import type React from "react";
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
import { roomsApi, studentsApi, billsApi } from "@/lib/api";
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
import type { CalendarSchedule } from "@/lib/types";

type PresignResponse = { url: string; headers: Record<string, string> };
type DownloadResponse = { url: string };

interface BillRecord {
  id: number;
  roomNumber: string;
  studentName: string;
  paymentDate: string | null;
  status: "paid" | "partial" | "unpaid";
  floor: number;
  hasUploadedImages: boolean;
}

export function BillPageClient() {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [filterPaid, setFilterPaid] = useState(true);
  const [filterUnpaid, setFilterUnpaid] = useState(true);
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
  // mobileTab 제거됨 - 납부확인 탭 삭제

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
        
        // 1. 캘린더 일정 조회 (전체)
        const schedules = await request<CalendarSchedule[]>("/api/calendar").catch(() => []);
        
        // 2. 현재 선택된 연/월에 해당하는 일정 찾기
        // paymentType이 있는 일정을 우선적으로 찾고, 그 중 가장 늦은 날짜를 선택
        const targetSchedule = schedules
          .filter(s => {
            const sDate = new Date(s.date);
            return (
              sDate.getFullYear() === selectedYear && 
              (sDate.getMonth() + 1) === selectedMonth &&
              s.paymentType !== null // 관리비 관련 일정만 필터링
            );
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        let endDate: string;
        
        if (targetSchedule) {
          // 캘린더에서 찾은 일정의 날짜를 사용
          endDate = targetSchedule.date;
          console.log(`[BillPage] 캘린더 일정 기반 종료일 설정: ${endDate} (유형: ${targetSchedule.paymentType})`);
        } else {
          // 일정이 없으면 기존 로직대로 해당 월의 마지막 날짜 사용
          const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
          endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
          console.log(`[BillPage] 해당 월(${selectedMonth}월)에 관리비 일정이 없어 기본 종료일 설정: ${endDate}`);
        }

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
          if (!studentInfo) {
            // 학생 정보가 없어도 이미지 업로드 여부는 확인
            const imageQuery = (type: "water" | "gas" | "electricity") =>
              `/api/bill/image?roomId=${encodeURIComponent(String(room.id))}` +
              `&type=${encodeURIComponent(type)}` +
              `&year=${encodeURIComponent(String(selectedYear))}` +
              `&month=${encodeURIComponent(String(selectedMonth))}`;

            const checkImageExists = async (type: "water" | "gas" | "electricity"): Promise<boolean> => {
              try {
                const response = await request<DownloadResponse>(imageQuery(type), {
                  cache: "no-store",
                  skipAuthErrorHandling: true,
                });
                const exists = !!(response?.url);
                if (exists) {
                  console.log(`[${room.id}] ${type} 이미지 존재:`, response?.url);
                }
                return exists;
              } catch (error: any) {
                // 404나 다른 에러는 이미지가 없다는 의미
                const is404 = error?.message?.includes("404") || error?.message?.includes("HTTP 404");
                if (!is404) {
                  console.warn(`[${room.id}] ${type} 이미지 확인 중 에러:`, error?.message);
                }
                return false;
              }
            };

            const [hasElectricity, hasWater, hasGas] = await Promise.all([
              checkImageExists("electricity"),
              checkImageExists("water"),
              checkImageExists("gas"),
            ]);

            const hasUploadedImages = hasElectricity || hasWater || hasGas;
            
            console.log(`[${room.id}] 이미지 업로드 여부:`, {
              hasElectricity,
              hasWater,
              hasGas,
              hasUploadedImages,
            });

            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: "-",
              paymentDate: null,
              status: "unpaid" as const,
              floor: Math.floor(room.id / 100),
              hasUploadedImages,
            };
          }

          try {
            // 전체 관리비 데이터에서 해당 학생의 관리비 찾기
            const bills = billsData[studentInfo.studentIdNum] || [];
            
            // 납부 상태 결정: 모두 true면 "paid", 모두 false면 "unpaid", 아니면 "partial"
            let status: "paid" | "partial" | "unpaid";
            
            if (bills.length === 0) {
              // 관리비 항목이 없는 경우
              status = "unpaid";
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

            // 이미지 업로드 여부 확인
            const imageQuery = (type: "water" | "gas" | "electricity") =>
              `/api/bill/image?roomId=${encodeURIComponent(String(room.id))}` +
              `&type=${encodeURIComponent(type)}` +
              `&year=${encodeURIComponent(String(selectedYear))}` +
              `&month=${encodeURIComponent(String(selectedMonth))}`;

            const checkImageExists = async (type: "water" | "gas" | "electricity"): Promise<boolean> => {
              try {
                const response = await request<DownloadResponse>(imageQuery(type), {
                  cache: "no-store",
                  skipAuthErrorHandling: true,
                });
                return !!(response?.url);
              } catch (error: any) {
                // 404나 다른 에러는 이미지가 없다는 의미
                if (error?.message?.includes("404") || error?.message?.includes("HTTP 404")) {
                  return false;
                }
                // 다른 에러도 false로 처리 (네트워크 에러 등)
                return false;
              }
            };

            const [hasElectricity, hasWater, hasGas] = await Promise.all([
              checkImageExists("electricity"),
              checkImageExists("water"),
              checkImageExists("gas"),
            ]);

            // 하나라도 이미지가 업로드되어 있으면 true
            const hasUploadedImages = hasElectricity || hasWater || hasGas;
            
            console.log(`[${room.id}] 이미지 업로드 여부:`, {
              hasElectricity,
              hasWater,
              hasGas,
              hasUploadedImages,
            });

            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: studentInfo.name,
              paymentDate: formattedDate,
              status,
              floor: Math.floor(room.id / 100),
              hasUploadedImages,
            };
          } catch (error) {
            console.error(`학생 ${studentInfo.studentIdNum}의 관리비 조회 실패:`, error);
            return {
              id: room.id,
              roomNumber: String(room.id),
              studentName: studentInfo.name,
              paymentDate: null,
              status: "unpaid" as const,
              floor: Math.floor(room.id / 100),
              hasUploadedImages: false,
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
    // 모바일: 이미지 업로드 여부 기반 필터링
    // 데스크탑: 납부 상태 기반 필터링
    let statusMatch: boolean;
    
    if (isMobile) {
      // 모바일에서는 이미지 업로드 여부로 필터링
      const hasUploaded = record.hasUploadedImages;
      statusMatch = 
        (filterPaid && hasUploaded) || 
        (filterUnpaid && !hasUploaded);
    } else {
      // 데스크탑에서는 납부 상태로 필터링
      const isPaid = record.status === "paid";
      const isPartial = record.status === "partial";
      const isUnpaid = record.status === "unpaid";

      statusMatch = 
        (filterPaid && (isPaid || isPartial)) || 
        (filterUnpaid && (isUnpaid || isPartial));
    }

    // 층 필터
    const floorMatch = isMobile
      ? true
      : selectedFloor === null || record.floor === selectedFloor;

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

  // 사용 가능한 층이 변경되면 전체로 유지 (기본값이 null이므로)

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleFloorSelect = (floor: number | null) => {
    setSelectedFloor(floor);
  };

  // xs 전용 모바일 레이아웃
  if (isMobile) {
    const showAll = filterPaid && filterUnpaid;
    const showUnuploadedOnly = filterUnpaid && !filterPaid;
    const showUploadedOnly = filterPaid && !filterUnpaid;
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

        {/* 필터 칩 */}
        <div className="px-5 mt-5">
          <div className="flex items-center gap-3">
            <Button
              className="h-9 px-4 rounded-2xl"
              onClick={() => {
                setFilterPaid(true);
                setFilterUnpaid(true);
              }}
              style={{
                backgroundColor: showAll ? "#000" : "#ffffff",
                color: showAll ? "#fff" : "#16161d",
                border: showAll ? "1px solid #000" : "1px solid #E5E7EB",
              }}
            >
              전체
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-2xl"
              onClick={() => {
                setFilterUnpaid(true);
                setFilterPaid(false);
              }}
              style={{
                backgroundColor: showUnuploadedOnly ? "#000" : "#ffffff",
                color: showUnuploadedOnly ? "#fff" : "#16161d",
                border: showUnuploadedOnly
                  ? "1px solid #000"
                  : "1px solid #E5E7EB",
              }}
            >
              미업로드
            </Button>
            <Button
              variant="outline"
              className="h-9 px-4 rounded-2xl"
              onClick={() => {
                setFilterPaid(true);
                setFilterUnpaid(false);
              }}
              style={{
                backgroundColor: showUploadedOnly ? "#000" : "#ffffff",
                color: showUploadedOnly ? "#fff" : "#16161d",
                border: showUploadedOnly
                  ? "1px solid #000"
                  : "1px solid #E5E7EB",
              }}
            >
              업로드
            </Button>
          </div>
        </div>

        {/* 리스트 */}
        <div className="px-5 mt-5 pb-24 space-y-3">
          {displayRecords.map((record) => (
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
          ))}
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
                    onCheckedChange={(checked) => {
                      setFilterPaid(checked as boolean);
                    }}
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
                    onCheckedChange={(checked) => {
                      setFilterUnpaid(checked as boolean);
                    }}
                  />
                  <Label
                    htmlFor="unpaid"
                    className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                  >
                    미납부
                  </Label>
                </div>
                <div className="h-4 w-4" />
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
                              <div className="flex items-center gap-2">
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
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Button
                              variant="outline"
                              className="h-[28px] px-3 p-0"
                              style={{
                                borderRadius: "262.5px",
                                fontSize: "12px",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveRecord(record);
                                setIsPhotoSheetOpen(true);
                              }}
                            >
                              📷 사진
                            </Button>
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
