'use client';
import { Skeleton } from 'antd';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { putAPI, getAPI } from '../helpers/apiRequests';
import { BASE_URL } from '../data/EndPoints';
import { io } from 'socket.io-client';
import { message, notification, Statistic } from 'antd'; 
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {BarChartOutlined} from '@ant-design/icons' ;
import { IoOpenOutline } from "react-icons/io5";

import { Link } from 'react-router-dom'; // Assuming you're using React Router

const { Timer } = Statistic;

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
ChartJS.register(ChartDataLabels);

const PreviewComponent = ({ dashboardData }) => {
  const [showSubscribe, setShowSubscribe] = useState(false);
  const { user_email, stats, monitorChartData, quickChartData } = dashboardData;
  const [nextRunTime, setNextRunTime] = useState(null);
  const [cronActive, setCronActive] = useState(false);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const socket = io(BASE_URL, {
    auth: { token },
  });
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    if (stats && stats?.role === 'normal') {
      setShowSubscribe(true);
    }
  }, [dashboardData, stats]);

  useEffect(() => {
    if (!dashboardData) return;
    socket.on('user_role_updated', () => {
      setShowSubscribe(false);
    });
    socket.on('cron-next-run', (data) => {
      if (data?.nextRunTime) {
        setCronActive(false)
        setNextRunTime(new Date(data.nextRunTime));
      }
      console.log("[cron] ", data);
    });
    socket.on('cron-active', () => {
      setCronActive(true);
    });
    return () => {
      socket.off('user_role_updated');
      socket.off('cron-next-run');
    };
  }, [dashboardData]);

  useEffect(() => {
    getAPI({
      endpoint: '/api/cron-next-run',
      callback: ({ status, data }) => {
        if (status === 200 && data?.nextRunTime) {
          setNextRunTime(new Date(data.nextRunTime));
        }
      },
    });
  }, []);

  if (!dashboardData) return <div>Loading...</div>;

  const handleUpgrade = () => {
    if (!dashboardData) return;
    setIsUpgrading(true);
    putAPI({
      endpoint: '/user/upgrade-role',
      params: {},
      callback: ({ status, data }) => {
        setIsUpgrading(false);
        if (status === 200 && data.role === 'pro') {
          notification.success({
            message: 'Upgraded Successfully',
            description: 'You are now a Pro user! 🎉',
            placement: 'bottomRight',
          });
          setShowSubscribe(false);
        } else {
          notification.error({
            message: 'Upgrade Failed',
            description: data?.message || 'Something went wrong.',
          });
        }
      },
    });
  };


  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-normal font-bold text-[#55718E]">Welcome, {user_email}</h2>

      {/* Stats Card Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard2
          value={stats.quickScanCount}
          limit={stats.quickScanLimit}
          title="Quick Scans"
          subtitle="On-demand scans you’ve performed today."
        />
        <StatCard2
          value={stats.productCount}
          limit={stats.productLimit}
          title="Products"
          subtitle="Packages, software, or tools under active watch."
        />
        <StatCard2
          value={stats.totalVulnerabilities}
          title="Total Issues"
          subtitle="Detected across your monitored products."
        />
        <StatCard2
          value={showSubscribe ? stats.role : "Pro"}
          title="Plan"
          subtitle="Your current subscription plan."
          showButton={showSubscribe}
          buttonText="Upgrade to Pro"
          isLoading={isUpgrading}
          onButtonClick={handleUpgrade}
        />
        <StatCard2
          value={
            nextRunTime ? cronActive ? (<>Currently active</>): (
              <Timer
                type="countdown"
                key={nextRunTime?.getTime()}
                value={nextRunTime?.getTime()}
                format="HH:mm:ss"
                onFinish={() => console.log('⏰ Countdown finished!')}
                valueStyle={{ fontSize: 20, color: '#92C8FF' }}
              />
            ) : (
              '--'
            )
          }
          title="Next Monitor Scan"
          subtitle="Scheduled vulnerability scan countdown."
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="bg-white shadow-subtle rounded-lg p-3 overflow-x-auto">
<div className="flex items-center justify-between mb-2">
      <h3 className="text-lg font-bold text-[#55718E]">Vulnerabilities by Product</h3>
      <Link to="/Monitorscan" className="flex items-center text-xs text-[#92C8FF] hover:underline">
        View Monitored Products <IoOpenOutline className="ml-1" />
      </Link>
    </div>  <div
    style={{
      minWidth: `${monitorChartData.labels.length * 80}px`, // 80px per label
      height: '300px',
    }}
  >
    <Bar
      data={{
        labels: monitorChartData.labels,
        datasets: monitorChartData.datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: false },
           datalabels: {
      display: false
    }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        },
      }}
    />
  </div>
</div>
        <div className="bg-white shadow-subtle rounded-lg p-3 overflow-x-auto">
<div className="flex items-center align-center justify-between mb-2">
      <h3 className="text-lg font-bold text-[#55718E]">Quick Scans - Vulnerability Breakdown</h3>
      <Link to="/Quickscan" className="flex items-center text-xs text-[#92C8FF] hover:underline">
        New Quick Scan <IoOpenOutline className="ml-1" />
      </Link>
    </div>  <div
    style={{
      minWidth: `${quickChartData.labels.length * 80}px`,
      height: '300px',
    }}
  >
    <Bar
      data={{
        labels: quickChartData.labels,
        datasets: quickChartData.datasets,
      }}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          title: { display: false },
            datalabels: {
    display: (ctx) => {
      return ctx.dataset?.data?.[ctx.dataIndex] !== undefined;
    },
    anchor: 'end',
    align: 'top',
    color: '#333',
    formatter: (value) => (typeof value === 'number' ? value : ''),
  }
        },
        scales: {
          x: {
            ticks: {
              autoSkip: false,
              maxRotation: 0,
              minRotation: 0,
            },
          },
        },
      }}
      plugins={[ChartDataLabels]}
    />
  </div>
</div>

      </div>
    </div>
  );
};

export default PreviewComponent;

const StatCard2 = ({
  value,
  title,
  subtitle,
  limit=null,
  showButton = false,
  isLoading = false,
  onButtonClick,
  disabled = false,
}) => (
  <div className="bg-white shadow-subtle rounded-lg p-5 flex flex-col justify-between h-full">
    <div>
      <div className="text-[28px] font-bold text-[#92C8FF]">
        {typeof value === 'string' || typeof value === 'number' ? <>{value}{limit&& <span className='text-sm'>/{limit}</span>}</> : <>{value}</>}
      </div>
      <div className="flex items-center mt-1">
        <div className="text-[18px] font-semibold text-[#55718E]">{title}</div>
        {showButton && (
          <button
            onClick={onButtonClick}
            disabled={disabled || isLoading}
            className={`ml-2 text-xs font-semibold py-1 px-3 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 transition ${
              disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? '...' : 'Get Pro Now'}
          </button>
        )}
      </div>
      <div className="text-[14px] text-[#828080] mt-0.5">{subtitle}</div>
    </div>
  </div>
);


const PreviewComponentSkeleton = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* Welcome Text */}
      <Skeleton.Input active size="default" style={{ width: 240, height: 32 }} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white shadow-subtle rounded-lg p-5 h-full flex flex-col justify-between"
          >
            <Skeleton.Input active size="large" style={{ width: 80, height: 28 }} />
            <Skeleton.Input active size="small" style={{ width: 100, marginTop: 8 }} />
            <Skeleton.Input active size="small" style={{ width: 120, marginTop: 4 }} />
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((chart) => (
          <div
  key={chart}
  className="bg-white shadow-subtle rounded-lg p-4 flex flex-col"
  style={{ height: 360 }}
>
  {/* Title Skeleton */}
  <Skeleton.Input
    active
    size="default"
    style={{ width: 280, height: 24, marginBottom: 16 }}
  />

  {/* Centered Icon Node in remaining space */}
  <div className="flex-1 flex items-center justify-center border border-dashed rounded-md bg-[#f5f5f5]">
    <Skeleton.Node active>
      <BarChartOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />
    </Skeleton.Node>
  </div>
</div>
        ))}
      </div>
    </div>
  );
};

export {PreviewComponentSkeleton};
