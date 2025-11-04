"use client";

import Image from "next/image";
import check from "@/public/assets/signin/accountcheck.png";
import { OnboardingList } from "@/lib/assets";
import { InfoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { useBVNmanualOverlay } from "@/stores/overlay";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import { FaSpinner } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";
import BvnWidget from "../widget/bvn-widget";
import DojahWidget from "../widget/dojah-widget";
import Script from "next/script";
import { toast } from "sonner";

type FormValues = {
  bvn: string;
};
const OnboardingTwo = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isLoading },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      bvn: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startVerification, setStartVerification] = useState(false);
  const [connects, setConnect] = useState<any>(null);

  const searchParams = useSearchParams();

  const router = useRouter();

  const options = {
    app_id: process.env.NEXT_PUBLIC_DOJAH_APPID,
    p_key: process.env.NEXT_PUBLIC_DOJAH_API_KEY,
    type: "custom",
    user_data: {
      email: searchParams.get("email"),
    },
    gov_data: {
      bvn: watch("bvn"),
    },

    config: {
      widget_id: process.env.NEXT_PUBLIC_DOJAH_WIDGET_ID,
    },
    onSuccess: function (response: any) {
      console.log("Success", response);
      toast.success("BVN Verification Successful");
      router.push("/dashboard/root");
    },
    onError: function (err: any) {
      console.log("Error", err);
    },
    onClose: function () {
      console.log("Widget closed");
    },
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isLoading || isSubmitting) return;

    const connect = new window.Connect(options);

    connect.setup();
    connect.open();

    // router.push("/dashboard/root");

    //  console.log(data);

    try {
      setIsSubmitting(true);
    } catch (e) {
      console.log(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full max-w-[640px] bg-white lg:p-16 p-4   rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
        <div className="flex w-full flex-col gap-4 justify-center items-center">
          <Image src={check} className="h-16 object-center w-fit" alt="" />

          <div className="w-full text-center">
            <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-2xl  lg:text-4xl text-center font-sora font-bold  leading-[48px]">
              BVN Verification
            </h1>
            <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
              Your provided details helps us provide you with our <br />{" "}
              personalized bank account for wallet funding.
            </span>
          </div>
          <form
            id="sign-up"
            className=" [&>label]:block flex flex-col gap-6 mt-4 mb-4 w-full"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Label htmlFor="First name" className="flex flex-col gap-4">
              <span className="font-inter font-normal text-base text-label-100">
                BVN
              </span>

              <Input
                {...register("bvn", {
                  required: "BVN is required",
                  maxLength: {
                    value: 11,
                    message: "BVN must be 11 digits",
                  },
                  minLength: {
                    value: 11,
                    message: "BVN must be 11 digits",
                  },
                  pattern: {
                    value: /^[0-9]{11}$/,
                    message: "Only numbers (0-9) allowed",
                  },
                })}
                name="bvn"
                id="bvn"
                autoComplete="off"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="Enter your 11 digit BVN"
                className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#fff] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {errors.bvn && (
                <p className="text-xs text-red-500 mt-3">
                  {errors.bvn.message}
                </p>
              )}
            </Label>

            <div className="p-4 bg-[#FA92321A] flex gap-4 items-center w-full  mx-auto rounded-2xl">
              <InfoIcon className="h-4.5 text-[#FA9232]" />

              <div className="">
                <span className="font-inter text-[10px] font-normal text-[#474256]  leading-[16px]">
                  Dial <span className="text-[#FA9232]">*565*0#</span> on your
                  registered phone number to get your BVN
                </span>
              </div>
            </div>

            <Script
              src="https://widget.dojah.io/widget.js"
              strategy="lazyOnload"
              onLoad={() => console.log("Connect SDK loaded")}
            />
            {/** @ts-ignore */}
            <dojah-button
              widgetId="66fac6544c4c6929b5958116"
              text="Web"
              accesskey=""
              textColor="#FFFFFF"
              backgroundColor="#3977de"
            />
            <Button
              type="submit"
              className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              disabled={isLoading || isSubmitting}
            >
              {isSubmitting ? (
                <FaSpinner className="animate-spin text-white" />
              ) : (
                `Continue`
              )}
            </Button>
          </form>
        </div>
      </div>
      {/**** BVN VERIFICATION */}
      {startVerification && <BvnWidget />}
    </>
  );
};

export default OnboardingTwo;
