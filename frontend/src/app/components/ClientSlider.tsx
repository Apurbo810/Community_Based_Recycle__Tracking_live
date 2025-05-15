'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const ClientSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = ['/1.png', '/2.png', '/3.png', '/4.png'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [images.length]); // Added images.length here to fix warning

  return (
    <main className="flex-grow relative w-full h-screen overflow-hidden">
      <div
        className="flex transition-transform duration-1000 ease-in-out h-full w-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div key={index} className="relative w-full h-full flex-shrink-0">
            <Image
              src={image}
              alt={`Slide ${index}`}
              width={1920}
              height={1080}
              style={{ objectFit: 'cover' }}
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-4 h-4 rounded-full transition-all ${
              currentIndex === index ? 'bg-green-500 scale-125' : 'bg-gray-400'
            }`}
          />
        ))}
      </div>
    </main>
  );
};

export default ClientSlider;
