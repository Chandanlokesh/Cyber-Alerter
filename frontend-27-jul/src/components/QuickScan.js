import React, { useState } from "react";
import { postAPI } from "../helpers/apiRequests";
import Cookies from 'js-cookie';
import Loader from "./design/loader";
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

  const sendEmail = () => {
    postAPI({
      endpoint: "/quickscan/send-email",
      params: {
        userId: Cookies.get("userId"),
        scanId: scanId
      },
      callback: (response) => {
        if (response.status === 200) {
          alert("Email sent successfully");
        } else {
          setError(response.data.message || "Email send failed");
        }
      },
    });
  };

  return (
<div className="mt-4 grid grid-cols-3 gap-8">
      {/* Left side - Form */}
  <div className="col-span-1">
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
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      {/* Right side - Card View */}
<div className="p-4 border rounded-md bg-gray-50 col-span-2">
      {isLoading ? (
  <div className="flex justify-center items-center h-60">
    <Loader />
  </div>
) : jsonData ? (
  <>
    {/* <button
      className="p-2 border-2 border-blue-800 hover:bg-blue-200 text-blue-800 mb-4"
      onClick={sendEmail}
    >
      Send Email
    </button> */}
    <h2 className="text-lg font-semibold mb-4">Scan Results</h2>
    <div className="space-y-4 max-h-[55vh] overflow-y-auto">
      {jsonData.map((item, idx) => {
        const severity = item.baseSeverity || 'NA';
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
            <div className="mb-3 px-2 text-sm leading-[21px] tracking-[1%] font-normal text-gray-700">
              <p><strong>Description:</strong> {item.vulnerabilityDescription}</p>
              <p><strong>Severity:</strong> {item.baseSeverity || 'N/A'}</p>
              <p><strong>Score:</strong> {item.baseScore || 'N/A'}</p>
              <p><strong>Status:</strong> {item.vulnStatus || 'N/A'}</p>
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

export default QuickScan;
