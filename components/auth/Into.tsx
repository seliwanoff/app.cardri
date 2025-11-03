"use client";

import Image from "next/image";
import { Check, ChevronRight, Info, InfoIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import CountryConfirmingDialog from "@/components/modal/country-confirming-modal";
import { useState } from "react";
import { addUrlParam } from "@/lib/urlParams";
import { useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";
import { CountryLisT } from "@/lib/assets";

const IsNotAvailable = () => {
  return (
    <div className="flex items-center justify-center bg-[#FAF7FF] text-primary-100 py-1.5 px-2 font-normal  text-[8px]  rounded-full">
      Coming Soon
    </div>
  );
};
const Intro = () => {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    label: "",
    image: "",
  });

  const { step, setStep } = useAuthStep();

  const searchParams = useSearchParams();

  const countryParams = searchParams.get("country") || "";

  const handleCountrySelect = () => {
    const updatedStep = step + 1;

    addUrlParam("country", selectedCountry.label);
    addUrlParam("step", updatedStep.toString());

    setStep(updatedStep);
    setOpen(false);
  };
  return (
    <div className="w-full max-w-[522px] flex flex-col gap-[42px] justify-center items-center lg:mt-0 mt-4 ">
      <div className="w-full text-center">
        <h1 className="text-secondary-500  text-center md:text-3xl sm:text-2xl text-3xl  lg:text-4xl  font-sora font-bold  leading-[48px]">
          Get started with your region
        </h1>
        <span className="text-[22px] text-center font-normal font-inter  text-[#464646] leading-[28px] mt-4 inline-block">
          Please select your country
        </span>
      </div>

      <div className="flex flex-col gap-[16px] w-full">
        {CountryLisT?.map((country, index) => (
          <div
            onClick={() => {
              setOpen(true);
              //@ts-ignore
              setSelectedCountry(country);
            }}
            className={cn(
              " py-[20px] px-[24px] rounded-2xl max-w-[436px] w-full cursor-pointer  flex  gap-4 mx-auto justify-between items-center ",
              country.isAvailable
                ? "bg-white cursor-pointer"
                : "cursor-not-allowed bg-white opacity-50"
            )}
            key={"country" + index}
          >
            <div className="flex gap-4 items-center">
              <Image
                src={country.image}
                alt={country.label}
                className="h-4.5 object-center w-[26px]"
              />
              <span className="font-inter font-normal text-[16px] text-[#202020]">
                {country.label}
              </span>
            </div>
            {country.isAvailable ? (
              typeof countryParams === "string" && countryParams !== "" ? (
                <Check className="h-4.5 w-4.5 text-green-500" />
              ) : (
                <ChevronRight className="h-4.5 w-4.5 text-[#B4ACCA]" />
              )
            ) : (
              <IsNotAvailable />
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-[#FA92321A] flex gap-4 items-center w-full max-w-[442px] mx-auto rounded-2xl">
        <InfoIcon className="h-4.5 text-[#FA9232]" />

        <div className="">
          <h2 className="font-inter text-xs font-bold text-[#474256] ">
            Kindly note
          </h2>
          <span className="font-inter text-xs font-normal text-[#474256]  ">
            The documents you can use for verification depend only on your
            selected country of residence. Please double-check your choice.
          </span>
        </div>
      </div>
      <div className="flex  items-center justify-center w-full">
        <span className="text-[16px] font-sora font-normal text-[#464646]">
          Got an account?
        </span>
        &nbsp;
        <span className="text-primary-100 font-bold font-sora text-[16px] cursor-pointer">
          {" "}
          Sign in
        </span>
      </div>

      {/*** COUNTRY CONFIRMING MODAL */}

      <CountryConfirmingDialog
        //@ts-ignore
        label={selectedCountry?.label}
        action={handleCountrySelect}
        //@ts-ignore
        image={selectedCountry?.image}
        setOpen={setOpen}
        open={open}
      />
    </div>
  );
};

export default Intro;
