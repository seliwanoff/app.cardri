import { billPaymentList, sendMoneyList } from "@/lib/assets";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const BillPaymentWidget = () => {
  const router = useRouter();
  return (
    <div
      className="flex flex-col gap-6 h-96  overflow-y-auto mt-4"
      style={{
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      {billPaymentList?.map((item, index) => (
        <div
          key={index}
          className={cn(
            " py-[20px] px-[24px] rounded-2xl w-full cursor-pointer  flex  gap-4 mx-auto justify-between items-center   bg-white "
          )}
          onClick={() => router.push(item.link)}
        >
          <div className="flex gap-4 items-center">
            <Image
              src={item.image}
              alt={""}
              className="h-12 object-center w-12"
            />

            <div>
              <h2 className="text-[#07052A] text-base font-semibold font-inter">
                {item.label}
              </h2>
              <span className="font-inter font-normal text-[12px] text-[#474256]">
                {item.description}
              </span>
            </div>
          </div>

          <ChevronRight className="h-4.5 w-4.5 text-[#B4ACCA]" />
        </div>
      ))}
    </div>
  );
};

export default BillPaymentWidget;
