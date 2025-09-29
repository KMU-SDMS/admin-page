'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Eye, Trash2, ChevronLeft, RefreshCw } from 'lucide-react';
import { Photo, ServerPhotoResponse, CommonProps } from './types';

interface ReviewViewProps extends CommonProps {
  onBack: () => void;
  onNavigateToCapture: (roomNumber: string, photoType: '수도' | '전기' | '가스') => void;
}

const ReviewView: React.FC<ReviewViewProps> = ({
  selectedRoom,
  selectedYear,
  selectedMonth,
  onBack,
  onNavigateToCapture,
}) => {
  const [serverPhotos, setServerPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // 서버에서 사진 정보 가져오기
  const fetchPhotoFromServer = async (roomId: string, type: 'water' | 'electricity' | 'gas', year: number, month: number): Promise<Photo | null> => {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL  as string | undefined;
      if (!serverUrl) {
        return null;
      }

      const response = await fetch(`${serverUrl}/bill/image?roomId=${roomId}&type=${type}&year=${year}&month=${month}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`서버 요청 실패: ${response.status}`);
      }

      const data: ServerPhotoResponse = await response.json();
      
      const koreanType = type === 'water' ? '수도' : type === 'electricity' ? '전기' : '가스';
      return {
        id: data.key,
        type: koreanType,
        url: data.url,
        roomNumber: roomId,
        timestamp: new Date(data.lastModified),
        mimeType: 'image/jpeg'
      };
    } catch (error) {
      return null;
    }
  };

  // 서버에서 사진들을 가져오는 useEffect
  useEffect(() => {
    if (selectedRoom) {
      let ignore = false;
      
      const fetchPhotosFromServer = async () => {
        try {
          setLoadingPhotos(true);
          const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
          if (!serverUrl) {
            return;
          }

          const photoTypes: ('water' | 'electricity' | 'gas')[] = ['water', 'electricity', 'gas'];
          const photoPromises = photoTypes.map(async (type) => {
            try {
              const response = await fetch(`${serverUrl}/bill/image?roomId=${selectedRoom}&type=${type}&year=${selectedYear}&month=${selectedMonth}`);
              
              if (!response.ok) {
                if (response.status === 404) {
                  return null;
                }
                throw new Error(`서버 요청 실패: ${response.status}`);
              }

              const data: ServerPhotoResponse = await response.json();
              
              const koreanType = type === 'water' ? '수도' : type === 'electricity' ? '전기' : '가스';
              return {
                id: data.key,
                type: koreanType,
                url: data.url,
                roomNumber: selectedRoom,
                timestamp: new Date(data.lastModified),
                mimeType: 'image/jpeg'
              } as Photo;
            } catch (error) {
              return null;
            }
          });

          const results = await Promise.all(photoPromises);
          const validPhotos = results.filter((photo): photo is Photo => photo !== null);

          if (!ignore && validPhotos.length > 0) {
            setServerPhotos(validPhotos);
          }
        } catch (error) {
          // 에러 처리
        } finally {
          if (!ignore) {
            setLoadingPhotos(false);
          }
        }
      };

      fetchPhotosFromServer();

      return () => {
        ignore = true;
      };
    }
  }, [selectedRoom, selectedYear, selectedMonth]);

  // 사진 삭제 (로컬에서만)
  const deletePhoto = (photoId: string) => {
    setServerPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
    // TODO: 서버에서 사진 삭제 API 호출
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* 헤더 */}
      <div className='bg-white shadow-sm px-4 py-3 flex items-center justify-between'>
        <button onClick={onBack} className='p-2 hover:bg-gray-100 rounded-lg'>
          <ChevronLeft className='w-6 h-6' />
        </button>
        <div className='text-center'>
          <div className='text-lg font-semibold'>{selectedRoom}호 관리비 사진</div>
          <div className='text-xs text-gray-500'>{selectedYear}년 {selectedMonth}월</div>
        </div>
        <div className='w-10' />
      </div>

      {/* 사진 리스트 */}
      <div className='p-4'>
        {loadingPhotos ? (
          <div className='text-center py-12 text-gray-500'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
            <p>사진을 불러오는 중...</p>
          </div>
        ) : serverPhotos.length === 0 ? (
          <div className='text-center py-12 text-gray-500'>
            <Camera className='w-16 h-16 mx-auto mb-4 text-gray-300' />
            <p>등록된 사진이 없습니다</p>
            <button
              onClick={() => onNavigateToCapture(selectedRoom!, '수도')}
              className='mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
            >
              사진 촬영하기
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {(['수도', '전기', '가스'] as const).map(type => {
              const photo = serverPhotos.find(p => p.type === type);

              return (
                <div key={type} className='bg-white rounded-lg shadow-md overflow-hidden'>
                  <div className='bg-gray-100 px-4 py-2 font-semibold text-gray-700'>
                    {type} 요금
                  </div>

                  {photo ? (
                    <>
                      <div className='aspect-w-16 aspect-h-9 bg-gray-200'>
                        <img
                          src={photo.url}
                          alt={`${type} 요금`}
                          className='w-full h-48 object-cover'
                        />
                      </div>
                      <div className='p-3 flex justify-between items-center'>
                        <span className='text-xs text-gray-500'>
                          {new Date(photo.timestamp).toLocaleString('ko-KR')}
                        </span>
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => onNavigateToCapture(selectedRoom!, type)}
                            className='p-1 hover:bg-gray-100 rounded'
                            title='재촬영'
                          >
                            <RefreshCw className='w-4 h-4 text-blue-600' />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${type} 요금 사진을 삭제하시겠습니까?`)) {
                                deletePhoto(photo.id);
                              }
                            }}
                            className='p-1 hover:bg-gray-100 rounded'
                            title='삭제'
                          >
                            <Trash2 className='w-4 h-4 text-red-500' />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className='p-8 text-center text-gray-400'>
                      <Camera className='w-12 h-12 mx-auto mb-2' />
                      <p className='text-sm'>사진 없음</p>
                      <button
                        onClick={() => onNavigateToCapture(selectedRoom!, type)}
                        className='mt-2 text-blue-500 text-sm hover:underline'
                      >
                        추가하기
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewView;