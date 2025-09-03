import React from 'react';
import {Users, CheckCircle, Clock, AlertCircle} from 'lucide-react';

const RollCall: React.FC = () => {
  const floors = [
    {
      floor: '1층',
      total: 24,
      present: 23,
      absent: 1,
      status: 'completed',
    },
    {
      floor: '2층',
      total: 28,
      present: 28,
      absent: 0,
      status: 'completed',
    },
    {
      floor: '3층',
      total: 26,
      present: 25,
      absent: 1,
      status: 'in-progress',
    },
    {
      floor: '4층',
      total: 30,
      present: 0,
      absent: 30,
      status: 'pending',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'completed':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          <CheckCircle className='h-3 w-3 mr-1' />
            완료
        </span>
      );
    case 'in-progress':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
          <Clock className='h-3 w-3 mr-1' />
            진행중
        </span>
      );
    case 'pending':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
          <AlertCircle className='h-3 w-3 mr-1' />
            대기
        </span>
      );
    default:
      return null;
    }
  };

  const getAttendanceRate = (present: number, total: number) => {
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>점호 관리</h1>
        <p className='text-gray-600'>층별 출석률과 점호 진행 상황을 실시간으로 확인하세요</p>
      </div>

      {/* 전체 통계 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Users className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>전체 학생</p>
              <p className='text-2xl font-bold text-gray-900'>108</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>출석</p>
              <p className='text-2xl font-bold text-gray-900'>76</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <AlertCircle className='h-8 w-8 text-red-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>결석</p>
              <p className='text-2xl font-bold text-gray-900'>2</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Clock className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>출석률</p>
              <p className='text-2xl font-bold text-gray-900'>70%</p>
            </div>
          </div>
        </div>
      </div>

      {/* 층별 현황 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>층별 점호 현황</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {floors.map((floor) => (
            <div
              key={floor.floor}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200'
            >
              <div className='flex items-center justify-between mb-3'>
                <h4 className='font-semibold text-gray-900'>{floor.floor}</h4>
                {getStatusBadge(floor.status)}
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>전체</span>
                  <span className='font-medium'>{floor.total}명</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>출석</span>
                  <span className='font-medium text-green-600'>{floor.present}명</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>결석</span>
                  <span className='font-medium text-red-600'>{floor.absent}명</span>
                </div>
                <div className='mt-3'>
                  <div className='flex justify-between text-sm mb-1'>
                    <span className='text-gray-600'>출석률</span>
                    <span className='font-medium'>
                      {getAttendanceRate(floor.present, floor.total)}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${getAttendanceRate(floor.present, floor.total)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 점호 기록 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>최근 점호 기록</h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  날짜
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  시간
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  출석률
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  담당자
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  비고
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              <tr>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>2024-01-15</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>22:00</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>95%</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>김관리</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>정상</td>
              </tr>
              <tr>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>2024-01-14</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>22:00</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>98%</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>이관리</td>
                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>정상</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RollCall;
