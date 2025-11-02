"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Goloka from "@/public/assets/signin/Logo.png";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useUserStore } from "@/stores/currentUserStore";
import { useSidebar } from "@/stores/overlay";

type ComponentProps = {
  navMenuList: { icon: any; title: string; link: string }[];
};

const DashSideBarMobile: React.FC<ComponentProps> = ({ navMenuList }) => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useUserStore((state) => state.logoutUser);
  //const [isOpen, setIsOpen] = useState(false);

  const { open: isOpen, setOpen: setIsOpen } = useSidebar();

  const initiateLogout = () => {
    try {
      logout();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      router.replace("/signin");
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col bg-white transform transition-transform duration-300 ease-in-out lg:hidden",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo & Close button */}
        <div className="flex justify-between items-center px-6 py-4 ">
          <Image src={Goloka} alt="logo" className="w-[120px]" />

          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-800 focus:outline-none"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-3 px-6 py-6 overflow-y-auto">
          {navMenuList.map((nav_item) => (
            <Link
              href={nav_item.link}
              key={nav_item.title}
              onClick={() => setIsOpen(false)}
              className={cn(
                "flex w-full flex-row items-center justify-start gap-4 rounded-[10px] px-4 py-3",
                pathname.includes(nav_item.link)
                  ? "bg-[#FAF7FF] text-primary-100 font-semibold"
                  : "bg-white text-[#B4ACCA] hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <nav_item.icon size={20} color="currentColor" strokeWidth={1.5} />
              <p>{nav_item.title}</p>
            </Link>
          ))}

          {/* Logout */}
          <div
            onClick={initiateLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-[10px] text-[#B4ACCA] hover:bg-gray-100 cursor-pointer"
          >
            <LogOut size={20} color="currentColor" strokeWidth={1.5} />
            <p>Logout</p>
          </div>
        </nav>
      </div>

      {/* BACKDROP (when sidebar is open) */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
};

export default DashSideBarMobile;
