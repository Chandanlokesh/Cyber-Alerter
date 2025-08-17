import React, { useState } from 'react';
import LoginComponent from '../components/LoginSignup/LoginComponent';
import SignUpComponent from '../components/LoginSignup/SignUpComponent';
import CarouselWrapper from '../components/LoginSignup/carousel';

import '../styles/App.css';
import 'antd/dist/reset.css';

const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center triangle-background">
      <div className="relative w-[90%] h-[100vh] z-[1] flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center ">
        <CarouselWrapper/>
</div>



        {/* Right Section (Login/Signup) */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center  p-6">
          <div className="w-full max-w-md">
            {isSignUp ? (
              <SignUpComponent toggleForm={toggleForm} />
            ) : (
              <LoginComponent toggleForm={toggleForm} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
