"use client";

import React from "react";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { Controller, Control, useForm } from "react-hook-form";

type PaymentMethodDetails = {
  label?: string;
  value?: string;
  image?: string;
};

interface PaymentMethodSelectorProps {
  control: Control<any>;
  paymentMethodDetails: PaymentMethodDetails;
  setShowMethod: (value: boolean) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  // control,
  paymentMethodDetails,
  setShowMethod,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<any>({
    defaultValues: {
      narration: "",
      amount: "",
      purpose: "",
      type: "",
    },
  });
  return (
    <div>
      <label
        htmlFor="Bank"
        className="font-inter font-normal text-base text-label-100"
      >
        Payment method
      </label>

      {paymentMethodDetails.label !== undefined ? (
        <div
          className="mt-4 mb-4 py-[10px] px-4 bg-[#FAF7FF] border border-[#EFD1DC] rounded-[10px] flex gap-[10px] items-center justify-between cursor-pointer"
          onClick={() => setShowMethod(true)}
        >
          <div className="flex gap-[10px] items-center">
            {paymentMethodDetails.image && (
              <Image
                src={paymentMethodDetails.image}
                alt={paymentMethodDetails.label || "payment-method"}
                className="w-10.5 h-10.5"
                width={40}
                height={40}
              />
            )}
            <span className="text-[#07052A] font-normal text-base font-inter">
              {paymentMethodDetails.label}
            </span>
          </div>
          <ChevronDown size={20} />
        </div>
      ) : (
        <Controller
          name={"type"}
          control={control}
          render={({ field: { onChange, value } }) => (
            <button
              onClick={() => {
                setShowMethod(true);
                if (paymentMethodDetails?.value) {
                  onChange(paymentMethodDetails.value);
                }
              }}
              type="button"
              className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
            >
              {value ? value : "Payment Method"}

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>
          )}
        />
      )}
    </div>
  );
};

export default PaymentMethodSelector;
