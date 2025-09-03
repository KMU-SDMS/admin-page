import {Routes, Route} from 'react-router-dom';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import PackageManagement from '@/pages/PackageManagement';
import RollCall from '@/pages/RollCall';
import InquiryManagement from '@/pages/InquiryManagement';
import NoticeSystem from '@/pages/NoticeSystem';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Dashboard />} />
        <Route path='/package' element={<PackageManagement />} />
        <Route path='/rollcall' element={<RollCall />} />
        <Route path='/inquiry' element={<InquiryManagement />} />
        <Route path='/notice' element={<NoticeSystem />} />
      </Routes>
    </Layout>
  );
}

export default App;
