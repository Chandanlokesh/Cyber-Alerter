import axios from 'axios';
import { BASE_URL } from "../data/EndPoints";
import Cookies from 'js-cookie';
export const postAPI = ({
  endpoint,
  params,
  callback,
  addAuth = true, // Add Authorization by default
}) => {
  const token = localStorage.getItem('token'); // Retrieve token from cookies

  // Dynamically set headers based on addAuth
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...(addAuth && token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if addAuth is true
  };

  axios({ 
    method: 'POST',
    url: `${BASE_URL}${endpoint}`,
    data: params, // For POST, data is sent in the body
    headers: headers, // Use dynamic headers
  })
    .then(function (response) {
      callback(response); // Call the callback function with the response
    })
    .catch((error) => {
      console.error(error.response?.data || error.message); // Handle error as per your logic
    });
};

  export const getAPI = ({
    endpoint,
    params = {}, // Optional params for query strings
    callback,
    addAuth = true, // Add Authorization by default
  }) => {
    const token = localStorage.getItem('token'); // Retrieve token from cookies
  
    // Dynamically set headers based on addAuth
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(addAuth && token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if addAuth is true
    };
  
    axios({
      method: 'GET',
      url: `${BASE_URL}${endpoint}`,
      params: params, // Params are sent as query string in GET requests
      headers: headers, // Use dynamic headers
    })
      .then(function (response) {
        callback(response); // Call the callback function with the response
      })
      .catch((error) => {
        console.error(error.response?.data || error.message); // Handle error as per your logic
      });
  };

export const Upgrade =()=>{

const storedData = localStorage.getItem("userData");

let userData = storedData ? JSON.parse(storedData) : null;

if (userData) {
  userData.subscriptionPlan = "Pro"; 

  localStorage.setItem("userData", JSON.stringify(userData));
  console.log("Updated to pro,", userData);
} else {
  console.error("No userData found in localStorage");
}

   const userId= Cookies.get("userId")
  postAPI({
    endpoint: "/Users/upgrade",
    params: {
      userId: userId,
    },
    callback: (response) => {
      if (response.status === 200) {
        // Handle success
        console.log(response.data.message);
        alert('Subscribed successfuly');
      } else {
        // Handle error response
        console.error(response.data.message);
      }
    },
  });
}

  export const deleteAPI = ({ endpoint, params, callback }) => {
        const token = localStorage.getItem('token'); // Retrieve token 

  fetch(BASE_URL + endpoint, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // If using auth
    },
    body: JSON.stringify(params),
  })
    .then((res) => res.json().then((data) => ({ status: res.status, data })))
    .then(callback)
    .catch((err) => {
      console.error('[DELETE API ERROR]', err);
    });
};
export const putAPI = ({ endpoint, params, callback }) => {
  const token = localStorage.getItem('token'); // Retrieve token

  fetch(BASE_URL + endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // If using auth
    },
    body: JSON.stringify(params),
  })
    .then((res) => res.json().then((data) => ({ status: res.status, data })))
    .then(callback)
    .catch((err) => {
      console.error('[PUT API ERROR]', err);
    });
};
