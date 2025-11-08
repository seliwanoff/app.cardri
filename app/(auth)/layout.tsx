'use client';

import { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Logo from '@/public/assets/signin/Logo.png';
import CardriSplash from '@/public/assets/signin/CardriSplash.png';
import Slider2 from '@/public/assets/signin/slider2.png';
import Slider3 from '@/public/assets/signin/slider3.png';
import Slider4 from '@/public/assets/signin/slider4.png';
import { cn } from '@/lib/utils';
import { Toaster } from 'sonner';
import { useMediaQuery } from 'react-responsive';
import Cardri from '@/public/assets/CardriSvg.svg';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery({ minWidth: 992 });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) =>
        prevIndex === Slider.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000); // change every 4 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  return (
    <>
      <Toaster
        richColors
        position={`${isDesktop ? 'bottom-center' : 'top-right'}`}
      />

      <div className='h-full flex justify-start relative'>
        {/* Left section */}
        <div className='h-full lg:max-w-[700px] 2xl:max-w-[1000px] lg:flex hidden justify-center items-center fixed bg-white'>
          <div className='flex flex-col justify-between h-[calc(100vh-100px)] w-full px-12 '>
            {/* Logo + slider content */}
            <div className='flex flex-col flex-1 justify-start gap-8 h-full'>
              {/* Logo */}
              <div className='flex justify-start -mt-5'>
                <Image
                  src={Logo}
                  alt='Cardri'
                  className='object-contain'
                  priority
                />
              </div>

              {/* Slider */}
              {Slider.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex flex-col gap-6 transition-all duration-700 ease-in-out transform',
                    index === activeIndex
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-5 pointer-events-none absolute'
                  )}
                >
                  <div className='flex flex-col gap-2 items-start'>
                    <h1 className='text-[32px] font-sora text-[#1B1B1B] font-[700] leading-tight max-w-[400px]'>
                      {item.title}
                    </h1>
                    <p className='text-[16px] text-[#1B1B1B] font-inter font-[400]'>
                      {item.text}
                    </p>
                  </div>

                  <div className='flex justify-start items-center w-full'>
                    <Image
                      src={item.image}
                      alt={item.title}
                      className='h-[250px] w-auto object-contain transition-all duration-700 ease-in-out'
                      priority
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Slider indicators */}
            <div className='flex gap-[8px] items-center justify-center '>
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  onClick={() => setActiveIndex(index)}
                  key={index}
                  className={cn(
                    'inline-block h-[8px] w-[24px] cursor-pointer rounded-full bg-[#B4ACCA] transition-all duration-300',
                    index === activeIndex && 'w-[32px] bg-[#D70D4A]'
                  )}
                ></span>
              ))}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className='flex-1 lg:ml-[553px] bg-[#F5F2FB] h-full lg:p-0 p-4 overflow-y-auto'>
          <div className='flex lg:hidden h-[100px] py-6 px-3 items-center w-full justify-start'>
            <Image src={Cardri} alt='logo' />
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className='flex justify-center items-center h-full'>
          Loading...
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}

const Slider = [
  {
    title: 'Pay and get paid',
    image: CardriSplash,
    text: 'in multiple currencies anytime and anywhere',
  },
  {
    title: 'Buy and sell fiat currency',
    image: Slider2,
    text: 'at your desired rate using P2P',
  },
  {
    title: 'Spend, save, invest and exchange',
    image: Slider3,
    text: 'in multiple currencies.',
  },
  {
    title: 'Pay bills',
    image: Slider4,
    text: 'buy data bundle/Airtime and create virtual cards',
  },
];
