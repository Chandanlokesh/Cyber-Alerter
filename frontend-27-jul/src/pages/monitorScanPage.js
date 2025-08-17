// import React, { useState, useEffect } from "react";
// import Sidebar from "../components/sidebar";
// import Header from "../components/Header.tsx";
// import QuickScan from "../components/QuickScan";
// import HistoryComponent from '../components/History';
// import { getAPI ,postAPI} from '../helpers/apiRequests';
// import { Select, Input, Button, Divider, message } from 'antd';
// import Cookies from 'js-cookie';

// const MonitoPage = () => {
//   return (
//     <div className="flex h-screen bg-cover bg-center bg-scan-patternn">
//       {/* Sidebar on the left */}
//       <Sidebar />
//       {/* Main content on the right */}

//   {/* Main Content */}
//       <div className="flex-1 ml-16 flex flex-col">
//         <Header title="Dashboard" />
//       <div className="w-full pt-2 justify-center flex mt-10 ">
//     <div className="p-3 overflow-auto form-abc w-[90%] ml-16 ">
//       <div className="bg-white rounded-lg p-6  border-2">
//      <MonitorScanComponent />
//       </div>
//       </div>
//     </div>
//   </div>
// </div>

//   );
// };

// export default MonitoPage;


// const vendorOptions = [
//   { label: 'Microsoft', value: 'msrc' },
//   { label: 'Cisco', value: 'cisco' },
//   { label: 'Debian', value: 'debian' },
// ];

// const MonitorScanComponent = () => {
//   const [productInputs, setProductInputs] = useState([{ vendor: '', productName: '' }]);
//   const [existingProducts, setExistingProducts] = useState([]);
//   const [counts, setCounts] = useState({ addedCount: 0, remaining: 0, maxAllowed: 0 });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchUserProducts();
//   }, []);

//   const fetchUserProducts = () => {
//     getAPI({
//       endpoint: '/user/view-products',
//       callback: (res) => {
//         if (res.status === 200) {
//           setExistingProducts(res.data.products);
//           setCounts({
//             addedCount: res.data.addedCount,
//             remaining: res.data.remaining,
//             maxAllowed: res.data.maxAllowed,
//           });
//         }
//       },
//     });
//   };

//   const handleChange = (index, field, value) => {
//     const updatedInputs = [...productInputs];
//     updatedInputs[index][field] = value;
//     setProductInputs(updatedInputs);
//   };

//   const addInput = () => {
//     setProductInputs([...productInputs, { vendor: '', productName: '' }]);
//   };

//   const submitProducts = () => {
//     const remainingSlots = counts.remaining;
//     const toAdd = productInputs.filter(p => p.vendor && p.productName);

//     if (toAdd.length > remainingSlots) {
//       message.error(`You can only add ${remainingSlots} more product(s).`);
//       return;
//     }

//     setLoading(true);


//     postAPI({
//       endpoint: '/user/add-products',
//       params: { products: toAdd },
//       callback: (res) => {
//         if (res.status === 200) {
//           message.success(res.data.message);
//           fetchUserProducts();
//           setProductInputs([{ vendor: '', productName: '' }]);
//         } else {
//           message.error(res.data.message);
//         }
//         setLoading(false);
//       }
//     });
// };

//   return (
//     <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
//       {/* Left - Existing Products */}
//       <div className="p-4 border rounded-md bg-gray-50">
//         <h2 className="text-lg font-semibold mb-2">Your Monitored Products</h2>
//         <p className="text-sm text-gray-600 mb-2">{counts.addedCount} of {counts.maxAllowed} products being monitored</p>
//         <ul className="list-disc ml-5 text-sm">
//           {existingProducts.map((item, i) => (
//             <li key={i}>{item.vendor.toUpperCase()} - {item.productName}</li>
//           ))}
//         </ul>
//       </div>

//       {/* Right - Add Products */}
//       <div className="p-4 border rounded-md bg-white">
//         <h2 className="text-lg font-semibold mb-4">Add New Products</h2>
//         {productInputs.map((input, idx) => (
//           <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
//             <Select
//               options={vendorOptions}
//               value={input.vendor}
//               onChange={(val) => handleChange(idx, 'vendor', val)}
//               placeholder="Select Vendor"
//               className="w-full"
//             />
//             <Input
//               value={input.productName}
//               onChange={(e) => handleChange(idx, 'productName', e.target.value)}
//               placeholder="Enter Product Name"
//             />
//           </div>
//         ))}
//         <Button onClick={addInput} className="mb-4">+ Add More</Button>
//         <Divider />
//         <Button 
//           type="primary" 
//           loading={loading} 
//           onClick={submitProducts} 
//           disabled={counts.remaining === 0}
//         >
//           Submit Products
//         </Button>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Header from "../components/Header.tsx";
import { getAPI, postAPI , deleteAPI} from '../helpers/apiRequests';
import { Select, Input, Button, Divider, Table, message } from 'antd';

const vendorOptions = [
  { label: 'Microsoft', value: 'msrc' },
  { label: 'Cisco', value: 'cisco' },
  { label: 'Debian', value: 'debian' },
];

const MonitoPage = () => {
  return (
    <div className="flex h-screen bg-cover bg-center bg-scan-patternn">
      <Sidebar />
      <div className="flex-1 ml-16 flex flex-col">
        <Header title="Monitor Scan" />
        
        <div className="flex-1 overflow-y-auto mt-20 px-8 py-1">
          <div className="bg-white shadow rounded-xl p-6 min-h-[calc(100vh-100px)]">
            <MonitorScanComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoPage;

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
    const toAdd = productInputs.filter(p => p.vendor && p.productName);
    const remainingSlots = counts.remaining;

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



const deleteProduct = (record) => {
  deleteAPI({
    endpoint: '/user/delete-product',
    params: {
      vendor: record.vendor,
      productName: record.productName,
    },
    callback: (res) => {
      if (res.status === 200) {
        message.success(res.data.message);
        fetchUserProducts();
      } else {
        message.error(res.data.message || 'Failed to delete product');
      }
    },
  });
};


  const columns = [
    {
      title: 'Vendor',
      dataIndex: 'vendor',
      key: 'vendor',
      render: (text) => <span className="font-medium">{text.toUpperCase()}</span>
    },
    {
      title: 'Product Name',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button danger size="small" onClick={() => deleteProduct(record)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
       {/* Add Product Form */}
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Add New Products</h2>

        {productInputs.map((input, idx) => (
          <div key={idx} className="flex gap-4 mb-3">
            <Select
              options={vendorOptions}
              value={input.vendor}
              onChange={(val) => handleChange(idx, 'vendor', val)}
              placeholder="Select Vendor"
              className="w-1/2"
            />
            <Input
              value={input.productName}
              onChange={(e) => handleChange(idx, 'productName', e.target.value)}
              placeholder="Enter Product Name"
              className="w-1/2"
            />
          </div>
        ))}

        <div className="flex gap-3 items-center mb-3">
          <Button onClick={addInput}>+ Add More</Button>
          <span className="text-sm text-gray-500">Remaining: {counts.remaining}</span>
        </div>

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
      {/* Monitored Table */}
      <div className="flex flex-col">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Your Monitored Products</h2>
          <p className="text-sm text-gray-500">
            {counts.addedCount} of {counts.maxAllowed} products being monitored
          </p>
        </div>
        <Table
          dataSource={existingProducts}
          columns={columns}
          rowKey={(record) => `${record.vendor}-${record.productName}`}
          pagination={false}
          className="rounded-lg shadow"
        />
      </div>

     
    </div>
  );
};

