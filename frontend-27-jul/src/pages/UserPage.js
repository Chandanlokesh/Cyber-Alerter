import { useEffect, useState } from "react";
import { getAPI, postAPI } from "../helpers/apiRequests";
import Sidebar from "../components/sidebar";
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';

const UserPage = () => {

  //edited 
  const storedData = localStorage.getItem("userData");

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    getAPI({
      endpoint: "/users/user_profile",
      callback: (response) => {
        if (response.status === 200) {
          console.log("[a] ", response.data.data);
          setUserData(response.data.data);
        } else {
          console.error(response.data.message);
        }
      },
    });
  }, []);


  return (
    <div className="flex h-screen bg-scan-patternn bg-cover bg-center bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">User Profile</h1>
          </div>
          {storedData}
        </div>
      </div>
    </div>
  );
};

export default UserPage;
