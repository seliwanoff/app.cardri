"use client";

import { cn } from "@/lib/utils";
import React from "react";
import receiptImage from "@/public/assets/Receipt.png";
import Image from "next/image";
import { currencySymbols, networkName } from "@/lib/misc";
import { numberWithCommas } from "@/helper";
import { Copy, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import marquee1 from "@/public/assets/marquee2.png";
import { ArchiveMinus } from "iconsax-react";

interface ReceiptPageProps {
  searchParams?: any;
}

export default function ReceiptPage({ searchParams }: ReceiptPageProps) {
  const orderId = searchParams?.orderId || "N/A";
  const date = searchParams?.date || "2025-10-30";
  const currency = searchParams?.currency || "NGN";
  const type = searchParams?.type || "Payment";
  const network = searchParams?.network || "MTN";
  const total = Number(searchParams?.total) || 0;

  return (
    <div className={cn("w-full max-w-[526px] mx-auto relative")}>
      <Image
        src={receiptImage}
        alt="Receipt Background"
        className="w-full h-auto"
        priority
      />

      <div className="absolute inset-0 p-8">
        <div className="absolute top-[200px] left-0 right-0 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <span className="text-[#1B1B1B] font-semibold text-base">
              <sub>{currency}</sub>
              {numberWithCommas(total.toString())}
            </span>
            <span>{date}</span>
          </div>

          <div className="mt-4 w-full px-[50px] space-y-2">
            {[
              {
                label: "Amount",
                value: `${currencySymbols("NGN")}${numberWithCommas(
                  total.toString()
                )}`,
              },
              { label: "Transaction ID", value: orderId, copy: true },
              { label: "Type", value: type },
              { label: "Network", value: networkName(network) },
              { label: "Date", value: date },
            ].map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] py-2"
              >
                <span className="text-[#474256] font-normal text-sm">
                  {item.label}
                </span>
                <span className="text-[#1B1B1B] font-semibold text-base inline-flex gap-3">
                  {item.value}
                  {item.copy && (
                    <Copy
                      color="#D70D4A"
                      size={15}
                      className="cursor-pointer"
                    />
                  )}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-1 items-center w-full mt-4 px-[50px]">
            <div className="flex gap-1 items-center text-primary-100">
              {[Instagram, Twitter, Facebook, Linkedin].map((Icon, i) => (
                <Icon key={i} size={16} />
              ))}
            </div>
            <div className="h-[1px] w-full bg-[#EFD1DC]" />
          </div>

          <div className="text-[#474256] font-normal text-[10px] text-center px-[50px] mt-3">
            © 2025 Cardri is a product of Technologies & Services Ltd. Cardri is
            a finance technology company and not a bank.
          </div>

          <div className="px-[50px] w-full mt-2">
            <Image
              src={marquee1}
              alt="Marquee"
              width={400}
              height={50}
              className="w-full h-auto"
            />
          </div>

          <div className="flex justify-center items-center gap-2 mt-4 text-white font-medium">
            <ArchiveMinus size={20} color="white" />
            2025 Cardri Finance Receipt
          </div>
        </div>
      </div>
    </div>
  );
}
