import React from 'react';
import {Package, Search, Plus, Camera} from 'lucide-react';

const PackageManagement: React.FC = () => {
  const packages = [
    {
      id: 1,
      recipient: '홍길동',
      room: '101호',
      courier: 'CJ대한통운',
      trackingNumber: '1234567890',
      status: 'arrived',
      arrivedAt: '2024-01-15 14:30',
    },
    {
      id: 2,
      recipient: '김철수',
      room: '205호',
      courier: '한진택배',
      trackingNumber: '0987654321',
      status: 'waiting',
      arrivedAt: '2024-01-15 13:45',
    },
    {
      id: 3,
      recipient: '이영희',
      room: '312호',
      courier: '롯데택배',
      trackingNumber: '1122334455',
      status: 'completed',
      arrivedAt: '2024-01-15 12:20',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'arrived':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
            도착
        </span>
      );
    case 'waiting':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            수령 대기
        </span>
      );
    case 'completed':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            완료
        </span>
      );
    default:
      return null;
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>택배 관리</h1>
          <p className='text-gray-600'>실시간 택배 현황 모니터링 및 관리</p>
        </div>
        <div className='flex space-x-3'>
          <button className='btn btn-secondary flex items-center'>
            <Camera className='h-4 w-4 mr-2' />
            OCR 등록
          </button>
          <button className='btn btn-primary flex items-center'>
            <Plus className='h-4 w-4 mr-2' />
            수동 등록
          </button>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className='card'>
        <div className='flex items-center space-x-4'>
          <div className='flex-1'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='수령인명, 송장번호로 검색...'
                className='input pl-10'
              />
            </div>
          </div>
          <select className='input w-32'>
            <option value=''>전체 상태</option>
            <option value='arrived'>도착</option>
            <option value='waiting'>수령 대기</option>
            <option value='completed'>완료</option>
          </select>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Package className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>오늘 도착</p>
              <p className='text-2xl font-bold text-gray-900'>24</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Package className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>수령 대기</p>
              <p className='text-2xl font-bold text-gray-900'>8</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Package className='h-8 w-8 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>수령 완료</p>
              <p className='text-2xl font-bold text-gray-900'>16</p>
            </div>
          </div>
        </div>
      </div>

      {/* 택배 목록 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>택배 목록</h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  수령인
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  방호수
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  택배사
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  송장번호
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  상태
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  도착시간
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  작업
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {packages.map((pkg) => (
                <tr key={pkg.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                    {pkg.recipient}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>{pkg.room}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {pkg.courier}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {pkg.trackingNumber}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(pkg.status)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {pkg.arrivedAt}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <button className='text-primary-600 hover:text-primary-900'>수령 처리</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageManagement;
