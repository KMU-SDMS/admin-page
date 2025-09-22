'use client';

import React, { useState } from 'react';
import { Layout } from '@/components/layout';
import { ViewMode } from './types';
import ListView from './ListView';
import CaptureView from './CaptureView';
import ReviewView from './ReviewView';

const Bill: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // 네비게이션 핸들러들
  const handleNavigateToCapture = (roomNumber: string) => {
    setSelectedRoom(roomNumber);
    setViewMode('capture');
  };

  const handleNavigateToReview = (roomNumber: string) => {
    setSelectedRoom(roomNumber);
    setViewMode('review');
  };

  const handleBack = () => {
    setViewMode('list');
    setSelectedRoom(null);
  };

  const handleSaveComplete = () => {
    setViewMode('list');
    setSelectedRoom(null);
  };

  const handleNavigateToCaptureFromReview = (roomNumber: string, photoType: '수도' | '전기' | '가스') => {
    setSelectedRoom(roomNumber);
    setViewMode('capture');
    // TODO: photoType을 CaptureView에 전달하는 방법 구현
  };

  // 공통 Props
  const commonProps = {
    selectedRoom,
    selectedYear,
    selectedMonth,
    onRoomChange: setSelectedRoom,
    onYearChange: setSelectedYear,
    onMonthChange: setSelectedMonth,
  };

  // 네비게이션 콜백들
  const navigationCallbacks = {
    onNavigateToCapture: handleNavigateToCapture,
    onNavigateToReview: handleNavigateToReview,
    onBack: handleBack,
  };

  return (
    <Layout>
      <div className="h-full">
        {viewMode === 'list' && (
          <ListView
            {...commonProps}
            {...navigationCallbacks}
          />
        )}
        {viewMode === 'capture' && selectedRoom && (
          <CaptureView
            {...commonProps}
            onBack={handleBack}
            onSaveComplete={handleSaveComplete}
          />
        )}
        {viewMode === 'review' && selectedRoom && (
          <ReviewView
            {...commonProps}
            onBack={handleBack}
            onNavigateToCapture={handleNavigateToCaptureFromReview}
          />
        )}
      </div>
    </Layout>
  );
};

export default Bill;
