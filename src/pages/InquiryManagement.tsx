import React from 'react';
import {MessageSquare, Clock, CheckCircle, AlertTriangle} from 'lucide-react';

const InquiryManagement: React.FC = () => {
  const inquiries = [
    {
      id: 1,
      student: '홍길동',
      room: '101호',
      subject: '세탁기 고장 문의',
      content: '3층 세탁기가 작동하지 않습니다. 확인 부탁드립니다.',
      status: 'pending',
      priority: 'high',
      createdAt: '2024-01-15 14:30',
    },
    {
      id: 2,
      student: '김철수',
      room: '205호',
      subject: '방 온도 조절 문의',
      content: '방이 너무 추운데 온도 조절이 가능한가요?',
      status: 'in-progress',
      priority: 'medium',
      createdAt: '2024-01-15 13:45',
    },
    {
      id: 3,
      student: '이영희',
      room: '312호',
      subject: 'WiFi 연결 문제',
      content: '인터넷이 자주 끊어집니다.',
      status: 'completed',
      priority: 'low',
      createdAt: '2024-01-15 12:20',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
    case 'pending':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
          <Clock className='h-3 w-3 mr-1' />
            대기
        </span>
      );
    case 'in-progress':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
          <MessageSquare className='h-3 w-3 mr-1' />
            처리중
        </span>
      );
    case 'completed':
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
          <CheckCircle className='h-3 w-3 mr-1' />
            완료
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
          <AlertTriangle className='h-3 w-3 mr-1' />
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
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>문의 관리</h1>
        <p className='text-gray-600'>학생들의 문의사항을 실시간으로 관리하고 응답하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <MessageSquare className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>전체 문의</p>
              <p className='text-2xl font-bold text-gray-900'>24</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <Clock className='h-8 w-8 text-yellow-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>대기중</p>
              <p className='text-2xl font-bold text-gray-900'>8</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <MessageSquare className='h-8 w-8 text-blue-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>처리중</p>
              <p className='text-2xl font-bold text-gray-900'>5</p>
            </div>
          </div>
        </div>
        <div className='card'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <CheckCircle className='h-8 w-8 text-green-600' />
            </div>
            <div className='ml-4'>
              <p className='text-sm font-medium text-gray-600'>완료</p>
              <p className='text-2xl font-bold text-gray-900'>11</p>
            </div>
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div className='card'>
        <div className='flex items-center space-x-4'>
          <div className='flex-1'>
            <input type='text' placeholder='학생명, 제목으로 검색...' className='input' />
          </div>
          <select className='input w-32'>
            <option value=''>전체 상태</option>
            <option value='pending'>대기</option>
            <option value='in-progress'>처리중</option>
            <option value='completed'>완료</option>
          </select>
          <select className='input w-32'>
            <option value=''>전체 우선순위</option>
            <option value='high'>긴급</option>
            <option value='medium'>보통</option>
            <option value='low'>낮음</option>
          </select>
        </div>
      </div>

      {/* 문의 목록 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>문의 목록</h3>
        <div className='space-y-4'>
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className='border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200'
            >
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center space-x-3 mb-2'>
                    <h4 className='font-semibold text-gray-900'>{inquiry.subject}</h4>
                    {getStatusBadge(inquiry.status)}
                    {getPriorityBadge(inquiry.priority)}
                  </div>
                  <p className='text-gray-600 mb-2'>{inquiry.content}</p>
                  <div className='flex items-center space-x-4 text-sm text-gray-500'>
                    <span>
                      {inquiry.student} ({inquiry.room})
                    </span>
                    <span>{inquiry.createdAt}</span>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <button className='btn btn-primary text-sm'>답변하기</button>
                  <button className='btn btn-secondary text-sm'>상세보기</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 실시간 채팅 */}
      <div className='card'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>실시간 채팅</h3>
        <div className='border border-gray-200 rounded-lg h-96 flex flex-col'>
          <div className='flex-1 p-4 overflow-y-auto bg-gray-50'>
            <div className='space-y-3'>
              <div className='flex justify-end'>
                <div className='bg-primary-600 text-white rounded-lg p-3 max-w-xs'>
                  안녕하세요, 세탁기 고장 문의드립니다.
                </div>
              </div>
              <div className='flex justify-start'>
                <div className='bg-white border border-gray-200 rounded-lg p-3 max-w-xs'>
                  안녕하세요. 몇 층 세탁기인지 알려주시면 확인해드리겠습니다.
                </div>
              </div>
              <div className='flex justify-end'>
                <div className='bg-primary-600 text-white rounded-lg p-3 max-w-xs'>
                  3층 세탁기입니다.
                </div>
              </div>
            </div>
          </div>
          <div className='border-t border-gray-200 p-4'>
            <div className='flex space-x-2'>
              <input type='text' placeholder='메시지를 입력하세요...' className='input flex-1' />
              <button className='btn btn-primary'>전송</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InquiryManagement;
