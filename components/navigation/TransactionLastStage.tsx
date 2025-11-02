"use client";

import { numberWithCommas } from "@/helper";
import {
  currencyImages,
  currencySymbols,
  downloadReceipt,
  getCurrencyByType,
  networkImage,
} from "@/lib/misc";
import successLogo from "@/public/assets/success.png";
import { Copy, Download } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { Export } from "iconsax-react";
import MarqueeWithIndicator from "../ui/marquee";
import marquee1 from "@/public/assets/marquee1.png";
import marquee2 from "@/public/assets/marquee2.png";
import ReceiptTemplate from "@/app/(system)/cardri-pay/receipt/page";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getTransactionById } from "@/services/lib";
import { useRouter } from "next/navigation";

const TransactionLastStage = () => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [ref, setRef] = useState<string>("");
  const [transaction, setTransaction] = useState<any>(null);
  const [type, setType] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("ref") || "";
    const type = params.get("type") || "";
    setRef(reference);
    setType(type);
  }, []);

  useEffect(() => {
    const handleTransactionById = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const reference = params.get("ref") || "";
        const response = await getTransactionById(reference);
        setTransaction(response);
      } catch (error) {
        console.error("Error fetching transaction by ID:", error);
      }
    };
    handleTransactionById();
  }, []);

  const router = useRouter();

  const handleDownload = async () => {
    const hiddenContainer = document.createElement("div");
    hiddenContainer.style.position = "absolute";
    hiddenContainer.style.left = "-9999px";
    hiddenContainer.id = "receipt-container";
    document.body.appendChild(hiddenContainer);

    try {
      const root = createRoot(hiddenContainer);
      root.render(
        <div id="receipt-to-capture">
          <ReceiptTemplate
            orderIds={ref}
            date={new Date(transaction.created_at).toLocaleDateString()}
            items={[
              { name: "Product 1", price: 19.99, quantity: 2 },
              { name: "Product 2", price: 29.99, quantity: 1 },
            ]}
            total={transaction.amount}
            //@ts-ignore
            currency={getCurrencyByType(transaction?.type)}
            type={type}
            network={transaction?.network}
          />
        </div>
      );

      await new Promise((resolve) => setTimeout(resolve, 50));
      await downloadReceipt("receipt-to-capture", `receipt_${ref}`);
    } finally {
      const container = document.getElementById("receipt-container");
      if (container) {
        document.body.removeChild(container);
      }
    }
  };

  // Determine which sections to show based on transaction type
  const showRate = !["data", "airtime", "bill", "cable-tv", "local"].includes(
    type
  );

  const showBankDetails = ["local"].includes(type);
  const showAmountInNaira = ![
    "data",
    "airtime",
    "dom",
    "wire",
    "china-pay",
    "local",
  ].includes(type);
  const showAmountInDollar = ["wire", "dom", "china-pay"].includes(type);

  const showForeignCurrency = ["wire", "dom", "china-pay"].includes(type);
  const showNotLocal = !["wire", "dom", "china-pay"].includes(type);
  const showTokenSection = type === "electricity";

  return (
    <div className="w-full max-w-[640px] bg-white mx-auto rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center lg:px-[72px] lg:pt-[64px]">
      <div className="flex flex-col gap-4 items-center">
        <div className="flex flex-col gap-6 items-center mb-4">
          <Image
            src={successLogo}
            alt="Success"
            className="w-[82px] h-[82px] object-center"
          />
          <span className="font-inter font-bold text-[#474256] text-base leading-0.5">
            Successful
          </span>
        </div>

        <div className="flex items-center gap-0.5 text-[#07052A] font-inter font-semibold text-[32px] leading-8">
          <sub>{getCurrencyByType("1")}</sub>
          {numberWithCommas(transaction?.amount)}
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full">
        <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
          <span className="text-[#474256] font-inter font-normal text-sm leading-6">
            You are paying for?
          </span>
          <div className="flex items-center gap-2">
            <Image
              src={networkImage(transaction?.network)}
              alt="airtime"
              width={20}
              height={20}
              className="w-5 h-5 rounded-full object-center"
            />
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              {type === "local" ? "Local tranfer" : type}
            </span>
          </div>
        </div>

        {showForeignCurrency && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Receiver
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              {transaction?.network || transaction?.phoneNumber || "N/A"}
            </span>
          </div>
        )}
        {showBankDetails && (
          <>
            <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
              <span className="text-[#474256] font-inter font-normal text-sm leading-6">
                Receiver name
              </span>
              <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6 text-end">
                {transaction?.network || "N/A"}
              </span>
            </div>
            <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
              <span className="text-[#474256] font-inter font-normal text-sm leading-6">
                Bank name
              </span>
              <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6 text-end">
                {transaction?.plan || "N/A"}
              </span>
            </div>
          </>
        )}
        {showNotLocal && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Receiver
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              {transaction?.reciever || "N/A"}
            </span>
          </div>
        )}

        {showRate && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Rate
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              <sub>{getCurrencyByType("1")}</sub>{" "}
              {
                //@ts-ignore
                parseFloat(1 / parseFloat(transaction?.rate1)).toFixed(2)
              }
            </span>
          </div>
        )}

        {showAmountInNaira && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Amount In Naira
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              <sub>{currencySymbols("NGN")}</sub>
              {numberWithCommas("500")}
            </span>
          </div>
        )}
        {showAmountInDollar && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Amount In Dollar
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              <sub>{currencySymbols("USD")}</sub>
              {numberWithCommas(transaction?.amountInDollar)}
            </span>
          </div>
        )}

        {showTokenSection && transaction?.token && (
          <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
            <span className="text-[#474256] font-inter font-normal text-sm leading-6">
              Token
            </span>
            <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
              {transaction.token}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
          <span className="text-[#474256] font-inter font-normal text-sm leading-6">
            Transaction ID
          </span>
          <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6 inline-flex gap-3">
            {ref} <Copy color="#D70D4A" size={15} className="cursor-pointer" />
          </span>
        </div>

        <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
          <span className="text-[#474256] font-inter font-normal text-sm leading-6">
            Earned Cashback
          </span>
          <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
            <sub>
              {currencySymbols(
                transaction?.currency || transaction?.fr || "NGN"
              )}
            </sub>{" "}
            {numberWithCommas(transaction?.commission)}
          </span>
        </div>

        <div className="flex justify-between items-center w-full border border-[#B4ACCA1A] px-[10px] h-[50px]">
          <span className="text-[#474256] font-inter font-normal text-sm leading-6">
            Date/Time
          </span>
          <span className="text-[#1B1B1B] font-inter font-semibold text-base leading-6">
            {new Date(transaction?.created_at).toLocaleDateString()}{" "}
            {new Date(
              new Date(transaction?.created_at).getTime() - 3600000
            ).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <Button
          type="button"
          className="w-full gap-4 rounded-xl cursor-pointer bg-primary-100 text-white font-inter font-medium text-sm h-[60px] flex justify-center items-center"
          onClick={handleDownload}
        >
          <Download color="white" size={20} />
          Download Receipt
        </Button>

        <Button
          type="button"
          onClick={() => router.replace("/dashboard/root")}
          className="w-full gap-4 rounded-xl cursor-pointer bg-[#FAF7FF] text-[#211054] font-inter font-medium text-sm h-[60px] flex justify-center items-center"
        >
          Done
        </Button>
      </div>

      <div className="mb-16">
        <MarqueeWithIndicator direction="right" speed={40}>
          <Image
            src={marquee1}
            alt="Marquee 1"
            className="w-full object-center h-[96px]"
          />
          <Image
            src={marquee2}
            alt="Marquee 2"
            className="w-full object-center h-[96px]"
          />
        </MarqueeWithIndicator>
      </div>
    </div>
  );
};

export default TransactionLastStage;
