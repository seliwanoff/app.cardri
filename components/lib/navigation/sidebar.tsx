"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Cardri from "@/public/assets/signin/Logo.png";
import { usePathname, useRouter } from "next/navigation";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LogOut } from "lucide-react";
import { useUserStore } from "@/stores/currentUserStore";
import { useSidebar } from "@/stores/overlay";
//import { userLogout } from "@/services/auth";

type ComponentProps = {
  navMenuList: { icon: any; title: string; link: string }[];
};

const DashSideBarDesktop: React.FC<ComponentProps> = ({ navMenuList }) => {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useUserStore((state) => state.logoutUser);

  const initiateLogout = () => {
    try {
      logout();
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("token_type");
      router.replace("/signin");
      //  localStorage.clear();
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <>
      {/***
      <CreateOrganization />
      */}

      <aside className="col-span-1 hidden h-full w-full flex-col bg-white px-4  shadow-[0_0_5px_0_[#0000001A]] lg:flex   ">
        {/* -- logo section */}
        <div className="flex  h-[110px] py-6 px-5 justify-center items-center">
          <AspectRatio ratio={24 / 9} className="max-w-[112px] h-[42px]">
            <Image src={Cardri} alt="logo" fill />
          </AspectRatio>
        </div>

        {/* -- nav items  */}
        <nav className="py-[42px] flex flex-col gap-3">
          {navMenuList.map((nav_item) => (
            <Link
              href={nav_item.link}
              key={nav_item.title}
              className={cn(
                "transit flex w-full flex-row items-center justify-start gap-4 rounded-[10px] px-4 py-2",
                pathname.includes(nav_item.link)
                  ? "bg-[#FAF7FF] h-[60px] px-4 flex  text-primary-100"
                  : "bg-white font-normal font-inter text-[#B4ACCA] ring-gray-100 hover:bg-gradient-to-br hover:from-gray-50/20 hover:via-gray-100/80 hover:to-gray-50/20 hover:text-gray-800 hover:ring-1"
              )}
            >
              <nav_item.icon size={20} color="currentColor" strokeWidth={1.5} />
              <p
                className={cn(
                  "",
                  pathname.includes(nav_item.link) && "text-primary-100"
                )}
              >
                {nav_item.title}
              </p>
            </Link>
          ))}

          {/* CTA */}

          <div
            className={cn(
              "transit flex w-full flex-row items-center justify-start gap-4 rounded-[10px] px-4 py-2 cursor-pointer",

              "bg-white font-normal font-inter text-[#B4ACCA] ring-gray-100 hover:bg-gradient-to-br "
            )}
            onClick={initiateLogout}
          >
            <LogOut size={20} color="currentColor" strokeWidth={1.5} />
            Logout
          </div>
        </nav>
      </aside>
    </>
  );
};

export default DashSideBarDesktop;
