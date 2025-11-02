import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React from "react";
import { CheckCircle2Icon, CircleIcon, XIcon } from "lucide-react";
import Image from "next/image";
import NGN from "@/public/assets/currencies/NGNCurrency.png";
import USD from "@/public/assets/currencies/DollarCurrency.png";
import GBP from "@/public/assets/currencies/PoundsCurrency.png";
import EUR from "@/public/assets/currencies/EurCurrency.png";

interface CurrencyModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onSelect: (currency: string) => void;
  currentCurrency: string;
}

const CurrencyModal = ({
  show,
  setShow,
  onSelect,
  currentCurrency,
}: CurrencyModalProps) => {
  const currencies = [
    {
      code: "NGN",
      id: 1,
      image: NGN,
      label: "Naira",
    },
    {
      code: "USD",
      id: 2,
      image: USD,
      label: "Dollar",
    },
    {
      code: "EUR",
      id: 3,
      image: EUR,
      label: "Euro",
    },
    {
      code: "GBP",
      id: 4,
      image: GBP,
      label: "Pounds",
    },
  ];

  const handleCurrencySelect = (currencyCode: string) => {
    onSelect(currencyCode);
    setShow(false);
  };

  return (
    <Transition show={show}>
      <Dialog className="relative z-10" onClose={() => setShow(false)}>
        <TransitionChild
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 opacity-70 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center overflow-hidden lg:p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel className="relative transform w-full lg:rounded-[30px] bg-[#F5F2FB] px-4 pb-4 pt-5 text-left lg:pl-[30px] lg:pb-[30px] lg:pr-[30px] shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[526px] sm:p-6">
                <div className="flex w-ful items-center justify-between gap-4">
                  <DialogTitle className="text-[20px] font-sora font-bold text-[#07052A]">
                    Select Currency
                  </DialogTitle>
                  <div
                    className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                    onClick={() => setShow(false)}
                  >
                    <XIcon color="#6C757D" />
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-8">
                  {currencies.map((currency) => (
                    <div
                      className="flex items-center justify-between py-5 px-4 bg-white rounded-[10px] cursor-pointer hover:bg-gray-50"
                      key={currency.id}
                      onClick={() => handleCurrencySelect(currency.code)}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={currency.image}
                          alt={currency.label}
                          className="w-8 h-8 object-center"
                        />
                        <div>
                          <span className="text-[#202020] font-normal font-inter text-base">
                            {currency.label}
                          </span>
                          <span className="text-[#6C757D] text-sm ml-2">
                            ({currency.code})
                          </span>
                        </div>
                      </div>
                      {currency.code === currentCurrency ? (
                        <CheckCircle2Icon size={18} color="#1FBA79" />
                      ) : (
                        <CircleIcon color="#B4ACCA" size={18} />
                      )}
                    </div>
                  ))}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CurrencyModal;
