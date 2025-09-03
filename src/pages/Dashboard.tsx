import React from 'react';
import {Package, Users, MessageSquare, Megaphone} from 'lucide-react';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: '오늘 도착 택배',
      value: '24',
      change: '+12%',
      changeType: 'increase',
      icon: Package,
    },
    {
      name: '점호 완료율',
      value: '95%',
      change: '+3%',
      changeType: 'increase',
      icon: Users,
    },
    {
      name: '미처리 문의',
      value: '8',
      change: '-2',
      changeType: 'decrease',
      icon: MessageSquare,
    },
    {
      name: '이번 주 공지',
      value: '3',
      change: '+1',
      changeType: 'increase',
      icon: Megaphone,
    },
  ];

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>대시보드</h1>
        <p className='text-gray-600'>기숙사 관리 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className='card'>
              <div className='flex items-center'>
                <div className='flex-shrink-0'>
                  <Icon className='h-8 w-8 text-primary-600' />
                </div>
                <div className='ml-4'>
                  <p className='text-sm font-medium text-gray-600'>{stat.name}</p>
                  <p className='text-2xl font-bold text-gray-900'>{stat.value}</p>
                  <p
                    className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change} 지난 주 대비
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 최근 활동 */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>최근 택배 도착</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between py-2'>
              <div>
                <p className='font-medium'>홍길동</p>
                <p className='text-sm text-gray-500'>CJ대한통운</p>
              </div>
              <span className='text-sm text-gray-500'>10분 전</span>
            </div>
            <div className='flex items-center justify-between py-2'>
              <div>
                <p className='font-medium'>김철수</p>
                <p className='text-sm text-gray-500'>한진택배</p>
              </div>
              <span className='text-sm text-gray-500'>25분 전</span>
            </div>
          </div>
        </div>

        <div className='card'>
          <h3 className='text-lg font-semibold text-gray-900 mb-4'>최근 문의</h3>
          <div className='space-y-3'>
            <div className='flex items-center justify-between py-2'>
              <div>
                <p className='font-medium'>세탁기 고장 문의</p>
                <p className='text-sm text-gray-500'>이영희</p>
              </div>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
                처리중
              </span>
            </div>
            <div className='flex items-center justify-between py-2'>
              <div>
                <p className='font-medium'>방 온도 조절 문의</p>
                <p className='text-sm text-gray-500'>박민수</p>
              </div>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                완료
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
