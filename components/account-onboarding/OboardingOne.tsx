"use client";

import Image from "next/image";
import check from "@/public/assets/signin/accountcheck.png";
import { OnboardingList } from "@/lib/assets";
import { InfoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useBVNmanualOverlay } from "@/stores/overlay";

const OnboardingOne = () => {
  const { open, setOpen } = useBVNmanualOverlay();

  return (
    <div className="w-full max-w-[640px] bg-white lg:p-16 p-4   rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
      <div className="flex w-full flex-col gap-4 justify-center items-center">
        <Image src={check} className="h-16 object-center w-fit" alt="" />
        <div className="w-full text-center">
          <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-3xl  lg:text-4xl text-center font-sora font-bold  leading-[48px]">
            Verify your identity
          </h1>
          <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
            To comply with legal requirements, we need to verify <br /> your
            identity.
          </span>
        </div>
        {OnboardingList?.map((item, index) => (
          <div
            className=" lg:py-6 lg:px-8 px-4 py-4 bg-white  rounded-2xl border-[0.5] border-gray-100 w-full"
            key={`onboard-${index}`}
          >
            <div className="flex gap-4 items-center ">
              <Image
                src={item.image}
                alt=""
                className="h-10 w-10  object-center"
              />
              <span className=" text-[#474256] font-inter font-normal text-sm">
                {item.label}
              </span>
            </div>
          </div>
        ))}

        <div className="p-4 bg-[#FA92321A] flex gap-4 items-center w-full  mx-auto rounded-2xl">
          <InfoIcon className="h-4.5 text-[#FA9232]" />

          <div className="">
            <span className="font-inter text-[10px] font-normal text-[#474256]  leading-[16px]">
              You can proceed with either one now, but you will be required to
              provide the other for subsequent upgrade.
            </span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
          onClick={() => setOpen(true)}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default OnboardingOne;
