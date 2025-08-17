import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar';
import Header from '../components/Header.tsx';
import PreviewComponent,{PreviewComponentSkeleton} from '../components/DashboardPage';
import HistoryComponent from '../components/History';
import { getAPI } from '../helpers/apiRequests';
import { io } from 'socket.io-client';
import { BASE_URL } from "../data/EndPoints";


const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const socket = io(BASE_URL, {
  auth: {
    token,
  },
});
const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [quickHistoryData, setQuickHistoryData] = useState([]);
  const [monitorHistoryData, setMonitorHistoryData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchQuickHistory();
    fetchMonitorHistory();
  }, []);

  const fetchDashboardData = () => {
    getAPI({
      endpoint: '/dashboard',
      callback: (response) => {
        if (response.status === 200) {
          setDashboardData(response.data);
        } else {
          console.error(response.data.message);
        }
      }
    });
  };

  const fetchQuickHistory = () => {
    getAPI({
      endpoint: '/api/quickhistory',
      callback: (response) => {
        if (response.status === 200) {
          setQuickHistoryData(response.data);
        } else {
          console.error(response.data.message);
        }
      }
    });
  };

  const fetchMonitorHistory = () => {
    getAPI({
      endpoint: '/api/monitorhistory',
      callback: (response) => {
        if (response.status === 200) {
          setMonitorHistoryData(response.data);
        } else {
          console.error(response.data.message);
        }
      }
    });
  };
  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('vulnerability_update', (updates) => {
    fetchDashboardData();
    fetchMonitorHistory();
    });

    return () => {
      socket.off('vulnerability_update');
    };
  }, []);
  return (
    <div className="flex h-screen">
      {/* Sidebar on the left */}
      <Sidebar />

      {/* Main content on the right */}
      <div className="flex-1 ml-16 flex flex-col">
        {/* Header at the top */}
        <Header title="Dashboard" />

        {/* Main Content */}
        <div className="flex-1 mt-10 p-6 overflow-auto bg-[F5F7FA]">
          {/* Preview Section */}
          <div className="mt-8">
          {dashboardData ?  <PreviewComponent dashboardData={dashboardData} />:<PreviewComponentSkeleton/>}
          </div>

          {/* History Section */}
          <div className="mt-8">
            <HistoryComponent quickHistory={quickHistoryData} monitorHistory={monitorHistoryData} fetchQuickHistory={fetchQuickHistory} fetchDashboardData={fetchDashboardData}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
