import { numberWithCommas } from "@/helper";
import Image from "next/image";
import { title } from "process";

interface dashboardProps {
  title: string;
  balance: string;
  currency: string;
  label: string;
  image: string;
  ledger: string;
}

const Cards = ({
  title,
  balance,
  currency,
  label,
  image,
  ledger,
}: dashboardProps) => {
  return (
    <div className="basis-[324px] flex-grow flex-shrink-0  lg:py-10.5 py-9 lg:px-6 px-4 flex w-full gap-4 border rounded-[16px] border-[#FAF7FF]">
      <Image src={image} alt="" className="w-17 h-17" />

      <div className="flex flex-col gap-2">
        <span className="font-inter font-normal text-sm text-[#333951]">
          {label}
        </span>
        <div className="flex flex-col gap-3">
          <h2 className="font-bold text-[#333951] text-[24px] font-sora">
            {currency}
            {numberWithCommas(balance)}
          </h2>
          <span className="text-[#B4ACCA] fotn-normal font-inter text-[10px] ">
            Ledger Balance: {currency}
            {numberWithCommas(ledger)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Cards;
