'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, Save, RefreshCw } from 'lucide-react';
import { Photo, CommonProps } from './types';

interface CaptureViewProps extends CommonProps {
  onBack: () => void;
  onSaveComplete: () => void;
}

const CaptureView: React.FC<CaptureViewProps> = ({
  selectedRoom,
  selectedYear,
  selectedMonth,
  onBack,
  onSaveComplete,
}) => {
  const [currentPhotoType, setCurrentPhotoType] = useState<'수도' | '전기' | '가스'>('수도');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>('image/jpeg');
  const [roomPhotos, setRoomPhotos] = useState<Map<string, Photo[]>>(new Map());
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // 카메라 정지
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraActive(false);
    }
  };

  // 파일 업로드 처리
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCurrentMimeType(file.type || 'image/jpeg');
      
      const reader = new FileReader();
      reader.onload = e => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Base64를 Blob으로 변환
  const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  };

  // 한국어 타입을 영어로 변환
  const getEnglishType = (koreanType: '수도' | '전기' | '가스'): 'water' | 'electricity' | 'gas' => {
    const typeMap = {
      '수도': 'water' as const,
      '전기': 'electricity' as const,
      '가스': 'gas' as const,
    };
    return typeMap[koreanType];
  };

  // MIME 타입을 파일 확장자로 변환
  const getFileExtension = (mimeType: string): string => {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'image/svg+xml': 'svg',
    };
    const ext = mimeToExt[mimeType.toLowerCase()];
    return ext ? ext : '';
  };

  // S3에 사진 업로드
  const uploadPhotoToS3 = async (photo: Photo): Promise<boolean> => {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL  as string | undefined;
      if (!serverUrl) {
        return false;
      }

      const mimeType = photo.mimeType || 'image/jpeg';
      const fileExtension = getFileExtension(mimeType);
      if (fileExtension === '') {
        throw new Error(`지원하지 않는 파일 형식입니다: ${mimeType}`);
      }

      // Presigned URL 요청
      const presignResponse = await fetch(`${serverUrl}/bill/presign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contentType: mimeType,
          ext: fileExtension,
          roomId: photo.roomNumber,
          type: getEnglishType(photo.type),
          year: selectedYear,
          month: selectedMonth,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error(`Presigned URL 요청 실패: ${presignResponse.status}`);
      }

      const presignData = await presignResponse.json();
      const imageBlob = base64ToBlob(photo.url, mimeType);

      // S3에 직접 업로드
      const uploadResponse = await fetch(presignData.url, {
        method: 'PUT',
        headers: presignData.headers,
        body: imageBlob,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 업로드 실패: ${uploadResponse.status}`);
      }

      return true;
    } catch (error) {
      return false;
    }
  };

  // 사진 저장
  const savePhoto = async () => {
    if (previewImage && selectedRoom) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        type: currentPhotoType,
        url: previewImage,
        roomNumber: selectedRoom,
        timestamp: new Date(),
        mimeType: currentMimeType,
      };

      // 로컬 상태 업데이트
      const roomKey = `${selectedYear}-${selectedMonth}-${selectedRoom}`;
      const currentPhotos = roomPhotos.get(roomKey) || [];
      const updatedPhotos = [...currentPhotos.filter(p => p.type !== currentPhotoType), newPhoto];
      const newRoomPhotos = new Map(roomPhotos);
      newRoomPhotos.set(roomKey, updatedPhotos);
      setRoomPhotos(newRoomPhotos);

      // 백그라운드에서 S3 업로드
      uploadPhotoToS3(newPhoto).then(success => {
        if (!success) {
          alert(`${selectedRoom}호 ${currentPhotoType} 사진 업로드에 실패했습니다.`);
        }
      });

      // 다음 사진 타입으로 이동
      const photoTypes: ('수도' | '전기' | '가스')[] = ['수도', '전기', '가스'];
      const currentIndex = photoTypes.indexOf(currentPhotoType);

      if (currentIndex < photoTypes.length - 1) {
        const nextPhotoType = photoTypes[currentIndex + 1];
        setCurrentPhotoType(nextPhotoType);
        loadExistingPhoto(nextPhotoType);
      } else {
        // 모든 사진 촬영 완료
        alert('호실의 사진 촬영이 완료되었습니다.');
        onSaveComplete();
      }
    }
  };

  // 현재 타입의 기존 사진을 로드하는 함수
  const loadExistingPhoto = (photoType: '수도' | '전기' | '가스') => {
    if (!selectedRoom) return;
    
    const roomKey = `${selectedYear}-${selectedMonth}-${selectedRoom}`;
    const existingPhotos = roomPhotos.get(roomKey) || [];
    const existingPhoto = existingPhotos.find(p => p.type === photoType);
    
    if (existingPhoto) {
      setPreviewImage(existingPhoto.url);
      setCurrentMimeType(existingPhoto.mimeType || 'image/jpeg');
    } else {
      setPreviewImage(null);
      setCurrentMimeType('image/jpeg');
    }
  };

  // 사진 타입 클릭 핸들러
  const handlePhotoTypeClick = (type: '수도' | '전기' | '가스') => {
    setCurrentPhotoType(type);
    loadExistingPhoto(type);
    
    if (isCameraActive) {
      stopCamera();
    }
  };

  // 컴포넌트 언마운트 시 카메라 정리
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // 호실이나 사진 타입이 변경될 때 기존 사진 로드
  useEffect(() => {
    if (selectedRoom) {
      loadExistingPhoto(currentPhotoType);
    }
  }, [selectedRoom, currentPhotoType, selectedYear, selectedMonth]);

  return (
    <div className='min-h-screen bg-gray-900 text-white flex flex-col'>
      {/* 헤더 */}
      <div className='bg-gray-800 px-4 py-3 flex items-center justify-between'>
        <button
          onClick={() => {
            stopCamera();
            setPreviewImage(null);
            onBack();
          }}
          className='p-2 hover:bg-gray-700 rounded-lg'
        >
          <ChevronLeft className='w-6 h-6' />
        </button>
        <div className='text-center'>
          <div className='text-lg font-semibold'>{selectedRoom}호</div>
          <div className='text-sm text-gray-400'>{selectedYear}년 {selectedMonth}월 - {currentPhotoType} 요금</div>
        </div>
        <div className='w-10' />
      </div>

      {/* 카메라/프리뷰 영역 */}
      <div className='flex-1 relative bg-black flex items-center justify-center'>
        {!previewImage ? (
          <>
            {isCameraActive ? (
              <video ref={videoRef} autoPlay playsInline className='w-full h-full object-cover' />
            ) : (
              <div className='text-center p-8'>
                <div className='mb-4 text-gray-400'>
                  <Camera className='w-16 h-16 mx-auto mb-4' />
                  <p>카메라를 시작하거나 파일을 업로드하세요</p>
                </div>
              </div>
            )}
            <canvas ref={canvasRef} className='hidden' />
          </>
        ) : (
          <img
            src={previewImage}
            alt='Preview'
            className='max-w-full max-h-full object-contain'
          />
        )}
      </div>

      {/* 컨트롤 영역 */}
      <div className='bg-gray-800 p-4'>
        {!previewImage ? (
          <div className='flex justify-center space-x-4'>
            <label className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full flex items-center space-x-2 cursor-pointer'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                capture='environment'
                onChange={handleFileUpload}
                className='hidden'
              />
              <Save className='w-5 h-5' />
              <span>촬영</span>
            </label>
          </div>
        ) : (
          <div className='flex justify-center space-x-4'>
            <button
              onClick={() => {
                setPreviewImage(null);
                setIsCameraActive(false);
              }}
              className='bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2'
            >
              <RefreshCw className='w-5 h-5' />
              <span>다시 찍기</span>
            </button>
            <button
              onClick={savePhoto}
              className='bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2'
            >
              <Save className='w-5 h-5' />
              <span>저장 & 다음</span>
            </button>
          </div>
        )}
      </div>

      {/* 진행 상태 표시 */}
      <div className='bg-gray-900 px-4 py-2'>
        <div className='flex justify-center space-x-2'>
          {(['수도', '전기', '가스'] as const).map(type => (
            <button
              key={type}
              onClick={() => handlePhotoTypeClick(type)}
              className={`px-3 py-1 rounded text-xs cursor-pointer transition-all duration-200 hover:opacity-80 ${
                type === currentPhotoType
                  ? 'bg-blue-500 text-white'
                  : roomPhotos.get(`${selectedYear}-${selectedMonth}-${selectedRoom || ''}`)?.some(p => p.type === type)
                    ? 'bg-green-500 text-white hover:bg-green-400'
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
              title={
                type === currentPhotoType
                  ? `현재 촬영 중: ${type} 요금`
                  : roomPhotos.get(`${selectedYear}-${selectedMonth}-${selectedRoom || ''}`)?.some(p => p.type === type)
                    ? `${type} 요금 재촬영하기`
                    : `${type} 요금 촬영하기`
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaptureView;