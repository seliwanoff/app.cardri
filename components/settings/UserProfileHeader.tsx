import { ChevronRight, Copy, Share2 } from "lucide-react";
import Avater from "@/public/assets/avater/avater5.png";
import Image from "next/image";

export const UserProfileHeader = () => {
  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white py-10.5 rounded-3xl  border border-gray-100">
      {/* Avatar */}
      <div className="max-w-[529px] w-full mx-auto flex flex-col gap-10   justify-center">
        {/* Info */}
        <div className="flex justify-between items-center ">
          <div className="flex gap-10 items-center">
            <Image
              src={Avater}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Adeeyo Ayinde
              </h2>
              <p className="text-gray-500">@creativebits</p>

              <span className="flex items-center gap-1 text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                <span className="text-blue-500">✔</span> Tier 1
              </span>
            </div>
          </div>

          <button className="ml-3 bg-[#FA92321A] text-amber-700 h-[50px] gap-8 px-[8px] rounded-full text-sm font-medium w-full max-w-[142px] flex justify-center items-center">
            <span>Upgrade</span> <ChevronRight />
          </button>
        </div>

        {/* Account Info */}
        <div className="flex  items-center gap-8  justify-center -ml-5">
          <div className="bg-gray-50 rounded-lg px-4 py-2.5 text-start ">
            <p className="text-xs text-gray-500">9PSB</p>
            <p className="font-semibold text-gray-800">0123456789</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Copy size={16} />
            </button>
            <button className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <Share2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
