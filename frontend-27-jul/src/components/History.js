import React, { useState, useEffect } from 'react';
import { Empty } from 'antd';
import { Tabs } from 'antd';
import { Dropdown, Menu, Modal, message } from 'antd';
import { MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { BASE_URL } from '../data/EndPoints';

const getSeverityColors = (severity) => {
  switch (severity?.toLowerCase()) {
    case 'critical': return { border: '#b91c1c', bg: '#fee2e2', text: '#b91c1c' };
    case 'high': return { border: '#ef4444', bg: '#fee2e2', text: '#b91c1c' };
    case 'medium': return { border: '#f59e0b', bg: '#fef3c7', text: '#92400e' };
    case 'low': return { border: '#3b82f6', bg: '#dbeafe', text: '#1e40af' };
    default: return { border: '#9ca3af', bg: '#f3f4f6', text: '#374151' }; // gray
  }
};

const HistoryComponent = ({ quickHistory = [], monitorHistory = [], type=null , fetchQuickHistory, fetchDashboardData}) => {
  const [activeOption, setActiveOption] = useState('monitorScan');
  const [selectedScanId, setSelectedScanId] = useState(null);
const { TabPane } = Tabs;

  useEffect(() => {
    if (activeOption === 'monitorScan') {
      setSelectedScanId(monitorHistory[0]?.product || null);
    } else {
      setSelectedScanId(quickHistory[0]?.scanId || null);
    }
  }, [activeOption, monitorHistory, quickHistory]);

  const activeData = activeOption === 'monitorScan' ? monitorHistory : quickHistory;
  const selectedData = activeData.find(entry => {
    return activeOption === 'monitorScan'
      ? entry.product === selectedScanId
      : entry.scanId === selectedScanId;
  });
  const handleDeleteQuickScan = async (scanId) => {
  Modal.confirm({
    title: 'Delete Quick Scan?',
    content: 'This will permanently remove the scan result.',
    okText: 'Delete',
    okType: 'danger',
    cancelText: 'Cancel',
    async onOk() {
      try {
        const token = localStorage.getItem('token'); // or wherever you store it
        await axios.delete(`${BASE_URL}/api/scan/quick/${scanId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('Quick scan deleted successfully');
        fetchQuickHistory();
      } catch (err) {
        console.error(err);
        message.error('Failed to delete quick scan');
      }
    },
  });
};


  return (
    <div className="">
      <div>
        <h3 id="history" className="cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
        {!type &&   <b>History</b>}
        </h3>
      </div>

<Tabs
  defaultActiveKey="monitorScan"
  onChange={(key) => setActiveOption(key)} // setActiveOption updates context
  className=""
  tabBarGutter={40}
>
    <TabPane tab="Monitor Scan" key="monitorScan" />
  <TabPane tab="Quick Scan" key="quickScan" />
</Tabs>

      {/* Main Content */}
      <div className="flex border rounded-lg shadow-sm overflow-hidden h-[500px] bg-gradient-to-br from-blue-500 via-blue-800 to-blue-900 ">
        {/* Left Side - Product/Scan List */}
    <div className="w-1/4 overflow-y-auto   py-4">
  <h4 className="text-base font-semibold mb-3 text-white px-4">{
    activeOption === 'monitorScan' ? 'Monitored Products' : 'Scanned Products'
  }</h4>
  <ul className="">
    {activeData.map((entry, index) => {
      const key = activeOption === 'monitorScan' ? entry.product : entry.scanId;
      const label = activeOption === 'monitorScan' ? entry.product : `${entry.product}`;
      return (
  <li
    key={key}
    className={`group relative flex items-center justify-between px-3 py-4 text-sm font-medium transition-all cursor-pointer
      ${
        selectedScanId === key
          ? 'text-white border-blue-300 shadow-[...] bg-white/10 backdrop-blur-sm'
          : 'text-white shadow-sm'
      }`}
      onClick={() => setSelectedScanId(key)}
  >
    <span  className="flex-1 truncate">
      {label}
    </span>

    {/* Only for QuickScan */}
    {activeOption === 'quickScan' && (
      <Dropdown
        trigger={['click']}
        overlay={
          <Menu>
            <Menu.Item
              key="delete"
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteQuickScan(key)}
            >
              Delete
            </Menu.Item>
          </Menu>
        }
      >
        <MoreOutlined className="text-white ml-2 cursor-pointer opacity-100 font-bold group-hover:opacity-100" />
      </Dropdown>
    )}
  </li>
);

    })}
  </ul>
</div>


        {/* Right Side - Vulnerability Cards */}
        <div className="w-3/4 p-4 overflow-y-auto my-3 mr-2 bg-white rounded-lg border">
          {selectedData && selectedData.data.length > 0 ? (
            <div className="space-y-4">
              {selectedData.data.map((item, idx) => {
                const severity = item.baseSeverity || item.base_Severity || item.severity || 'unknown';
                const colors = getSeverityColors(severity);
                const displayKey = item.cve_id || item.cve || item.advisoryId || 'Unknown CVE';

                const details = Object.entries(item)
                  .filter(([key]) => key !== 'product' && key !== '_id') // Ignore only '_id'
                  .map(([key, val]) => {
                    const formattedKey = key
                      .split('_')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ');

                    return (
                      <p key={key} className="mb-1">
                        <strong>{formattedKey}:</strong> {Array.isArray(val) ? val.join(', ') : val || 'N/A'}
                      </p>
                    );
                  });

                return (
                  <div
                    key={idx}
                    className="rounded-lg border"
                    style={{ borderColor: colors.border }}
                  >
                    <div
                      className="mb-2 p-2 rounded-t-[8px] font-medium text-base tracking-[1%]"
                      style={{ backgroundColor: colors.bg, color: colors.text }}
                    >
                      {displayKey}
                    </div>
                    <div className="mb-3 px-2 text-sm leading-[21px] tracking-[1%] font-normal text-gray-700">
                      {details}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Empty description="No scan data found" />
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryComponent;
