"use client";

import { ArchiveMinus } from "iconsax-react";
import { ArrowLeft, Copy, Edit, X } from "lucide-react";
import { useRouter } from "next/navigation";
import payment from "@/public/assets/paymentlink/paymentlink.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import PaymentForm from "@/components/auth/payment-form";
import { useQuery } from "@tanstack/react-query";
import { getPaymentLinks } from "@/services/payment_link";
import { Skeleton } from "@/components/ui/skeleton";
import packages from "@/public/assets/paymentlink/package.png";
import { numberWithCommas } from "@/helper";
import { currencySymbols } from "@/lib/misc";
import { formatDateToRelativeTime } from "@/misc";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { toast } from "sonner";

const PaymentLinkPage = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [receiverAccountInfo, setReceiverInfo] = useState(null);

  const {
    data: paymentLinks,
    isLoading,
    isError,
    error,
  } = useQuery<any[], Error>({
    queryKey: ["paymentLinks"], // Changed from "transactions" to be more specific
    queryFn: getPaymentLinks,
    retry: 3,
  });
  const [openDrawer, setOpenDrawer] = useState(false);

  if (step === 2) {
    return <PaymentForm />;
  }

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const paymentLink = `https://cardri.ng/payment/?link=${receiverAccountInfo?.link}`;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(paymentLink);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        console.error("Failed to copy:", err);
        toast.error("Failed to copy link");
      }
    };
    return (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="mx-auto max-w-[500px] bg-white rounded-tl-[24px] rounded-tr-[24px] border-0 focus-visible:outline-none">
          {/* Header */}
          <DrawerHeader className="relative bg-main-100 p-6 text-left text-white">
            <div className="mx-auto w-full max-w-[500px]">
              <DrawerTitle className="text-xl font-bold text-text-secondary-200 text-[20px] font-sora">
                Payment details
              </DrawerTitle>
            </div>
            <button
              onClick={() => setOpenDrawer(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#000]"
            >
              <X size={20} />
            </button>
          </DrawerHeader>

          {/* Body Content */}
          <div className="mx-auto w-full max-w-[614px] p-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="w-full flex justify-center items-center">
                <h2 className="text-text-secondary-200 font-bold text-[32px] font-inter">
                  <sub>{currencySymbols(receiverAccountInfo?.currency)}</sub>
                  {numberWithCommas(receiverAccountInfo?.amountPayable)}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Title:</span>
                <span className="font-medium">
                  {receiverAccountInfo?.title}
                </span>
              </div>
              <div className=" bg-gray-50 rounded-[24px] px-2 py-1 text-black h-[56px] justify-between items-center flex">
                <span className="text-gray-500 text-nowrap   text-clip">
                  https//cardri.ng/payment/?link={receiverAccountInfo?.link}
                </span>
                <span className="cursor-pointer" onClick={handleCopy}>
                  <Copy />
                </span>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  // console.log(paymentLinks);
  return (
    <div
      className="bg-white px-4 lg:px-[72px] pt-16 rounded-tl-[30px] rounded-tr-[30px] h-[calc(100vh-80px)] w-full flex flex-col overflow-auto mt-4"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className="flex w-full justify-between items-center mt-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <div
            className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft color="#6C757D" />
          </div>
          <span className="text-secondary-500 font-normal text-base font-inter">
            Payment Link
          </span>
        </div>

        <div className="flex items-center gap-2 cursor-pointer">
          <ArchiveMinus
            className="text-primary-100"
            color="#D70D4A"
            size={20}
          />
          <span className="text-secondary-500 font-normal text-base font-inter">
            Transactions
          </span>
        </div>
      </div>

      {isLoading ? (
        // Loading skeleton
        <div className="w-full border-2 border-[#FAF7FF] rounded-3xl py-10.5 px-7.5 flex flex-col gap-10.5 mt-4">
          <div className="flex items-center justify-center flex-col">
            <Skeleton className="w-[201px] h-[217px] rounded-lg" />
            <div className="flex flex-col items-center justify-center gap-2 mt-4 w-full">
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
            <div className="p-7.5 bg-[#FAF7FF] border-dashed border border-[#EFD1DC] rounded-3xl mt-6 w-full">
              <Skeleton className="h-4 w-full" />
              <div className="flex w-full flex-col items-center mt-4 justify-center">
                <Skeleton className="h-6 w-[200px]" />
                <Skeleton className="mt-4 h-16 w-full rounded-[8px]" />
              </div>
            </div>
          </div>
        </div>
      ) : isError ? (
        // Error state
        <div className="w-full border-2 border-[#FAF7FF] rounded-3xl py-10.5 px-7.5 flex flex-col gap-10.5 mt-4 items-center justify-center">
          <div className="text-red-500 font-inter">
            Error: {error?.message || "Failed to load payment links"}
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="bg-primary-100 text-white"
          >
            Retry
          </Button>
        </div>
      ) : paymentLinks && paymentLinks.length > 0 ? (
        <div className="lg:p-7.5 p-3 border-dashed border border-[#FAF7FF] rounded-3xl w-full mt-6">
          {paymentLinks?.map((items, index) => (
            <div
              className="flex  items-center justify-between w-full py-[16px] lg:px-[30px] px-2"
              key={index}
              onClick={() => {
                setReceiverInfo(items);

                setOpenDrawer(true);
              }}
            >
              <div className="flex  gap-1 items-center justify-between">
                <Image
                  src={packages}
                  alt="Payment Link"
                  className="object-center w-[48px] h-[48px]"
                />

                <div className="flex flex-col gap-1">
                  <span className="text-[#1B1B1B] text-base font-semibold font-inter">
                    {items.title}
                  </span>
                  <span className="text-sm font-normal font-inter text-[#B4ACCA]">
                    {formatDateToRelativeTime(items.created_at)}
                  </span>
                  <span
                    className={cn(
                      items.status === "1"
                        ? "text-green-500 bg-green-200 py-1 px-3 rounded-full w-fit items-center justify-center flex"
                        : "text-red-500 bg-red-200 py-1 px-3 rounded-full w-fit items-center justify-center flex"
                    )}
                  >
                    {items.status === "1" ? "active" : "Inactive"}
                  </span>
                </div>
              </div>
              <span className="text-[#474256] text-base font-semibold font-inter">
                {currencySymbols(items.currency)}{" "}
                {numberWithCommas(items.amountPayable)}
              </span>
            </div>
          ))}

          <div className="p-7.5 bg-[#FAF7FF] border-dashed border border-[#EFD1DC] rounded-3xl mt-6 w-full">
            <span className="text-[#B4ACCA] text-xs font-inter text-center block w-full">
              Receive money via payment link in a second.
            </span>

            <div className="flex w-full flex-col items-center mt-4 justify-center">
              <div className="flex items-center gap-2">
                <Edit color="#D70D4A" />
                <span className="text-secondary-500 font-normal text-base font-inter">
                  Create a new Recipient
                </span>
              </div>

              <Button
                className="mt-4 bg-primary-100 text-white w-full h-16 rounded-[8px]"
                onClick={() => setStep(2)}
              >
                New Link
              </Button>
            </div>
          </div>
        </div>
      ) : (
        // Empty state (original UI)
        <div className="w-full border-2 border-[#FAF7FF] rounded-3xl py-10.5 px-7.5 flex flex-col gap-10.5 mt-4">
          <div className="flex items-center justify-center flex-col">
            <Image
              src={payment}
              alt="Payment Link"
              className="object-center w-[201px] h-[217px]"
            />

            <div className="flex flex-col items-center justify-center gap-2 mt-4">
              <h3 className="font-sora font-bold text-[20px] text-[#474256]">
                Create Payment Link
              </h3>

              <span className="text-[#474256] font-normal text-xs font-inter text-center">
                Set a product or subscription by sharing a link <br /> for
                customers
              </span>
            </div>

            <div className="lg:p-7.5 p-3 bg-[#FAF7FF] border-dashed border border-[#EFD1DC] rounded-3xl mt-6 w-full">
              <span className="text-[#B4ACCA] text-xs font-inter text-center block w-full">
                Receive money via payment link in a second.
              </span>

              <div className="flex w-full flex-col items-center mt-4 justify-center">
                <div className="flex items-center gap-2">
                  <Edit color="#D70D4A" />
                  <span className="text-secondary-500 font-normal text-base font-inter">
                    Create a new Recipient
                  </span>
                </div>

                <Button
                  className="mt-4 bg-primary-100 text-white w-full h-16 rounded-[8px]"
                  onClick={() => setStep(2)}
                >
                  New Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmDrawer receiverAccountInfo={receiverAccountInfo} />
    </div>
  );
};

export default PaymentLinkPage;
