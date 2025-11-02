import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React from "react";

import {
  useBillModalOverlay,
  useDeviceBindingOverlay,
  useSendMoneyModalOverlay,
} from "@/stores/overlay";
import DeviceBindingWidget from "../widget/device-binding-widget";
import { XIcon } from "lucide-react";
import SendMoneyWidget from "../widget/send-money-widget";
import BillPaymentWidget from "../widget/bill-payment-widget";

const BillModal = () => {
  const { openBill, setOpenBill } = useBillModalOverlay();

  return (
    <Transition show={openBill}>
      <Dialog className="relative z-10" onClose={setOpenBill}>
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
              <DialogPanel className="relative transformw-full lg:rounded-[30px] bg-[#F5F2FB] px-4 pb-4 pt-5 text-left lg:pl-[30px] lg:pb-[30px] lg:pr-[30px] shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[526px] sm:p-6">
                <div className="flex w-ful items-center  justify-between gap-4">
                  <DialogTitle className="text-[20px] font-sora font-bold text-[#07052A]">
                    Bill Payment
                  </DialogTitle>
                  <div
                    className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                    onClick={() => setOpenBill(false)}
                  >
                    <XIcon color="#6C757D" />
                  </div>
                </div>

                <BillPaymentWidget />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BillModal;
