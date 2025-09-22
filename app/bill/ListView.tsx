'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Eye, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Room, ApiRoom, CommonProps, NavigationCallbacks } from './types';

interface ListViewProps extends CommonProps, NavigationCallbacks {}

const ListView: React.FC<ListViewProps> = ({
  selectedRoom,
  selectedYear,
  selectedMonth,
  onRoomChange,
  onYearChange,
  onMonthChange,
  onNavigateToCapture,
  onNavigateToReview,
}) => {
  const router = useRouter();
  const [serverRooms, setServerRooms] = useState<ApiRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  // 서버에서 호실 데이터 로드
  useEffect(() => {
    let cancelled = false;
    const fetchRooms = async () => {
      try {
        setLoadingRooms(true);
        const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
        if (!serverUrl) throw new Error('SERVER_URL_NOT_CONFIGURED');
        const res = await fetch(`${serverUrl}/rooms`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: ApiRoom[] = await res.json();
        if (!cancelled) {
          setServerRooms(data);
          setRoomsError(null);
        }
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : String(err);
          setRoomsError(
            message === 'SERVER_URL_NOT_CONFIGURED'
              ? '서버 주소가 설정되지 않았습니다. .env의 NEXT_PUBLIC_SERVER_URL을 확인하세요.'
              : '호실 목록을 불러오지 못했습니다.'
          );
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

  // 호실 데이터 변환 (hasPhotos는 현재 false로 설정, 나중에 실제 데이터로 업데이트)
  const rooms: Room[] = serverRooms.map(r => ({
    floor: r.floor,
    roomNumber: String(r.id),
    hasPhotos: false, // TODO: 실제 사진 존재 여부 확인
  }));

  const floors = Array.from(new Set(rooms.map(r => r.floor))).sort((a, b) => a - b);
  const currentDate = new Date();
  const years = Array.from({length: 5}, (_, i) => currentDate.getFullYear() - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);

  return (
    <div className='p-4 max-w-6xl mx-auto h-full'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold mb-4'>관리비 관리</h1>
        
        {/* 년도와 월 선택기 */}
        <div className='flex gap-4 mb-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>년도</label>
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange(Number(e.target.value))}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {years.map(year => (
                <option key={year} value={year}>{year}년</option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>월</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange(Number(e.target.value))}
              className='px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              {months.map(month => (
                <option key={month} value={month}>{month}월</option>
              ))}
            </select>
          </div>
          <div className='flex items-end'>
            <span className='px-4 py-2 bg-blue-50 text-blue-700 rounded-md font-medium'>
              {selectedYear}년 {selectedMonth}월 관리비
            </span>
          </div>
        </div>
      </div>
      
      {loadingRooms && <div className='text-gray-500'>호실 목록을 불러오는 중...</div>}
      {roomsError && <div className='text-red-600'>{roomsError}</div>}

      {floors.map(floor => (
        <div key={floor} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4 text-gray-700'>{floor}층</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {rooms
              .filter(room => room.floor === floor)
              .map(room => (
                <div
                  key={room.roomNumber}
                  className='relative bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors cursor-pointer'
                  onClick={() => onRoomChange(room.roomNumber)}
                >
                  <div className='text-center'>
                    <div className='text-2xl font-bold mb-2'>{room.roomNumber}호</div>
                    {room.hasPhotos && (
                      <div className='text-xs text-green-600 font-medium'>사진 등록됨</div>
                    )}
                  </div>

                  {selectedRoom === room.roomNumber && (
                    <div className='absolute inset-x-0 -bottom-12 flex justify-center space-x-2 z-10'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onNavigateToCapture(room.roomNumber);
                        }}
                        className='bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm hover:bg-blue-600 shadow-lg'
                      >
                        <Camera className='w-4 h-4' />
                        <span>촬영</span>
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onNavigateToReview(room.roomNumber);
                        }}
                        className='bg-green-500 text-white px-3 py-2 rounded-lg flex items-center space-x-1 text-sm hover:bg-green-600 shadow-lg'
                      >
                        <Eye className='w-4 h-4' />
                        <span>확인</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListView;