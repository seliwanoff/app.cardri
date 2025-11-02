"use client";
import Image from "next/image";
import Logo from "@/public/assets/signin/Logo.png";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useMediaQuery } from "react-responsive";
import DashSideBarDesktop from "@/components/lib/navigation/sidebar";
import { LayoutGrid, Settings } from "lucide-react";
import {
  ArchiveMinus,
  DocumentCopy,
  Import,
  MessageQuestion,
  Note,
  People,
  Wallet3,
} from "iconsax-react";
import DashTopNav from "@/components/lib/navigation/DashTopNav";
import { useQuery } from "@tanstack/react-query";
import { getUsersProfile } from "@/services/users";
import { useRemoteUserStore } from "@/stores/remoteUser";
import { useUserStore } from "@/stores/currentUserStore";
import { useRouter } from "next/navigation";
import { Providers } from "@/app/provider";
import DashSideBarMobile from "@/components/lib/navigation/mobile_sidebar";

export default function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const { setUser } = useRemoteUserStore();
  const loginUser = useUserStore((state) => state.loginUser);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const setRefetchUser = useUserStore((state) => state.setRefetchUser);
  const router = useRouter();

  const {
    data: remoteUser,
    isLoading: isUserLoading,
    refetch: isRefetch,
    error,
  } = useQuery({
    queryKey: ["Get remote profile"],
    queryFn: getUsersProfile,
  });

  useEffect(() => {
    if (error) {
      console.log("An error occurred:", error);
      if (
        // @ts-ignore
        error.response?.status === 401 &&
        // @ts-ignore
        error.response?.data?.message === "Unauthenticated."
      ) {
        logoutUser();
        router.push("/signin");
        return;
      }
      console.error("An error occurred:", error);
    }

    if (remoteUser) {
      // @ts-ignore
      loginUser(remoteUser.data);
      // @ts-ignore
      setUser(remoteUser.data);
    }

    setRefetchUser(isRefetch);
  }, [
    loginUser,
    remoteUser,
    error,
    setUser,
    isRefetch,
    logoutUser,
    router,
    setRefetchUser,
  ]);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center">
        <Image
          src={Logo}
          alt="Cardri logo"
          width={120}
          height={160}
          className="animate-pulse"
        />
        <p className="animate-pulse font-sora text-lg font-bold text-primary-100 mt-4">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <Providers>
      <Toaster
        richColors
        position={`${isDesktop ? "bottom-center" : "top-right"}`}
      />
      <div className="grid h-screen min-h-[200px] w-full grid-cols-7 overflow-hidden bg-[#F8F8F8]">
        <>
          <DashSideBarDesktop navMenuList={NavData} />
          <DashSideBarMobile navMenuList={NavData} />

          <main className="relative col-span-7 flex h-screen flex-col overflow-hidden  xl:col-span-6 xl:bg-[#F8F8F8]">
            <DashTopNav />
            <div className="h-[calc(100% - 72px)] w-full overflow-x-hidden px-5 md:px-8 lg:px-16">
              {children}
            </div>
          </main>
        </>
      </div>
    </Providers>
  );
}

const NavData: { icon: any; title: string; link: string }[] = [
  { icon: LayoutGrid, title: "Dashboard", link: "/dashboard/root" },
  { icon: Wallet3, title: "Wallet", link: "/dashboard/wallet" },
  { icon: Note, title: "Cardri Pay", link: "/dashboard/cardri-pay" },
  { icon: DocumentCopy, title: "Cards", link: "/dashboard/cards" },
  {
    icon: ArchiveMinus,
    title: "Transactions",
    link: "/dashboard/transactions",
  },
  { icon: Settings, title: "Settings", link: "/dashboard/settings" },
];
