import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header.tsx";
import MonitorScan from "../components/MonitorScan";
import { postAPI } from "../helpers/apiRequests";
import Cookies from 'js-cookie';
import Loader from "../components/design/loader";
import axios from "axios";
import { BASE_URL } from "../data/EndPoints.js";
import { message } from 'antd';
import { DownloadOutlined, MailOutlined } from '@ant-design/icons';

const QuickScanPage = () => {
  return (
<div className="flex h-screen bg-cover bg-center bg-scan-patternn">
  <Sidebar />
  <div className="flex-1 ml-16 flex flex-col">
    <Header title="Quick Scan" />
     <div className="flex-1 overflow-y-auto mt-20 px-8 py-1">
          <div className="bg-white shadow rounded-xl p-6 min-h-[calc(100vh-100px)]">
            <QuickScan />
          </div>
        </div>
  </div>
</div>

  );
};

export default QuickScanPage;

const severityColors = {
  Critical: { border: '#B91C1C', bg: '#FEE2E2', text: '#B91C1C' },
  High:     { border: '#DC2626', bg: '#FECACA', text: '#B91C1C' },
  Medium:   { border: '#D97706', bg: '#FEF3C7', text: '#92400E' },
  Low:      { border: '#2563EB', bg: '#DBEAFE', text: '#1E40AF' },
  None:     { border: '#6B7280', bg: '#E5E7EB', text: '#374151' },
  NA:       { border: '#6B7280', bg: '#E5E7EB', text: '#374151' },
};

const QuickScan = () => {
  const [productName, setProductName] = useState("apache");
  const [productVersion, setProductVersion] = useState("2.4.41");
  const [jsonData, setJsonData] = useState(null);
  const [error, setError] = useState("");
  const [scanId, setScanId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const [isEmailing, setIsEmailing] = useState(false);
const [isDownloading, setIsDownloading] = useState(false);

  const sendScan = () => {
    if (!productName) {
      setError("Product Name is required");
      return;
    }
    setError("");
    setIsLoading(true);

    postAPI({
      endpoint: "/api/scan/quick",
      params: {
        productName,
        productVersion: productVersion || null,
      },
      callback: (response) => {
        setIsLoading(false);
        if (response.status === 200) {
          setJsonData(response.data.results);
          setScanId(response.data._id);
        } else {
          setError(response.data.message || "Scan failed");
        }
      },
    });
  };


const handleDownloadPDF = async () => {
  setIsDownloading(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${BASE_URL}/api/scan/quick-scan/${scanId}/download-pdf`,
      {},
      {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.status === 200) {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'QuickScan_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('PDF downloaded successfully');
    } else {
      message.error('PDF download failed');
    }
  } catch (error) {
    console.error("PDF download failed", error);
    message.error("PDF download failed");
  } finally {
    setIsDownloading(false);
  }
};

const handleEmailPDF = async () => {
  setIsEmailing(true);
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `${BASE_URL}/api/scan/quick-scan/${scanId}/email-pdf`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.status === 200) {
      message.success('Email sent successfully');
    } else {
      message.error('Failed to send email');
    }
  } catch (error) {
    console.error("PDF email failed", error);
    message.error("PDF email failed");
  } finally {
    setIsEmailing(false);
  }
};

return (
  <div className="mt-4 flex gap-8 h-[calc(100vh-12rem)]">
    {/* Left side - Form */}
    <div className="w-1/3 flex flex-col ">
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter Product Name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">
            Product Version (optional)
          </label>
          <input
            type="text"
            value={productVersion}
            onChange={(e) => setProductVersion(e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Enter Product Version"
          />
        </div>
      </form>
      <div className="mt-4">
        <button
          type="button"
          className="bg-blue-500 text-white py-2 px-6 rounded-lg"
          onClick={sendScan}
        >
          Scan
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>

    {/* Right side - Card View */}
    <div className="w-2/3 flex flex-col border rounded-md bg-gray-50 p-4 overflow-y-auto min-h-0">
      {isLoading ? (
        <div className="flex justify-center items-center flex-grow">
          <Loader />
        </div>
      ) : jsonData ? (
        <>
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold text-gray-800">Scan Results</h2>
<div className="flex gap-2">
  <button
    onClick={handleDownloadPDF}
    disabled={isDownloading}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition ${
      isDownloading ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-blue-600'
    } text-white`}
  >
    <DownloadOutlined />
    <span className="hidden sm:inline">
      {isDownloading ? 'Downloading...' : 'Download'}
    </span>
  </button>

  <button
    onClick={handleEmailPDF}
    disabled={isEmailing}
    className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition ${
      isEmailing ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#3B82F6] hover:bg-blue-600'
    } text-white`}
  >
    <MailOutlined />
    <span className="hidden sm:inline">
      {isEmailing ? 'Sending...' : 'Email'}
    </span>
  </button>
</div>

</div>


          <div className="space-y-4 overflow-y-auto">
            {jsonData.map((item, idx) => {
              const severity = item.base_Severity || 'NA';
              const colors = severityColors[severity] || severityColors['NA'];
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
                    {item.cve_id || 'Unknown CVE'}
                  </div>
                  <div className="mb-3 px-2 text-sm  font-normal text-gray-700">
                    <p><strong>Description:</strong> {item.vulnerability_description}</p>
                    <p><strong>Severity:</strong> {item.base_Severity || 'N/A'}</p>
                    <p><strong>Score:</strong> {item.base_Score || 'N/A'}</p>
                    <p><strong>Status:</strong> {item.vulnarability_Status || 'N/A'}</p>
                    <p><strong>Published:</strong> {item.published_date || 'N/A'}</p>
                    <p><strong>Modified:</strong> {item.last_modified || 'N/A'}</p>
                    <p><strong>OEM Link:</strong> <a className="text-blue-600 underline" href={item.oemUrl} target="_blank" rel="noopener noreferrer">View</a></p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="text-gray-600">No scan data available.</p>
      )}
    </div>
  </div>
);

};

