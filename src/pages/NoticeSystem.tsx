import React from 'react';
import {Megaphone, Plus, Send, Clock, CheckCircle} from 'lucide-react';

const NoticeSystem: React.FC = () => {
  const notices = [
    {
      id: 1,
      title: '점호 시간 변경 안내',
      content: '이번 주부터 점호 시간이 22:00으로 변경됩니다.',
      target: '전체',
      priority: 'high',
      status: 'sent',
      sentAt: '2024-01-15 14:30',
    },
    {
      id: 2,
      title: '세탁기 점검 안내',
      content: '3층 세탁기 점검으로 인해 내일 오전 사용이 제한됩니다.',
      target: '3층',
      priority: 'medium',
      status: 'scheduled',
      sentAt: '2024-01-16 09:00',
    },
    {
      id: 3,
      title: 'WiFi 비밀번호 변경',
      content: 'WiFi 비밀번호가 변경되었습니다. 새로운 비밀번호는 12345678입니다.',
      target: '전체',
      priority: 'low',
      status: 'draft',
      sentAt: null,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'sent':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          <CheckCircle className='h-3 w-3 mr-1' />
            발송완료
        </span>
      );
    case 'scheduled':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
          <Clock className='h-3 w-3 mr-1' />
            예약발송
        </span>
      );
    case 'draft':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            임시저장
        </span>
      );
    default:
      return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
    case 'high':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            긴급
        </span>
      );
    case 'medium':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            보통
        </span>
      );
    case 'low':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            낮음
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
          <h1 className='text-2xl font-bold text-gray-900'>공지 발송</h1>
          <p className='text-gray-600'>학생들에게 공지를 발송하고 발송 이력을 관리하세요</p>
        </div>
        <button className='btn btn-primary flex items-center'>
          <Plus className='h-4 w-4 mr-2' />새 공지 작성
        </button>
      </div>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Megaphone className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>이번 주 발송</p>
              <p className='text-2xl font-bold text-gray-900'>12</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Send className='h-8 w-8 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>발송 완료</p>
              <p className='text-2xl font-bold text-gray-900'>8</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Clock className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>예약 발송</p>
              <p className='text-2xl font-bold text-gray-900'>3</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Megaphone className='h-8 w-8 text-gray-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>임시저장</p>
              <p className='text-2xl font-bold text-gray-900'>1</p>
            </div>
          </div>
        </div>
      </div>

      {/* 새 공지 작성 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>새 공지 작성</h3>
        <div className='space-y-4'>
          <div>
            <label className='label'>제목</label>
            <input type='text' placeholder='공지 제목을 입력하세요' className='input' />
          </div>
          <div>
            <label className='label'>내용</label>
            <textarea rows={4} placeholder='공지 내용을 입력하세요' className='input' />
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='label'>대상</label>
              <select className='input'>
                <option value='all'>전체</option>
                <option value='1층'>1층</option>
                <option value='2층'>2층</option>
                <option value='3층'>3층</option>
                <option value='4층'>4층</option>
              </select>
            </div>
            <div>
              <label className='label'>중요도</label>
              <select className='input'>
                <option value='low'>낮음</option>
                <option value='medium'>보통</option>
                <option value='high'>긴급</option>
              </select>
            </div>
          </div>
          <div className='flex space-x-3'>
            <button className='btn btn-primary flex items-center'>
              <Send className='h-4 w-4 mr-2' />
              즉시 발송
            </button>
            <button className='btn btn-secondary'>예약 발송</button>
            <button className='btn btn-secondary'>임시저장</button>
          </div>
        </div>
      </div>

      {/* 발송 이력 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>발송 이력</h3>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  제목
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  대상
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  중요도
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  상태
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  발송시간
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  작업
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {notices.map((notice) => (
                <tr key={notice.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>{notice.title}</div>
                    <div className='text-sm text-gray-500 truncate max-w-xs'>{notice.content}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {notice.target}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {getPriorityBadge(notice.priority)}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>{getStatusBadge(notice.status)}</td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {notice.sentAt || '-'}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <button className='text-primary-600 hover:text-primary-900'>수정</button>
                      <button className='text-red-600 hover:text-red-900'>삭제</button>
                    </div>
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

export default NoticeSystem;
