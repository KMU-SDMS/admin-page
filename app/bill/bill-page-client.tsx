"use client";

import type React from "react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Camera,
  X,
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
type PresignResponse = { url: string; headers: Record<string, string> };
type DownloadResponse = { url: string };

interface BillRecord {
  id: number;
  roomNumber: string;
  studentName: string;
  paymentDate: string | null;
  status: "paid" | "unpaid";
  floor: number;
  confirmed?: boolean;
}

export function BillPageClient() {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedMonth, setSelectedMonth] = useState<number>(10);
  const [filterPaid, setFilterPaid] = useState(true);
  const [filterUnpaid, setFilterUnpaid] = useState(true);
  const [filterUnconfirmed, setFilterUnconfirmed] = useState(true);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
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
  const [mobileTab, setMobileTab] = useState<"upload" | "confirm">("upload");

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
            confirmed: Math.random() > 0.5,
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
    // 상태 필터: 납부완료, 미납부, 미확인(납부했으나 확인 전)
    const isPaid = record.status === "paid";
    const isUnpaid = record.status === "unpaid";
    const isUnconfirmed = isPaid && !record.confirmed;

    const statusMatch =
      (filterPaid && isPaid) ||
      (filterUnpaid && isUnpaid) ||
      (filterUnconfirmed && isUnconfirmed);

    // 층 필터
    const floorMatch = isMobile ? true : record.floor === selectedFloor;

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

  const handleConfirmActiveRecord = useCallback(() => {
    if (!activeRecord) return;
    setBillRecords((prev) =>
      prev.map((r) =>
        r.id === activeRecord.id ? { ...r, confirmed: true } : r
      )
    );
    setIsPhotoSheetOpen(false);
  }, [activeRecord]);

  const handleFloorSelect = (floor: number) => {
    setSelectedFloor(floor);
  };

  // xs 전용 모바일 레이아웃
  if (isMobile) {
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

        {/* 탭 (고지서 업로드 / 납부확인) */}
        <div className="px-5">
          <div className="flex items-center gap-6">
            <button
              className="text-base font-semibold relative"
              onClick={() => setMobileTab("upload")}
              style={{ color: mobileTab === "upload" ? "#000" : "#d1d5db" }}
            >
              고지서 업로드
              {mobileTab === "upload" && (
                <span className="absolute left-0 -bottom-2 block h-[2px] w-full bg-black" />
              )}
            </button>
            <button
              className="text-base font-semibold"
              onClick={() => setMobileTab("confirm")}
              style={{ color: mobileTab === "confirm" ? "#000" : "#d1d5db" }}
            >
              납부확인
              {mobileTab === "confirm" && (
                <span className="absolute left-[162px] -bottom-2 block h-[2px] w-[64px] bg-black" />
              )}
            </button>
          </div>
        </div>

        {/* 필터 칩 */}
        {mobileTab === "upload" ? (
          <div className="px-5 mt-5">
            <div className="flex items-center gap-3">
              <Button
                className="h-9 px-4 rounded-2xl"
                onClick={() => {
                  if (showUnuploadedOnly) {
                    setFilterUnpaid(true);
                    setFilterPaid(true);
                  } else {
                    setFilterUnpaid(true);
                    setFilterPaid(false);
                  }
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
                  if (showUploadedOnly) {
                    setFilterPaid(true);
                    setFilterUnpaid(true);
                  } else {
                    setFilterPaid(true);
                    setFilterUnpaid(false);
                  }
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
        ) : (
          <div className="px-5 mt-5">
            <div className="flex items-center gap-3">
              <Button
                className="h-9 px-4 rounded-2xl"
                onClick={() => {
                  setFilterPaid(true);
                  setFilterUnpaid(true);
                  setFilterUnconfirmed(true);
                }}
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  border: "1px solid #000",
                }}
              >
                전체
              </Button>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-2xl"
                onClick={() => {
                  setFilterPaid(false);
                  setFilterUnpaid(true);
                  setFilterUnconfirmed(false);
                }}
              >
                미납부
              </Button>
              <Button
                variant="outline"
                className="h-9 px-4 rounded-2xl"
                onClick={() => {
                  setFilterUnconfirmed(true);
                  setFilterPaid(false);
                  setFilterUnpaid(false);
                }}
              >
                미확인
              </Button>
            </div>
          </div>
        )}

        {/* 리스트 */}
        {mobileTab === "upload" ? (
          <div className="px-5 mt-5 pb-24 space-y-3">
            {displayRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
              >
                <div>
                  <div className="text-[20px] font-extrabold leading-6 text-[#16161d]">
                    {record.roomNumber}호
                  </div>
                  <div className="mt-1 text-[16px] font-semibold text-[#39394e] opacity-80">
                    {record.studentName}
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
        ) : (
          <div className="px-5 mt-5 pb-24 space-y-3">
            {displayRecords.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-4"
              >
                <div className="flex items-center gap-3">
                  {record.confirmed ? (
                    <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-green-600 text-white">
                      <span className="text-[14px] font-bold leading-none">
                        ✓
                      </span>
                    </div>
                  ) : record.status === "paid" ? (
                    <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-yellow-500 text-white">
                      <span className="text-[14px] font-bold leading-none">
                        !
                      </span>
                    </div>
                  ) : (
                    <div className="w-[22px] h-[22px]" />
                  )}
                  <div>
                    <div className="text-[20px] font-extrabold leading-6 text-[#16161d]">
                      {record.roomNumber}호
                    </div>
                    <div className="mt-1 text-[16px] font-semibold text-[#39394e] opacity-80">
                      {record.studentName}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700"
                    aria-label="확인 처리"
                    onClick={() => {
                      setActiveRecord(record);
                      setIsPhotoSheetOpen(true);
                    }}
                  >
                    <Camera className="h-5 w-5" />
                  </button>
                  <button
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-700"
                    aria-label="취소"
                    onClick={() => {}}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

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

              {mobileTab === "confirm" && (
                <>
                  <div className="mt-6 flex flex-col items-center">
                    <div className="text-[16px] font-semibold text-[#17171f]">
                      납부 확인 처리하시겠어요?
                    </div>
                    <div className="mt-2 text-[14px] text-[#6b7280]">
                      확인 완료하면 녹색 체크로 표시됩니다.
                    </div>
                  </div>
                  <div
                    className="absolute left-0 right-0 w-full flex items-center"
                    style={{ bottom: 46 }}
                  >
                    <div style={{ width: "calc((100vw - 335px) * 0.35)" }} />
                    <Button
                      variant="outline"
                      className="h-[48px] rounded-2xl"
                      style={{ width: 80 }}
                      onClick={() => setIsPhotoSheetOpen(false)}
                    >
                      취소
                    </Button>
                    <div style={{ width: "calc((100vw - 335px) * 0.275)" }} />
                    <Button
                      className="h-[48px] rounded-2xl"
                      style={{ width: 255 }}
                      onClick={handleConfirmActiveRecord}
                    >
                      확인 완료
                    </Button>
                    <div style={{ width: "calc((100vw - 335px) * 0.375)" }} />
                  </div>
                </>
              )}

              {mobileTab !== "confirm" && (
                <>
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
                        fontSize:
                          "var(--typography-body-1-normal-bold-fontSize)",
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
                        fontSize:
                          "var(--typography-body-1-normal-bold-fontSize)",
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
                </>
              )}
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
                    onCheckedChange={(checked) => {
                      const isChecked = checked as boolean;
                      setFilterPaid(isChecked);
                      if (isChecked) {
                        setFilterUnpaid(false);
                        setFilterUnconfirmed(false);
                      }
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
                      const isChecked = checked as boolean;
                      setFilterUnpaid(isChecked);
                      if (isChecked) {
                        setFilterPaid(false);
                        setFilterUnconfirmed(false);
                      }
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
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unconfirmed"
                    checked={filterUnconfirmed}
                    onCheckedChange={(checked) => {
                      const isChecked = checked as boolean;
                      setFilterUnconfirmed(isChecked);
                      if (isChecked) {
                        setFilterPaid(false);
                        setFilterUnpaid(false);
                      }
                    }}
                  />
                  <Label
                    htmlFor="unconfirmed"
                    className="text-[14px] font-medium leading-[20.006px] tracking-[0.203px]"
                  >
                    미확인
                  </Label>
                </div>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
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
                              {record.confirmed ? (
                                <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-green-600 text-white">
                                  <span className="text-[14px] font-bold leading-none">
                                    ✓
                                  </span>
                                </div>
                              ) : record.status === "paid" ? (
                                <div className="flex items-center justify-center w-[22px] h-[22px] rounded-full bg-yellow-500 text-white">
                                  <span className="text-[14px] font-bold leading-none">
                                    !
                                  </span>
                                </div>
                              ) : (
                                <div className="w-[22px] h-[22px]" />
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
