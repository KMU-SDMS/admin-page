"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ChevronDown } from "lucide-react";
import {
  RoomPaymentInfo,
  CommonProps,
  NavigationCallbacks,
  ApiRoom,
} from "./types";
import { roomsApi } from "@/lib/api";
import RoomDetailModal from "./RoomDetailModal";

interface ListViewProps extends CommonProps, NavigationCallbacks {}

const ListView: React.FC<ListViewProps> = ({
  selectedYear,
  selectedMonth,
  selectedFloor,
  onYearChange,
  onMonthChange,
  onFloorChange,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "paid" | "unpaid">(
    "all"
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [roomPayments, setRoomPayments] = useState<RoomPaymentInfo[]>([]);
  const [serverRooms, setServerRooms] = useState<ApiRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoomForModal, setSelectedRoomForModal] = useState<
    string | null
  >(null);

  // 서버에서 호실 데이터 로드
  useEffect(() => {
    let cancelled = false;
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const data = await roomsApi.getAll();
        if (!cancelled) {
          setServerRooms(data);
          setRoomsError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setRoomsError("호실 목록을 불러오지 못했습니다.");
          console.error("호실 로딩 실패:", message);
        }
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    };
    fetchRooms();
    return () => {
      cancelled = true;
    };
  }, []);

  // 호실 데이터와 납부 상태 결합
  useEffect(() => {
    if (serverRooms.length > 0) {
      const generateRoomPayments = (): RoomPaymentInfo[] => {
        return serverRooms.map((room) => {
          const statuses: ("paid" | "unpaid" | "action_required")[] = [
            "paid",
            "unpaid",
            "action_required",
          ];
          const randomStatus =
            statuses[Math.floor(Math.random() * statuses.length)];

          return {
            roomNumber: String(room.id),
            status: randomStatus,
            hasPhotos: Math.random() > 0.5,
          };
        });
      };

      setRoomPayments(generateRoomPayments());
    }
  }, [serverRooms]);

  // 통계 계산
  const totalRooms = serverRooms.length || 99; // 실제 호실 수 또는 99 (API 연결되지 않음)
  const paidRooms = roomPayments.filter((r) => r.status === "paid").length;
  const unpaidRooms = roomPayments.filter((r) => r.status === "unpaid").length;

  // 필터링된 호실 목록
  const filteredRooms = roomPayments.filter((room) => {
    switch (filterStatus) {
      case "paid":
        return room.status === "paid";
      case "unpaid":
        return room.status === "unpaid";
      case "all":
      default:
        return true;
    }
  });

  // 현재 년도 기준으로 동적 생성
  const currentYear = new Date().getFullYear();
  const months = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];
  const days = [11, 15, 19, 17, 12, 19, 26, 19, 20, 24, 29, 76, 25, 11];

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (isDropdownOpen && !target.closest(".dropdown-container")) {
        setIsDropdownOpen(false);
      }

      if (isMonthDropdownOpen && !target.closest(".month-dropdown-container")) {
        setIsMonthDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isMonthDropdownOpen]);

  // 호실 카드 렌더링
  const renderRoomCard = (room: RoomPaymentInfo) => {
    const getCardStyle = () => {
      switch (room.status) {
        case "paid":
          return "bg-green-100 border-green-200";
        case "unpaid":
          return "bg-orange-100 border-orange-200";
        case "action_required":
          return "bg-white border-gray-200";
        default:
          return "bg-white border-gray-200";
      }
    };

    const getStatusIcon = () => {
      switch (room.status) {
        case "paid":
          return <CheckCircle className="w-4 h-4 text-green-600" />;
        case "unpaid":
          return <AlertTriangle className="w-4 h-4 text-orange-600" />;
        case "action_required":
          return null;
        default:
          return null;
      }
    };

    const getStatusText = () => {
      switch (room.status) {
        case "paid":
          return "납부 완료";
        case "unpaid":
          return "▲ 미납";
        case "action_required":
          return null;
        default:
          return null;
      }
    };

    const handleRoomClick = () => {
      setSelectedRoomForModal(room.roomNumber);
      setIsModalOpen(true);
    };

    return (
      <div
        key={room.roomNumber}
        className={`relative p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getCardStyle()}`}
        onClick={handleRoomClick}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-bold">{room.roomNumber}호</div>
          <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
        </div>

        {room.status === "action_required" ? (
          <div className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm font-medium text-center">
            납부 사진 보기
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full bg-gray-50">
      {/* 상단 헤더 */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">관리비 관리</h1>

            {/* 날짜/년도 선택 */}
            <div className="flex items-center space-x-4">
              <div className="text-sm font-medium">{selectedFloor}층</div>

              {/* 년도 슬라이더 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm">{currentYear}</span>
              </div>

              {/* 월 선택 드롭다운 */}
              <div className="relative month-dropdown-container">
                <button
                  onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{selectedMonth}월</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {isMonthDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-32 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    <div className="py-1">
                      {months.map((month) => (
                        <button
                          key={month}
                          onClick={() => {
                            onMonthChange(month);
                            setIsMonthDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                            month === selectedMonth
                              ? "bg-blue-50 text-blue-700"
                              : "text-gray-700"
                          }`}
                        >
                          {month}월
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="p-6">
        {/* 요약 통계 */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">
            {selectedYear}년 {selectedMonth}월 납부 현황
          </h2>
          <div className="text-sm text-gray-600">
            총 {totalRooms}세대 중 {paidRooms}세대 납부, {unpaidRooms}세대 미납
          </div>
        </div>

        {/* 필터 드롭다운 */}
        <div className="mb-6 flex justify-left">
          <div className="relative dropdown-container">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <span>
                {filterStatus === "all" && "전체"}
                {filterStatus === "paid" && "납부 세대만"}
                {filterStatus === "unpaid" && "미납 세대만"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === "all"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    전체
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("paid");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === "paid"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    납부 세대만
                  </button>
                  <button
                    onClick={() => {
                      setFilterStatus("unpaid");
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      filterStatus === "unpaid"
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700"
                    }`}
                  >
                    미납 세대만
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 로딩/에러 상태 */}
        {loadingRooms && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>호실 목록을 불러오는 중...</p>
          </div>
        )}

        {roomsError && (
          <div className="text-center py-12 text-red-600">
            <p>{roomsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 호실 그리드 */}
        {!loadingRooms && !roomsError && (
          <div className="grid grid-cols-5 gap-4">
            {filteredRooms.map(renderRoomCard)}
          </div>
        )}
      </div>

      {/* 호실 상세 모달 */}
      <RoomDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRoomForModal(null);
        }}
        selectedRoom={selectedRoomForModal}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        selectedFloor={selectedFloor}
        onRoomChange={() => {}}
        onYearChange={onYearChange}
        onMonthChange={onMonthChange}
        onFloorChange={onFloorChange}
      />
    </div>
  );
};

export default ListView;
