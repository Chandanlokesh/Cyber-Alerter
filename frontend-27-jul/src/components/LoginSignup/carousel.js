import React, { useEffect, useState } from 'react';
import { Carousel } from 'antd';
import Frame4 from '../../images/Frame4.svg';
import Frame3 from '../../images/Frame3.svg';
import Frame2 from '../../images/Frame2.svg';

const CarouselWrapper = () => {
  const [showCarousel, setShowCarousel] = useState(false);

  useEffect(() => {
    // Delay mounting to wait for layout to stabilize
    const timeout = setTimeout(() => {
      setShowCarousel(true);
    }, 10);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center ">
      {showCarousel && (
        <div className="w-full h-[400px]">
          <Carousel autoplay className="w-full h-full">
            <div className="w-full h-[400px] flex items-center justify-center">
              <img src={Frame4} alt="Slide 1" className="object-contain h-80" />
            </div>
            <div className="w-full h-[400px] flex items-center justify-center">
              <img src={Frame3} alt="Slide 2" className="object-contain h-80" />
            </div>
            <div className="w-full h-[400px] flex items-center justify-center">
              <img src={Frame2} alt="Slide 3" className="object-contain h-80" />
            </div>
          </Carousel>
        </div>
      )}
    </div>
  );
};

export default CarouselWrapper;
