import React, { useState, useEffect } from 'react';
import { getAPI, postAPI } from '../helpers/apiRequests';
import { Select, Input, Button, Divider, message } from 'antd';
import Cookies from 'js-cookie';

const vendorOptions = [
  { label: 'Microsoft', value: 'msrc' },
  { label: 'Cisco', value: 'cisco' },
  { label: 'Debian', value: 'debian' },
];

const MonitorScanComponent = () => {
  const [productInputs, setProductInputs] = useState([{ vendor: '', productName: '' }]);
  const [existingProducts, setExistingProducts] = useState([]);
  const [counts, setCounts] = useState({ addedCount: 0, remaining: 0, maxAllowed: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const fetchUserProducts = () => {
    getAPI({
      endpoint: '/user/view-products',
      callback: (res) => {
        if (res.status === 200) {
          setExistingProducts(res.data.products);
          setCounts({
            addedCount: res.data.addedCount,
            remaining: res.data.remaining,
            maxAllowed: res.data.maxAllowed,
          });
        }
      },
    });
  };

  const handleChange = (index, field, value) => {
    const updatedInputs = [...productInputs];
    updatedInputs[index][field] = value;
    setProductInputs(updatedInputs);
  };

  const addInput = () => {
    setProductInputs([...productInputs, { vendor: '', productName: '' }]);
  };

  const submitProducts = () => {
    const remainingSlots = counts.remaining;
    const toAdd = productInputs.filter(p => p.vendor && p.productName);

    if (toAdd.length > remainingSlots) {
      message.error(`You can only add ${remainingSlots} more product(s).`);
      return;
    }

    setLoading(true);


    postAPI({
      endpoint: '/user/add-products',
      params: { products: toAdd },
      callback: (res) => {
        if (res.status === 200) {
          message.success(res.data.message);
          fetchUserProducts();
          setProductInputs([{ vendor: '', productName: '' }]);
        } else {
          message.error(res.data.message);
        }
        setLoading(false);
      }
    });
};

  return (
    <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left - Existing Products */}
      <div className="p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold mb-2">Your Monitored Products</h2>
        <p className="text-sm text-gray-600 mb-2">{counts.addedCount} of {counts.maxAllowed} products being monitored</p>
        <ul className="list-disc ml-5 text-sm">
          {existingProducts.map((item, i) => (
            <li key={i}>{item.vendor.toUpperCase()} - {item.productName}</li>
          ))}
        </ul>
      </div>

      {/* Right - Add Products */}
      <div className="p-4 border rounded-md bg-white">
        <h2 className="text-lg font-semibold mb-4">Add New Products</h2>
        {productInputs.map((input, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
            <Select
              options={vendorOptions}
              value={input.vendor}
              onChange={(val) => handleChange(idx, 'vendor', val)}
              placeholder="Select Vendor"
              className="w-full"
            />
            <Input
              value={input.productName}
              onChange={(e) => handleChange(idx, 'productName', e.target.value)}
              placeholder="Enter Product Name"
            />
          </div>
        ))}
        <Button onClick={addInput} className="mb-4">+ Add More</Button>
        <Divider />
        <Button 
          type="primary" 
          loading={loading} 
          onClick={submitProducts} 
          disabled={counts.remaining === 0}
        >
          Submit Products
        </Button>
      </div>
    </div>
  );
};

export default MonitorScanComponent;
