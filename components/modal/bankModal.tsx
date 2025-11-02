import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React, { useState } from "react";

import {
  useBankModal,
  useDeviceBindingOverlay,
  useSendMoneyModalOverlay,
} from "@/stores/overlay";
import DeviceBindingWidget from "../widget/device-binding-widget";
import { XIcon } from "lucide-react";
import SendMoneyWidget from "../widget/send-money-widget";
import { BankAutocomplete } from "../widget/bankAutoComplete";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
  // currency: yup.string().required(),
  bankName: yup.string().required(),
  accountName: yup.string().required(),
  accountNumber: yup
    .string()
    .required()
    .min(10, "Account number must be exactly 10 digits")
    .max(10, "Account number must be exactly 10 digits"),
});
interface BankListprops {
  bankList: any;
}
const BankModal = ({ bankList }: BankListprops) => {
  const { open, setOpen } = useBankModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });
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
              <DialogPanel className="relative  lg:h-auto  w-full  min-h-[calc(100vh-120px)] transform lg:rounded-[30px] bg-[#F5F2FB] px-4 pb-4 pt-5 text-left lg:pl-[30px] lg:pb-[30px] lg:pr-[30px] shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[526px] sm:p-6">
                <div className="flex w-ful items-center  justify-between gap-4">
                  <DialogTitle className="text-[20px] font-sora font-bold text-[#07052A]">
                    Select Bank
                  </DialogTitle>
                  <div
                    className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                    onClick={() => setOpen(false)}
                  >
                    <XIcon color="#6C757D" />
                  </div>
                </div>
                <form
                  id="add_beneficiary"
                  // onSubmit={handleSubmit(onAddBeneficiary)}
                  className="space-y-6"
                >
                  <BankAutocomplete
                    control={control}
                    name="bankName"
                    label="Bank Name"
                    bankList={bankList}
                    error={!!errors.bankName}
                    required
                  />
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default BankModal;
