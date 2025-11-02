"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["Profile", "Security", "Notification", "Support"];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div className="w-full min-h-screen  mt-4">
      {/* Top Tabs */}
      <div className="w-full bg-white rounded-xl ">
        <div className="max-w-5xl mx-auto flex items-center gap-8 p-4 ">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "text-sm font-bold transition-all  py-3 px-6 cursor-pointer rounded-[8px]",
                activeTab === tab
                  ? " bg-[#FAF7FF] text-[#1B1B1B] font-bold "
                  : "text-[#B4ACCA] hover:text-black"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className=" mx-auto px-6 pt-6 mt-4 bg-white pb-10.5">{children}</div>
    </div>
  );
}
