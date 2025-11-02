import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React from "react";

import {
  useDeviceBindingOverlay,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import DeviceBindingWidget from "../widget/device-binding-widget";
import TransactionPinWidget from "../widget/transaction_pin_widget";
import { X } from "lucide-react";

const TransactionPinModal = () => {
  const { open, setOpen } = useTransactionPinOverlay();

  return (
    <Transition show={open}>
      <Dialog className="relative z-10" onClose={setOpen}>
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
              <DialogPanel className="relative w-full lg:min-h-auto min-h-[calc(100vh-140px)] transform lg:rounded-[42px] bg-[#F5F2FB] lg:px-[42px]  pt-5 text-left lg:pb-[64px] shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[526px] sm:p-6">
                <div className="w-full justify-between items-center ">
                  <div className="flex w-full justify-between items-center mb-12 px-4">
                    <div
                      className="flex items-center justify-center rounded-[12px]font-sora font-bold text-xl "
                      // onClick={() => router.back()}
                    >
                      Confirm Payment
                    </div>

                    <div
                      className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                      onClick={() => setOpen(false)}
                    >
                      <X color="#6C757D" />
                    </div>
                  </div>
                </div>
                <TransactionPinWidget />
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TransactionPinModal;
