"use client";

import Image from "next/image";
import { ArrowRight, Check, ChevronRight, Info, InfoIcon } from "lucide-react";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import OTPInput from "react-otp-input";

import { cn } from "@/lib/utils";
import CountryConfirmingDialog from "@/components/modal/country-confirming-modal";
import { useEffect, useState } from "react";
import { addUrlParam } from "@/lib/urlParams";
import { useParams, useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CountryLisT } from "@/lib/assets";
import { FaSpinner } from "react-icons/fa";
import { Button } from "../ui/button";
import {
  sendPhoneNUmberVerification,
  verifyPhoneNumberUsedForRegistration,
} from "@/services/_request";
import { toast } from "sonner";
import { getCountryCode } from "@/misc";

const IsNotAvailable = () => {
  return (
    <div className="flex items-center justify-center bg-[#FAF7FF] text-primary-100 py-1.5 px-2 font-normal  text-[8px]  rounded-full">
      Coming Soon
    </div>
  );
};
type FormValues = {
  firstname: string;
  lastname: string;
  email: string;
  referral: string;
  number: string;
  country: string;
  password: string;
  password2: string;
};
const EmailVerify = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isLoading },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      referral: "",
      number: "",
      country: "",
      password: "",
      password2: "",
    },
  });

  const { step, setStep } = useAuthStep();
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const searchParams = useSearchParams();
  const number = searchParams.get("number") || "";
  const country = searchParams.get("country") || "";

  useEffect(() => {
    if (otp.length === 4) {
      onSubmit();
    }
  }, [otp]);

  const onSubmit = async () => {
    if (isLoading || isSubmitting) return;

    const toastId = toast.loading("Verfiying phone number");
    try {
      setIsSubmitting(true);

      await verifyPhoneNumberUsedForRegistration(otp);

      toast.success("Phone number verified succesfully.", { id: toastId });
      const updatedStep = step + 1;

      //
      addUrlParam("step", updatedStep.toString());

      setStep(updatedStep);
    } catch (error) {
      toast.error(
        //@ts-ignore
        error?.response.data.message ||
          "Something went wrong. Failed to verify phone number",
        {
          id: toastId,
        }
      );
    } finally {
      setIsSubmitting(false);
    }

    // setOpen(false);
  };

  const handleResendCode = async () => {
    const toastId = toast.loading("Generating new code..");
    try {
      await sendPhoneNUmberVerification();
      toast.success("Code resend succesfully", { id: toastId });
    } catch (error) {
      toast.error("Failed to resend code. Try again", { id: toastId });
    }
  };

  const maskEmail = (email: string): string => {
    if (!email || !email.includes("@")) return email; // Return as-is if invalid

    const [username, domain] = email.split("@");
    const maskedUsername =
      username.slice(0, 3) + "*".repeat(Math.max(0, username.length - 3));

    return `${maskedUsername}@${domain}`;
  };
  return (
    <div className="w-full max-w-[522px] flex flex-col gap-[42px]  justify-center items-center   lg:pt-32 pt-6 ">
      <div className="w-full text-center g:mt-0 mt-4">
        <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-2xl text-center lg:text-4xl  font-sora font-bold  leading-[48px]">
          Verify Phone Number
        </h1>
        <span className="text-base font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
          A four digits code has been sent to your number{" "}
          <span className="text-primary-100">
            {getCountryCode(country) + number}
          </span>{" "}
          , use it to complete your verification.
        </span>
      </div>

      <div className="w-full text-center">
        <form
          id="sign-up"
          className=" [&>label]:block flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="mx-auto flex justify-center md:max-w-[300px] w-full">
            <OTPInput
              value={otp}
              onChange={setOtp}
              numInputs={4}
              inputType="number"
              shouldAutoFocus
              inputStyle={cn(
                "w-[100%_!important] text-black font-bold font-sora text-[20px] rounded border border-[#E7E7E7] caret-main-100 h-[60px] bg-white outline-0 focus:border focus:border-primary-100 focus:border-opacity-55 focus:bg-[#F5F8FF]"
              )}
              containerStyle={{
                width: "100%",
                display: "grid",
                columnGap: "10px",
                gridTemplateColumns: "repeat(4, 1fr)",
              }}
              renderInput={(inputProps, index) => (
                <input
                  {...inputProps}
                  type="text"
                  inputMode="numeric"
                  onKeyDown={(e) => {
                    if (
                      !/[0-9]/.test(e.key) &&
                      e.key !== "Backspace" &&
                      e.key !== "Delete" &&
                      e.key !== "ArrowLeft" &&
                      e.key !== "ArrowRight"
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    const pastedData = e.clipboardData.getData("text/plain");
                    if (!/^\d+$/.test(pastedData)) {
                      e.preventDefault();
                    }
                  }}
                />
              )}
            />
          </div>

          <div className="p-4 flex justify-center items-center">
            <span className="text-[14px] font-inter font-normal  text-[#474256]">
              Didn’t Receive OTP?{" "}
              <span
                className="text-primary-100 cursor-pointer"
                onClick={handleResendCode}
              >
                Resend
              </span>{" "}
            </span>
          </div>
          <Button
            disabled={isLoading || isSubmitting}
            type="submit"
            className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
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
  );
};

export default EmailVerify;
