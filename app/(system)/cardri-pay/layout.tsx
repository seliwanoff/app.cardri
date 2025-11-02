"use client";
import Image from "next/image";
import Logo from "@/public/assets/signin/Logo.png";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useMediaQuery } from "react-responsive";

import { useQuery } from "@tanstack/react-query";
import { getUsersProfile } from "@/services/users";
import { useRemoteUserStore } from "@/stores/remoteUser";
import { useUserStore } from "@/stores/currentUserStore";
import { usePathname, useRouter } from "next/navigation";
import { Providers } from "@/app/provider";
import DashTopNav2 from "@/components/lib/navigation/DashTopNav2";
import { ArrowLeft } from "lucide-react";
import { ArchiveMinus } from "iconsax-react";
import { cn } from "@/lib/utils";
import PaymentMethodModal from "@/components/modal/payment_method";
import { currencySymbols } from "@/lib/misc";
import COM from "@/public/assets/currencies/cashback.png";
import NGN from "@/public/assets/currencies/NGNCurrency.png";

export default function SystemLayout2({
  children,
}: {
  children: React.ReactNode;
}) {
  const isDesktop = useMediaQuery({ minWidth: 992 });
  const { setUser } = useRemoteUserStore();
  const loginUser = useUserStore((state) => state.loginUser);
  const logoutUser = useUserStore((state) => state.logoutUser);
  const setRefetchUser = useUserStore((state) => state.setRefetchUser);
  const currentUser = useUserStore((state) => state.user);

  const router = useRouter();
  const pathname = usePathname();

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
        //@ts-expect-error
        error.response?.status === 401 &&
        //@ts-expect-error
        error.response?.data?.message === "Unauthenticated."
      ) {
        logoutUser();
        router.push("/signin");
        return;
      }
      console.error("An error occurred:", error);
    }

    if (remoteUser) {
      //@ts-expect-error
      loginUser(remoteUser.data);
      //@ts-expect-error
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

  const PaymentMethodList = [
    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.ngn_b || "0",
      currency: currencySymbols("NGN"),
      //@ts-ignore
      ledger: currentUser?.ngn_ld,
      image: NGN,
      label: "9PSB Balance",
      value: "psb",
    },
    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.ngn_safe_b || "0",
      currency: currencySymbols("NGN"),
      //@ts-ignore
      ledger: currentUser?.ngn_safe_ld,
      image: NGN,
      label: "Safe Heaven Balance",
      value: "safeHeaven",
    },

    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.commission || "0",
      currency: currencySymbols("NGN"),
      image: COM,
      label: "Commission Balance",
      value: "commission",
    },
  ];

  return (
    <Providers>
      <Toaster
        richColors
        position={`${isDesktop ? "bottom-center" : "top-right"}`}
      />
      <div className="grid h-screen min-h-[200px] w-full grid-cols-7 overflow-hidden bg-[#F8F8F8]">
        <>
          <main
            className={cn(
              "relative col-span-7 flex h-screen flex-col overflow-hidden  xl:col-span-7 ",
              pathname === "/cardri-pay/receipt" ? "bg-black" : "bg-[#F8F8F8]"
            )}
          >
            <DashTopNav2 />
            <PaymentMethodModal paymentList={PaymentMethodList} />
            <div className="w-full overflow-x-hidden px-0 md:px-0 lg:px-16">
              {pathname !== "/cardri-pay/receipt" &&
                pathname !== "/cardri-pay/payment_link" && (
                  <div className="flex w-full justify-between items-center mt-4 px-8 md:px-8 lg:px-16">
                    <div
                      className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                      onClick={() => router.back()}
                    >
                      <ArrowLeft color="#6C757D" />
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer">
                      <ArchiveMinus
                        className="text-primary-100"
                        color="#D70D4A"
                        size={20}
                      />
                      <span className="text-secondary-500 font-normal text-base font-inter ">
                        Transactions
                      </span>
                    </div>
                  </div>
                )}
              {children}
            </div>
          </main>
        </>
      </div>
    </Providers>
  );
}
