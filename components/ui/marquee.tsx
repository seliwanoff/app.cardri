import React, { useState, useEffect, ReactNode } from "react";
import Marquee from "react-fast-marquee";

interface MarqueeProps {
  children: ReactNode;
  speed?: number;
  direction?: "left" | "right" | "up" | "down";
  pauseOnHover?: boolean;
}

const MarqueeWithIndicator: React.FC<MarqueeProps> = ({
  children,
  speed = 50,
  direction = "left",
  pauseOnHover = true,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2">
      <Marquee
        speed={speed}
        direction={direction}
        pauseOnHover={pauseOnHover}
        gradient={false}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="px-2">
            {child}
          </div>
        ))}
      </Marquee>

      <div className="h-1 rounded-full flex justify-center items-center mt-2  gap-1">
        {React.Children.map(children, (child, index) => (
          <div className="  rounded-full w-[20px] h-[6px] bg-[#EFD1DC]" />
        ))}
      </div>
    </div>
  );
};

export default MarqueeWithIndicator;
