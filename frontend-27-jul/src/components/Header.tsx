'use client';
import React, { useEffect, useState } from 'react';
import { BellOutlined, UserOutlined } from '@ant-design/icons';
import { Drawer, Badge, notification } from 'antd';
import { io } from 'socket.io-client';
import { getAPI, putAPI } from '../helpers/apiRequests';
import { BASE_URL } from "../data/EndPoints";
import { LogoutOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import { AiFillBell } from 'react-icons/ai';


const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
const socket = io(BASE_URL, {
  auth: {
    token,
  },
});

const Header: React.FC<{ title: string }> = ({ title }) => {
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [userDrawerOpen, setUserDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Connected to WebSocket server');
    });

    socket.on('vulnerability_update', (updates) => {
      setNotifications((prev) => [...updates, ...prev]);
      setHasUnread(true);
      notification.open({
        message: 'New Vulnerability Updates',
        description: `${updates.length} new vulnerabilities detected.`,
        placement: 'bottomRight',
      });
    });

    return () => {
      socket.off('vulnerability_update');
    };
  }, []);

  useEffect(() => {
    if (userDrawerOpen && !userData) {
      getAPI({
        endpoint: '/user/details',
        callback: (res) => {
          console.log("[res.status] ", res.status, "[res]", res)
          if (res.status === 200) {
            setUserData(res.data);
          }
        },
      });
    }
  }, [userDrawerOpen]);

  const renderNotifications = () => (
    <div className="space-y-4 p-4">
      {notifications.map((n, i) => (
        <div
          key={i}
          className="flex items-start bg-[#E6F4FF] border-l-4 border-[#91CAFF] rounded-md p-4 shadow-sm"
        >
          <AiFillBell size={18} className="text-[#0161C1] mt-0.5 mr-3" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {n.vendor.toUpperCase()} — <span className="font-normal text-gray-800">{n.product}</span>
                </h4>
                <p className="text-sm text-gray-700">
                  {n.newCount} new vulnerabilities detected.
                </p>
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );


  const handleUpgrade = () => {
    putAPI({
      endpoint: '/user/upgrade-role',
      params: {},
      callback: ({ status, data }) => {
        if (status === 200 && data.role === 'pro') {
          notification.success({
            message: 'Upgraded Successfully',
            description: 'You are now a Pro user! 🎉',
            placement: 'bottomRight',
          });
          setUserData((prev) => ({ ...prev, role: 'pro' }));
        } else {
          notification.error({
            message: 'Upgrade Failed',
            description: data.message || 'Something went wrong.',
          });
        }
      },
    });

  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Confirm Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: () => {
        localStorage.removeItem('token');
        notification.success({
          message: 'Logged out',
          description: 'You have been logged out successfully.',
          placement: 'bottomRight',
        });
        window.location.href = '/';
      },
    });
  };


  return (
    <>
      <div className="bg-white text-black py-4 px-6 drop-shadow fixed top-0 right-0 z-40 ml-16 w-[calc(100%-4rem)] flex justify-between items-center">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-6">
          <Badge dot={hasUnread} offset={[-4, 4]}>
            <BellOutlined
              className="text-xl cursor-pointer hover:text-blue-500"
              onClick={() => {
                setNotifDrawerOpen(true);
                setHasUnread(false); // clear dot
              }}
            />
          </Badge>
          <UserOutlined
            className="text-xl cursor-pointer hover:text-blue-500"
            onClick={() => setUserDrawerOpen(true)}
          />
          <LogoutOutlined
            className="text-xl cursor-pointer hover:text-red-500"
            onClick={handleLogout}
            title="Logout"
          />
        </div>
      </div>

      {/* Notification Drawer */}
      <Drawer
        title=" Vulnerability Notifications"
        placement="right"
        onClose={() => setNotifDrawerOpen(false)}
        open={notifDrawerOpen}
        width={400}
      >
        {notifications.length > 0 ? (
          renderNotifications()
        ) : (
          <p className="text-gray-500">No notifications yet.</p>
        )}
      </Drawer>

      {/* User Profile Drawer */}
      <Drawer
        title=" User Profile"
        placement="right"
        onClose={() => setUserDrawerOpen(false)}
        open={userDrawerOpen}
        width={360}
      >
        {userData ? (
          <div className="space-y-5">
            <div className="space-y-2 text-sm">
              <div><span className="font-semibold text-gray-700">Email:</span> {userData.email}</div>
              <div><span className="font-semibold text-gray-700">Role:</span> <span className={`inline-block px-2 py-1 rounded-full text-white text-xs ${userData.role === 'pro' ? 'bg-green-500' : 'bg-yellow-500'}`}>{userData.role.toUpperCase()}</span></div>
              <div><span className="font-semibold text-gray-700">Created At:</span> {new Date(userData.createdAt).toLocaleDateString()}</div>
              <div><span className="font-semibold text-gray-700">Monitored Products:</span> {userData.products.length}</div>
            </div>

            {userData.role === 'normal' && (
              <div className="pt-6 border-t mt-4">
                <h3 className="text-md font-semibold mb-2">🚀 Unlock Pro Features</h3>
                <p className="text-sm text-gray-500 mb-4">Upgrade to Pro for extended product limits, real-time monitoring, and advanced analytics.</p>
                <button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg hover:opacity-90 transition"
                >
                  Upgrade to Pro
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Loading...</p>
        )}
      </Drawer>

    </>
  );
};

export default Header;
