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
  useLoadingSpinOverlay,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import DeviceBindingWidget from "../widget/device-binding-widget";
import TransactionPinWidget from "../widget/transaction_pin_widget";
import { Loader2Icon, X } from "lucide-react";

const LoaderModal = () => {
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();

  return (
    <Transition show={openLoader}>
      <Dialog className="relative z-10" onClose={setOpenLoader}>
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
          <div className="flex min-h-full items-end justify-center overflow-hidden p-4 text-center sm:items-center sm:p-0">
            <TransitionChild
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <DialogPanel>
                <div className="w-full h-full justify-center items-center">
                  <Loader2Icon
                    className="animate-spin text-white "
                    size={100}
                  />
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoaderModal;
