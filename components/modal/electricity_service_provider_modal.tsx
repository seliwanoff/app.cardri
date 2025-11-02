import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import React, { useState } from "react";
import {
  useBillPaymentOverlay,
  useBillStoreOverlay,
  usePaymentTypeChina,
} from "@/stores/overlay";
import { CheckCircle2Icon, CircleIcon, XIcon } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Image from "next/image";

const schema = yup.object().shape({
  bankName: yup.string().required(),
  accountName: yup.string().required(),
  accountNumber: yup
    .string()
    .required()
    .min(10, "Account number must be exactly 10 digits")
    .max(10, "Account number must be exactly 10 digits"),
});

interface PaymentModalProps {
  paymentList: any;
}

const ElectricityProviderModal = ({ paymentList }: PaymentModalProps) => {
  const { show, setShow, setPaymentDetails } = useBillStoreOverlay();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedId, setSelectedId] = useState();

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
    <Transition show={show}>
      <Dialog className="relative z-10" onClose={setShow}>
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
                    Service Provider
                  </DialogTitle>
                  <div
                    className="h-10.5 w-10.5 flex items-center justify-center rounded-[12px] border border-[#6C757D] cursor-pointer"
                    onClick={() => setShow(false)}
                  >
                    <XIcon color="#6C757D" />
                  </div>
                </div>

                {/* Added max height and scrollable container */}
                <div
                  className="flex flex-col gap-4 mt-8 max-h-[60vh] overflow-y-auto"
                  style={{
                    scrollbarWidth: "none" /* Firefox */,
                    msOverflowStyle: "none" /* IE/Edge */,
                  }}
                >
                  {/* Hide scrollbar for Webkit browsers */}
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>

                  {paymentList?.map((item: any, index: any) => (
                    <div
                      className="flex items-center justify-between py-5 px-4 bg-white rounded-[10px] cursor-pointer"
                      key={item.id}
                      onClick={() => {
                        setSelectedId(index);
                        setPaymentDetails(item);
                        setShow(false);
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <Image
                          src={item.image}
                          alt=""
                          className="w-8 h-8 object-center"
                        />
                        <span className="text-[#202020] font-normal font-inter text-base">
                          {item.label}
                        </span>
                      </div>
                      {index === selectedId ? (
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

export default ElectricityProviderModal;
