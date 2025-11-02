import React, { useState } from "react";
import { Controller } from "react-hook-form";
import { Check, ChevronsUpDown, SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import bankLogo from "@/public/assets/beneficiary/world.png";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useBankModal, useCountryModal } from "@/stores/overlay";

interface BankOption {
  value: string;
  bankName?: string;
  bankCode?: string;
  label: string;
  iso: string;
  country: string;
  image: string;
}

interface CountryAutoCompleteProps {
  control: any;
  name: string;
  label: string;
  bankList: BankOption[];
  error?: boolean;
  required?: boolean;
  image?: string;
}

export function CountryAutoComplete({
  control,
  name,
  label,
  bankList,
  error,
  required,
}: CountryAutoCompleteProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { open, setOpen, setCountryDetails } = useCountryModal();

  const filteredBanks = bankList?.filter((bank) =>
    //@ts-ignore
    bank?.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  //console.log(filteredBanks);

  return (
    <div className="flex flex-col space-y-1.5">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild></PopoverTrigger>

            <div className="py-[15px] pl-4 pr-2.5 mb-4 mt-4 bg-white  rounded-[12px]  flex gap-4 items-center ">
              <SearchIcon className="h-4 w-4 text-primary-100" />
              <input
                type="text"
                placeholder="Search country..."
                className="w-full rounded border-0 p-2 bg-white outline-0 "
                onChange={(e) => setSearchTerm(e.target.value)}
                value={searchTerm}
              />
            </div>
            <div className="max-h-[500px] flex flex-col gap-2 overflow-y-scroll">
              {filteredBanks?.map((bank) => (
                <div
                  key={bank.value}
                  className={cn(
                    "flex gap-6 cursor-pointer text-[14px] bg-white py-[20px] px-[16px] rounded-[12px] items-center   text-[#202020] font-inter font-normal",
                    field.value === bank.iso || (bank.country && "bg-blue-100")
                  )}
                  onClick={() => {
                    setCountryDetails(bank);
                    field.onChange(bank.iso);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {/** @ts-ignore */}
                  <Image
                    src={bank.image || bankLogo}
                    //@ts-ignore
                    alt={bank.country}
                    className="h-6 w-6"
                  />
                  {bank.country}
                </div>
              ))}
            </div>
          </Popover>
        )}
      />
    </div>
  );
}
