import React, { useState,useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation for route checking
import Dashboard from '../images/dashboard.svg';
import Scanner from '../images/iscanner.svg';
import Report from '../images/report.svg';
import user from '../images/user-blue.svg';
import logo from '../images/logo.png';
import { AiOutlineFileSync } from "react-icons/ai";
import { AiOutlineSecurityScan } from "react-icons/ai";
import { LuLayoutDashboard } from "react-icons/lu";
import { getAPI } from "../helpers/apiRequests";

const Sidebar = () => {
  const [isHovered, setIsHovered] = useState(false);
  const location = useLocation(); // Get the current location (URL)
  const [showText, setShowText] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let timeout;

    if (isHovered) {
      timeout = setTimeout(() => {
        setShowText(true);
      }, 270); // show after 500ms
    } else {
      clearTimeout(timeout);
      setShowText(false); // hide immediately
    }

    return () => clearTimeout(timeout);
  }, [isHovered]);
  const isActive = (path) => location.pathname === path;

  return (
    <div
      className={`fixed top-0 left-0 h-full ${
        isHovered ? 'w-48 shadow-lg' : 'w-16'
      } bg-gray-900 text-white z-50 transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col  h-full pt-6">
        {/* Logo at the top */}
<div className="flex items-center text-left ml-2">
  <img src={logo} alt="Dashboard Icon" className="w-12 h-12" />
  {isHovered && showText && (
    <span className=" text-md tracking-wider leading-tight">
      Cyber<br />Alerter
    </span>
  )}
</div>

        {/* Navigation links */}
        <div className="flex flex-col space-y-8 mt-20">
          <Link
            to="/dashboard"
            className={`text-md py-2 px-3 rounded mx-2 w-auto ${
              isActive('/dashboard') && !isHovered ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
            } transition duration-300 flex items-center`}
          >
<LuLayoutDashboard className='w-6 h-6'/>            {isHovered && showText&& <span className="ml-2">Dashboard</span>}
          </Link> 
          <Link
            to="/Quickscan"
            className={`text-md py-2 px-3 rounded mx-2 w-auto ${
              isActive('/Quickscan') && !isHovered ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
            } transition duration-300 flex items-center`}
          >
<AiOutlineSecurityScan className='w-6 h-6' />             {isHovered && showText && <span className="ml-2">Quick Scanner</span>}
          </Link>
          <Link
            to="/Monitorscan"
            className={`text-md py-2 px-3 rounded mx-2 w-auto ${
              isActive('/Monitorscan') && !isHovered ? 'bg-blue-500 text-white' : 'hover:bg-blue-500 hover:text-white'
            } transition duration-300 flex items-center`}
          >
<AiOutlineFileSync className='w-6 h-6'/>             {isHovered && showText && <span className="ml-2">Monitor Scanner</span>}
          </Link>
        </div>
        {/* User at the bottom */}
      </div>
    </div>
  );
};

export default Sidebar;