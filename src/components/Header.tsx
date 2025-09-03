import React from 'react';
import {Bell, User} from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className='bg-white shadow-sm border-b border-gray-200'>
      <div className='px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>관리자 대시보드</h2>
            <p className='text-sm text-gray-500'>기숙사 관리 시스템</p>
          </div>
          <div className='flex items-center space-x-4'>
            <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200'>
              <Bell className='h-5 w-5' />
            </button>
            <div className='flex items-center space-x-2'>
              <div className='w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center'>
                <User className='h-4 w-4 text-primary-600' />
              </div>
              <span className='text-sm font-medium text-gray-700'>관리자</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
