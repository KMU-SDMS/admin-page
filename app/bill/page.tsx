"use client";

import React, { useState } from "react";
import { Layout } from "@/components/layout";
import ListView from "./ListView";

const Bill: React.FC = () => {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  );
  const [selectedFloor, setSelectedFloor] = useState<number>(1);

  // 공통 Props
  const commonProps = {
    selectedRoom,
    selectedYear,
    selectedMonth,
    selectedFloor,
    onRoomChange: setSelectedRoom,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
    onFloorChange: setSelectedFloor,
  };

  // 더미 네비게이션 콜백들 (모달에서 사용하지 않음)
  const navigationCallbacks = {
    onNavigateToCapture: () => {},
    onNavigateToReview: () => {},
    onBack: () => {},
  };

  return (
    <Layout>
      <div className="h-full">
        <ListView {...commonProps} {...navigationCallbacks} />
      </div>
    </Layout>
  );
};

export default Bill;
