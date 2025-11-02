"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import sendMoney from "@/public/assets/cardripay/sendmoney.png";
import payBills from "@/public/assets/cardripay/paybills.png";
import paymentLink from "@/public/assets/cardripay/paymentlink.png";
import swap from "@/public/assets/cardripay/swap.png";
import deposit from "@/public/assets/cardripay/deposit.png";
import { SideBarMenuList } from "@/lib/assets";
import SendMoneyModal from "@/components/modal/send-money-modal";
import {
  useBillModalOverlay,
  useSendMoneyModalOverlay,
} from "@/stores/overlay";
import BillModal from "@/components/modal/bill_modal";
import { useRouter } from "next/navigation";

const CardriPay = () => {
  const { setOpen } = useSendMoneyModalOverlay();
  const { setOpenBill } = useBillModalOverlay();
  const router = useRouter();

  const cardriPayList = [
    {
      label: "Send Money",
      description:
        "Send money to friends, family or business using their bank details",
      image: sendMoney,
      action: () => setOpen(true),
    },
    {
      label: "Deposit",
      description: "Withdraw commission to other banks using the bank details.",
      image: deposit,
    },
    {
      label: "Swap",
      description: "Withdraw commission to other banks using the bank details.",
      image: swap,
      action: () => router.push("/cardri-pay/swap"),
    },
    {
      label: "Pay Bills",
      description: "Withdraw commission to other banks using the bank details.",
      image: payBills,
      action: () => setOpenBill(true),
    },
    {
      label: "Payment Link",
      description: "Withdraw commission to other banks using the bank details.",
      image: paymentLink,
      action: () => router.push("/cardri-pay/payment_link"),
    },
  ];

  return (
    <div className="grid grid-cols-6 gap-6 py-5 w-full">
      {/* === MAIN CONTENT === */}
      <div className="col-span-6 flex flex-col gap-6 mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-3xl w-full">
        <h2 className="font-bold text-[18px] sm:text-[20px] font-sora text-[#242E3E]">
          Send, Receive and Swap
        </h2>

        {/* === CARD LIST === */}
        <div className="flex flex-wrap justify-center lg:justify-between gap-4 sm:gap-6">
          {cardriPayList.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              className="cursor-pointer flex justify-between items-center border border-[#FAF7FF] p-4 sm:p-6 rounded-2xl w-full sm:w-[calc(50%-0.75rem)] lg:max-w-[442px] transition hover:bg-[#FAF7FF]"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Image
                  src={item.image}
                  alt={item.label}
                  className="h-12 w-12 sm:h-16 sm:w-16"
                />
                <div>
                  <h3 className="text-[#07052A] font-semibold text-sm sm:text-base font-inter">
                    {item.label}
                  </h3>
                  <p className="text-[#474256] text-xs sm:text-[12px] font-inter leading-4">
                    {item.description}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-[#B4ACCA]" />
            </div>
          ))}
        </div>
      </div>

      {/* === FOOTER / BOTTOM MENU === */}
      <div className="col-span-6 hidden lg:flex">
        <div className="w-full bg-white p-4 sm:p-6 lg:p-10 rounded-2xl flex justify-center sm:justify-between items-center gap-6 overflow-x-auto">
          {SideBarMenuList?.map((menu: any, index: number) => (
            <div
              key={index}
              className="relative flex-1 max-w-[200px] flex items-center justify-center"
            >
              <Image
                src={menu?.image}
                alt={menu.label}
                fill
                className="object-contain w-full h-auto"
              />
            </div>
          ))}
        </div>
      </div>

      {/* === MODALS === */}
      <SendMoneyModal />
      <BillModal />
    </div>
  );
};

export default CardriPay;
