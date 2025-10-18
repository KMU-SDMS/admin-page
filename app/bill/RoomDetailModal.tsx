'use client';

import React, { useState, useEffect } from 'react';
import { X, Camera, Eye, CheckCircle, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { Photo, ServerPhotoResponse, CommonProps } from './types';

interface RoomDetailModalProps extends CommonProps {
  isOpen: boolean;
  onClose: () => void;
}

const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  selectedYear,
  selectedMonth,
  selectedFloor,
}) => {
  const [currentPhotoType, setCurrentPhotoType] = useState<'수도' | '전기' | '가스'>('수도');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [currentMimeType, setCurrentMimeType] = useState<string>('image/jpeg');
  const [roomPhotos, setRoomPhotos] = useState<Map<string, Photo[]>>(new Map());
  const [serverPhotos, setServerPhotos] = useState<Photo[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [isCaptureMode, setIsCaptureMode] = useState(false);

  // 서버에서 사진 정보 가져오기
  const fetchPhotoFromServer = async (roomId: string, type: 'water' | 'electricity' | 'gas', year: number, month: number): Promise<Photo | null> => {
    try {
      const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
      if (!serverUrl) {
        console.error('서버 URL이 설정되지 않았습니다.');
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
      console.error('사진 정보 가져오기 실패:', error);
      return null;
    }
  };

  // 서버에서 사진들을 가져오는 useEffect
  useEffect(() => {
    if (selectedRoom && isOpen) {
      let ignore = false;
      
      const fetchPhotosFromServer = async () => {
        try {
          setLoadingPhotos(true);
          const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
          if (!serverUrl) {
            console.error('서버 URL이 설정되지 않았습니다.');
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
              console.error(`${type} 사진 가져오기 실패:`, error);
              return null;
            }
          });

          const results = await Promise.all(photoPromises);
          const validPhotos = results.filter((photo): photo is Photo => photo !== null);

          if (!ignore && validPhotos.length > 0) {
            setServerPhotos(validPhotos);
          }
        } catch (error) {
          console.error('사진 로딩 실패:', error);
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
  }, [selectedRoom, selectedYear, selectedMonth, isOpen]);

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
      const serverUrl = process.env.NEXT_PUBLIC_API_BASE_URL as string | undefined;
      if (!serverUrl) {
        console.error('서버 URL이 설정되지 않았습니다.');
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
      console.error('사진 업로드 실패:', error);
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
        } else {
          // 업로드 성공 시 서버 사진 목록 새로고침
          window.location.reload();
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
        setIsCaptureMode(false);
        setPreviewImage(null);
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
  };

  // 사진 삭제
  const deletePhoto = (photoId: string) => {
    setServerPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
    // TODO: 서버에서 사진 삭제 API 호출
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{selectedRoom}호 관리비</h2>
            <p className="text-sm text-gray-500">{selectedYear}년 {selectedMonth}월</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {isCaptureMode ? (
            /* 촬영 모드 */
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">{currentPhotoType} 요금 촬영</h3>
                <p className="text-sm text-gray-500">사진을 촬영하거나 파일을 업로드하세요</p>
              </div>

              {/* 촬영 영역 */}
              <div className="bg-gray-100 rounded-lg p-8 min-h-[300px] flex items-center justify-center">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="max-w-full max-h-64 object-contain rounded"
                  />
                ) : (
                  <div className="text-center text-gray-400">
                    <Camera className="w-16 h-16 mx-auto mb-4" />
                    <p>사진을 업로드하세요</p>
                  </div>
                )}
              </div>

              {/* 파일 업로드 */}
              <div className="flex justify-center">
                <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Camera className="w-5 h-5" />
                  <span>사진 촬영/업로드</span>
                </label>
              </div>

              {/* 액션 버튼들 */}
              {previewImage && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>다시 찍기</span>
                  </button>
                  <button
                    onClick={savePhoto}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>저장 & 다음</span>
                  </button>
                </div>
              )}

              {/* 사진 타입 선택 */}
              <div className="flex justify-center space-x-2">
                {(['수도', '전기', '가스'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => handlePhotoTypeClick(type)}
                    className={`px-4 py-2 rounded text-sm cursor-pointer transition-all duration-200 ${
                      type === currentPhotoType
                        ? 'bg-blue-500 text-white'
                        : roomPhotos.get(`${selectedYear}-${selectedMonth}-${selectedRoom || ''}`)?.some(p => p.type === type)
                          ? 'bg-green-500 text-white hover:bg-green-400'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 확인 모드 */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">등록된 사진</h3>
                <button
                  onClick={() => setIsCaptureMode(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <Camera className="w-4 h-4" />
                  <span>사진 촬영</span>
                </button>
              </div>

              {loadingPhotos ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p>사진을 불러오는 중...</p>
                </div>
              ) : serverPhotos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>등록된 사진이 없습니다</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['수도', '전기', '가스'] as const).map(type => {
                    const photo = serverPhotos.find(p => p.type === type);

                    return (
                      <div key={type} className="bg-white border rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
                          {type} 요금
                        </div>

                        {photo ? (
                          <>
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                              <img
                                src={photo.url}
                                alt={`${type} 요금`}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                            <div className="p-3 flex justify-between items-center">
                              <span className="text-xs text-gray-500">
                                {new Date(photo.timestamp).toLocaleString('ko-KR')}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setCurrentPhotoType(type);
                                    setIsCaptureMode(true);
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="재촬영"
                                >
                                  <RefreshCw className="w-4 h-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`${type} 요금 사진을 삭제하시겠습니까?`)) {
                                      deletePhoto(photo.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-gray-100 rounded"
                                  title="삭제"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="p-8 text-center text-gray-400">
                            <Camera className="w-12 h-12 mx-auto mb-2" />
                            <p className="text-sm">사진 없음</p>
                            <button
                              onClick={() => {
                                setCurrentPhotoType(type);
                                setIsCaptureMode(true);
                              }}
                              className="mt-2 text-blue-500 text-sm hover:underline"
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
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetailModal;
