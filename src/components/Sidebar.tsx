import React from 'react';
import {NavLink} from 'react-router-dom';
import {Home, Package, Users, MessageSquare, Megaphone} from 'lucide-react';

const navigation = [
  {name: '대시보드', href: '/', icon: Home},
  {name: '택배 관리', href: '/package', icon: Package},
  {name: '점호 관리', href: '/rollcall', icon: Users},
  {name: '문의 관리', href: '/inquiry', icon: MessageSquare},
  {name: '공지 발송', href: '/notice', icon: Megaphone},
];

const Sidebar: React.FC = () => {
  return (
    <div className='w-64 bg-white shadow-sm border-r border-gray-200'>
      <div className='p-6'>
        <h1 className='text-xl font-bold text-gray-900'>기숙사 관리 시스템</h1>
      </div>
      <nav className='mt-6'>
        <div className='px-3 space-y-1'>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({isActive}) =>
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-lg ' +
                  `transition-colors duration-200 ${
                    isActive ?
                      'bg-primary-100 text-primary-700' :
                      'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className='mr-3 h-5 w-5' />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
