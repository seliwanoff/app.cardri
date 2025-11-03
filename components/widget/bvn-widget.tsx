import Image from "next/image";
import { Button } from "../ui/button";
import check from "@/public/assets/oboarding/accountcheck2.png";
import { useBVNmanualOverlay } from "@/stores/overlay";
import { addUrlParam } from "@/lib/urlParams";

const BvnWidget = () => {
  const { setOpen } = useBVNmanualOverlay();
  return (
    <>
      {" "}
      <div>
        <div className="mt-3 text-center sm:mt-5">
          <div className="mt-2 flex flex-col gap-6 justify-center items-center">
            <div className="rounded-full bg-[#fff] absolute -top-[50px] h-[110px] w-[110px] flex justify-center items-center">
              <Image
                src={check}
                alt={""}
                className="h-[110px] w-[110px] rounded-full "
              />
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-3xl  lg:text-4xl text-center font-sora font-bold  leading-[48px]">
                Manual Verification
              </h1>
              <span className="text-[14px] font-normal font-inter text-left  text-[#464646] leading-[28px] mt-4 inline-block">
                Your BVN will be verified manually as well as live face check
                for identity clarification purpose. This will helps us provide
                you with our personalized bank account for wallet funding.
              </span>
              <ul className="font-inter font-normal text-[14px] text-label-100 text-left list-disc ml-5">
                <li>BVN Verification</li>
                <li>Liveness Face Check</li>
                <li>Government issued ID card</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 flex items-center flex-col gap-6 sm:mt-6 w-full">
        <Button
          type="button"
          className="w-full h-[50px] rounded-xl cursor-pointer bg-primary-100 text-white font-inter font-medium text-[14px]  flex justify-center items-center"
          onClick={() => {
            addUrlParam("step", "2");
            setOpen(false);
          }}
        >
          Continue
        </Button>
        <Button
          type="button"
          className="w-full h-[50px]  bg-[#FAF7FF] text-[14px] text-[#464646] cursor-pointer font-inter font-[600]"
          onClick={() => {
            setOpen(false);
            //  removeUrlParam("country");
          }}
        >
          Go back
        </Button>
      </div>
    </>
  );
};

export default BvnWidget;
