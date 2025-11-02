"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Logo from "@/public/assets/signin/Logo.png";
import CardriSplash from "@/public/assets/signin/CardriSplash.png";
import Slider2 from "@/public/assets/signin/slider2.png";
import Slider3 from "@/public/assets/signin/slider3.png";
import Slider4 from "@/public/assets/signin/slider4.png";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import { useMediaQuery } from "react-responsive";

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery({ minWidth: 992 });

  return (
    <>
      <Toaster
        richColors
        position={`${isDesktop ? "bottom-center" : "top-right"}`}
      />

      <div className="h-screen flex justify-start relative">
        <div className="h-full max-w-[553px] lg:flex hidden justify-center items-center fixed bg-white">
          <div className="flex flex-col gap-[46px] h-[90%] justify-center items-center w-full mx-auto pl-18 pr-18">
            <div className="flex justify-start items-start w-full">
              <Image
                src={Logo}
                alt="Cardri"
                className="object-center flex justify-self-start"
                priority
              />
            </div>

            {Slider.map((item, index) => (
              <div key={index}>
                {index === activeIndex && (
                  <div>
                    <div className="flex flex-col gap-[8px] items-start justify-start w-full">
                      <h1 className="text-[36px] font-sora text-[#1B1B1B] font-[700]">
                        {item.title}
                      </h1>
                      <p className="text-[16px] text-[#1B1B1B] font-[400] font-inter">
                        {item.text}
                      </p>
                    </div>
                    <div className="flex justify-start items-start w-full mt-10">
                      <Image
                        src={item.image}
                        alt="Cardri"
                        className="h-[300px] object-contain w-fit"
                        priority
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="flex gap-[8px] items-center justify-center">
              {Array.from({ length: 4 }, (_, index) => (
                <span
                  onClick={() => setActiveIndex(index)}
                  key={index}
                  className={cn(
                    "inline-block h-[8px] w-[24px] cursor-pointer rounded-full bg-[#B4ACCA]",
                    index === activeIndex &&
                      "w-[32px] bg-opacity-100 bg-[#D70D4A]"
                  )}
                ></span>
              ))}
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex-1 lg:ml-[553px] bg-[#F5F2FB] h-full lg:p-0 p-4">
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
        <div className="flex justify-center items-center h-screen">
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
    title: "Pay and get paid",
    image: CardriSplash,
    text: "in multiple currencies anytime and anywhere",
  },
  {
    title: "Buy and sell fiat currency",
    image: Slider2,
    text: "at your desired rate using P2P",
  },
  {
    title: "Spend, save, invest and exchange",
    image: Slider3,
    text: "in multiple currencies.",
  },
  {
    title: "Pay bills",
    image: Slider4,
    text: "buy data bundle/Airtime and create virtual cards",
  },
];
