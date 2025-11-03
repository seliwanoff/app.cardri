import Image from "next/image";
import check from "@/public/assets/signin/accountcheck.png";
import { Button } from "../ui/button";
import { FaSpinner } from "react-icons/fa";
import { useState } from "react";
import { useRouter } from "next/navigation";
interface AccountVerificationProps {
  datas?: any;
}
const AccountVerification = ({ datas }: AccountVerificationProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const action = () => {
    router.push(
      `/account-verification-onboarding?step=1&email=${
        datas?.email || "olagunjuseim2019@gmail.com"
      }`
    );
  };
  return (
    <div className="flex flex-col gap-16 items-center justify-center w-full  max-w-[496px] lg:mt-0 mt-10">
      <div className="w-full text-center">
        <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-3xl text-center lg:text-4xl  font-sora font-bold  leading-[48px]">
          Verify your identity
        </h1>
        <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
          To comply with legal requirements, we need to verify <br /> your
          identity.
        </span>
      </div>

      <div>
        <Image
          src={check}
          alt="Account check"
          className="lg:h-[196px]  object-center w-fit"
        />
      </div>

      <div className="flex items-center flex-col gap-6  w-full">
        <Button
          type="button"
          className="w-full h-[60px]  bg-[#FFFFFF] text-[14px] text-primary-100 cursor-pointer font-inter font-[600]"
        >
          Skip
        </Button>
        <Button
          type="button"
          className="w-full h-[60px] rounded-xl cursor-pointer bg-primary-100 text-white font-inter font-medium text-[14px]  flex justify-center items-center"
          onClick={action}
        >
          {isSubmitting ? (
            <FaSpinner className="animate-spin text-white" />
          ) : (
            `Proceed to Verification`
          )}
        </Button>
      </div>
    </div>
  );
};

export default AccountVerification;
