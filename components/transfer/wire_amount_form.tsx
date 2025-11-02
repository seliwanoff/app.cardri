"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveMinus, CloseCircle } from "iconsax-react";
import {
  ArrowLeft,
  CheckCheckIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  InfoIcon,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Switch from "react-switch";
import bankLogo from "@/public/assets/avater/avatar1.png";
import rateLogo from "@/public/assets/beneficiary/exchange.png";
import feeLogo from "@/public/assets/beneficiary/fee.png";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import {
  useBankModal,
  useLoadingSpinOverlay,
  usePaymentMethodOverlay,
  useTransactionPinOverlay,
  useWireBeneficiaryDetailsOverlay,
} from "@/stores/overlay";
import {
  createWirepayment,
  getBanks,
  resolveAccountInfo,
} from "@/services/bank";
import BankModal from "@/components/modal/bankModal";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import { addUrlParam, updateUrlParams } from "@/lib/urlParams";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { currencySymbols } from "@/lib/misc";
import { numberWithCommas } from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import { getPurpose, getRate } from "@/services/lib";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import { verifyTransactionPin } from "@/services/_request";
import LoaderModal from "../modal/request_sending_modal";
import PaymentMethodSelector from "../paymentMethodSelector";

const WireAmountFrom = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const [isBankInfoLoad, setIsBankInfoLoad] = useState(false);
  const { beneficiaryDetalis } = useWireBeneficiaryDetailsOverlay();
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { data } = useManagementData();

  const [step, setstep] = useState(1);

  const [openDrawer, setOpenDrawer] = useState(false);

  const { otp, setOtp } = useTransactionPinOverlay();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();
  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();

  const {
    data: exchangeRate,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["exchangeRate"],
    queryFn: () => getRate({ from: beneficiaryDetalis.currency, to: "NGN" }),
    staleTime: 3000,
  });
  const { data: purposes } = useQuery({
    queryKey: ["purpose"], // Better key naming
    queryFn: getPurpose, // Correct: pass the function directly (no extra arrow)
    staleTime: 3000,
  });
  type FormValues = {
    narration: string;
    amount: string;
    purpose: string;
    type?: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      narration: "",
      amount: "",
      purpose: "",
      type: "",
    },
  });
  const [checked, setChecked] = useState(false);
  const { open, setOpen, bankDetails } = useBankModal();

  const [isLoadings, setIsLoading] = useState(false);

  const handleChange = (nextChecked: any) => {
    setChecked(nextChecked);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (paymentMethodDetails.value === undefined) {
      return toast.error("Please select a payment method");
    }
    setOpenDrawer(true);
  };
  useEffect(() => {
    if (!beneficiaryDetalis) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [beneficiaryDetalis]);

  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isLoadings || isLoading) return;
      try {
        if (otp && otp.length === 4) {
          const toastId = toast.loading("verifying pin..");
          await verifyTransactionPin(otp);

          toast.dismiss(toastId);

          setOpenLoader(true);
          const response = await createWirepayment({
            beneficiaryId: beneficiaryDetalis.id,
            purposeId: watch("purpose"),
            amount: watch("amount"),
            currencyfrom: "NGN",
            balanceType: paymentMethodDetails?.value,
            m: "web",
          });
          setstep(4);
          updateUrlParams({ step: "4" });
          setOpenDrawer(false);

          setOpen(false);
          setOtp("");

          //@ts-ignore
          addUrlParam("ref", response.data.ref);
          addUrlParam("status", "success");
        }
      } catch (e) {
        console.log(e);
        setOtp("");

        //@ts-ignore
        if (e?.response?.data.success === "false 1") {
          toast.error("Incorrect PIN");
        } else {
          //@ts-ignore
          toast.error(
            //@ts-ignore
            e?.response?.data.message ||
              "Could not complete transaction, try again"
          );
        }
      } finally {
        setOpenLoader(false);
      }
    };
    sendRequest();
  }, [otp]);

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();
    const { open, setOpen } = useTransactionPinOverlay();

    // console.log(beneficiaryDetalis);

    return (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="mx-auto max-w-[500px] bg-white rounded-tl-[24px] rounded-tr-[24px] border-0 focus-visible:outline-none">
          {/* Header */}
          <DrawerHeader className="relative bg-main-100 p-6 text-left text-white">
            <div className="mx-auto w-full max-w-[500px]">
              <DrawerTitle className="text-xl font-bold text-text-secondary-200 text-[20px] font-sora">
                Confirm Transaction
              </DrawerTitle>
            </div>
            <button
              onClick={() => setOpenDrawer(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#000]"
            >
              <X size={20} />
            </button>
          </DrawerHeader>

          {/* Body Content */}
          <div className="mx-auto w-full max-w-[614px] p-6">
            {/* Transaction Details */}
            <div className="space-y-4">
              <div className="w-full flex justify-center items-center">
                <h2 className="text-text-secondary-200 font-bold text-[32px] font-inter">
                  <sub>{currencySymbols(beneficiaryDetalis.currency)}</sub>
                  {numberWithCommas(watch("amount").replace(",", ""))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Amount in Naira:</span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {numberWithCommas(
                    parseFloat(watch("amount").replace(",", "")) *
                      parseFloat(exchangeRate?.rate)
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">National ID:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {beneficiaryDetalis && beneficiaryDetalis?.nationalId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {beneficiaryDetalis && beneficiaryDetalis.accountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">
                  {beneficiaryDetalis &&
                  beneficiaryDetalis.entity === "company" ? (
                    beneficiaryDetalis.companyName
                  ) : (
                    <>
                      {beneficiaryDetalis.firstName}{" "}
                      {beneficiaryDetalis.lastName}
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Fee:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    <sub>{currencySymbols(beneficiaryDetalis.currency)}</sub>
                    {numberWithCommas(data?.wirefee)}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Rate:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    1{currencySymbols(beneficiaryDetalis.currency)}={" "}
                    <sub> {currencySymbols("NGN")}</sub>
                    {numberWithCommas(exchangeRate?.rate)}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Sub total:</span>

              {loading ? (
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <div className="flex gap-2">
                  <span className="font-medium">
                    <sub>{currencySymbols(beneficiaryDetalis.currency)}</sub>
                    {numberWithCommas(
                      parseFloat(watch("amount").replace(",", "")) +
                        parseFloat(data?.wirefee)
                    )}
                  </span>
                  <span>&asymp;</span>
                  <span className="font-medium">
                    <sub>{currencySymbols("NGN")}</sub>
                    {numberWithCommas(
                      parseFloat(
                        //@ts-ignore
                        parseFloat(watch("amount").replace(",", "")) +
                          parseFloat(data?.wirefee)
                      ) * parseFloat(exchangeRate?.rate)
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-3 items-center">
              <button
                onClick={() => setOpenDrawer(false)}
                className=" rounded-lg border border-gray-300 h-[60px] flex justify-center items-center  px-3  w-fit min-w-[120px] font-medium text-gray-700"
              >
                Cancel
              </button>
              <Button
                onClick={() => {
                  setOpenDrawer(false);
                  setOpen(true);
                }}
                className="w-full rounded-xl cursor-pointer  bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              >
                Confrim
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <div className="w-full mt-4">
      <div
        className="h-[calc(100vh-125px)] w-full flex flex-col-reverse overflow-auto "
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="w-full max-w-[640px] mx-auto   rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
          <div className="flex w-full flex-col gap-4 justify-center items-center">
            <div className="w-full text-center">
              <h1 className="text-secondary-500 text-[32px] text-center font-sora font-bold  leading-[48px]">
                Wire Transfer
              </h1>
              <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-2 inline-block">
                Select a previous or send to a new recipient
              </span>
            </div>
          </div>

          <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6">
            <form
              id="sign-up"
              className=" [&>label]:block flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <div className="py-[10px] px-4 bg-[#fff] border border-[#FAF7FF] rounded-[10px] flex gap-[10px] items-center justify-between">
                  <div className="flex gap-[10px] items-center">
                    <Image src={bankLogo} alt={""} className="w-10.5 h-10.5" />

                    <div>
                      <h3 className="text-[#07052A] font-bold font-sora  text-[20px]">
                        {/***@ts-ignore */}

                        {beneficiaryDetalis &&
                        beneficiaryDetalis.entity === "company" ? (
                          beneficiaryDetalis.companyName
                        ) : (
                          <>
                            {beneficiaryDetalis.firstName}{" "}
                            {beneficiaryDetalis.lastName}
                          </>
                        )}
                      </h3>

                      <div className="text-[#474256] font-normal font-inter text-[14px]">
                        <span className="text-[#474256] font-normal font-inter text-[14px]">
                          {beneficiaryDetalis?.currency}
                        </span>{" "}
                        &nbsp;
                        {
                          <span className="text-[#474256] font-normal font-inter text-[14px]">
                            {/***@ts-ignore */}
                            {beneficiaryDetalis?.accountNumber}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <Label htmlFor="amount" className="flex flex-col gap-4 w-full">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount
                  </span>
                  <Input
                    {...register("amount", {
                      required: "Amount is required",
                      validate: (value) => {
                        const numValue = parseFloat(value.replace(/,/g, ""));
                        if (isNaN(numValue))
                          return "Please enter a valid number";
                        if (numValue <= 0)
                          return "Amount must be greater than 0";
                        return true;
                      },
                    })}
                    name="amount"
                    id="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount (e.g., 1,000,000)"
                    className="h-full py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    onChange={(e) => {
                      const { value, selectionStart } = e.target;

                      // Remove all non-digit characters (keep numbers & decimal)
                      const rawValue = value.replace(/[^0-9.]/g, "");

                      // Split into parts (for decimal handling)
                      const parts = rawValue.split(".");
                      const integerPart = parts[0];
                      const decimalPart = parts[1] ? `.${parts[1]}` : "";

                      // Format integer part with commas
                      const formattedInteger = integerPart.replace(
                        /\B(?=(\d{3})+(?!\d))/g,
                        ","
                      );

                      // Combine formatted integer + decimal (if any)
                      const formattedValue = formattedInteger + decimalPart;

                      // Update input value
                      e.target.value = formattedValue;

                      // Only adjust cursor if selectionStart is not null
                      if (selectionStart !== null) {
                        const commaCount = (formattedValue.match(/,/g) || [])
                          .length;
                        const originalCommaCount = (
                          value.substring(0, selectionStart).match(/,/g) || []
                        ).length;
                        const cursorOffset = commaCount - originalCommaCount;
                        const newCursorPosition = selectionStart + cursorOffset;

                        // Use setTimeout to ensure the cursor update happens after React's state update
                        setTimeout(() => {
                          e.target.setSelectionRange(
                            newCursorPosition,
                            newCursorPosition
                          );
                        }, 0);
                      }
                    }}
                  />
                  {errors.amount && (
                    <p className="text-xs text-red-500 ">
                      {errors.amount.message}
                    </p>
                  )}
                </Label>

                <div className="flex flex-col gap-4">
                  <label htmlFor="purpose" className="...">
                    Purpose
                  </label>
                  <Controller
                    name="purpose"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger
                          className="h-full py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                          aria-describedby="purpose-error"
                        >
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50 font-inter font-medium text-base border-0">
                          {purposes?.documentTypes?.map(
                            (pur: { id: number; title: string }) => (
                              <SelectItem
                                key={pur.id}
                                value={pur.id.toString()}
                              >
                                {pur.title}
                              </SelectItem>
                            )
                          ) || []}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.purpose && (
                    <p id="purpose-error" className="text-xs text-red-500">
                      {errors.purpose.message}
                    </p>
                  )}
                </div>

                <Label htmlFor="Email" className="flex flex-col gap-4 ">
                  <span className="font-inter font-normal text-base text-label-100">
                    Narration
                  </span>
                  <Input
                    {...register("narration")}
                    name="id"
                    id="id"
                    type="text"
                    //   inputMode="numeric"
                    //   maxLength={10}
                    placeholder="Enter narration"
                    className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {errors.narration && (
                    <p className="text-xs text-red-500 mt-3">
                      {errors.narration.message}
                    </p>
                  )}
                </Label>
              </div>

              <div className="flex justify-between items-center ">
                <span className="font-normal text-base text-text-secondary-200 font-inter">
                  Save as Favourite?
                </span>
                <Switch
                  checked={checked}
                  onChange={handleChange}
                  onColor="#D70D4A"
                  onHandleColor="#2693e6"
                  handleDiameter={15}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={38}
                  className="react-switch "
                  id="material-switch"
                />
              </div>

              <div className="flex items-center gap-6 justify-between">
                <div className="flex items-center p-4 gap-6">
                  <Image
                    src={rateLogo}
                    alt="rate"
                    className="w-7 h-7 object-center"
                  />

                  <span className="text-[#07052A] font-inter font-normal text-sm">
                    Rate: 1{currencySymbols(beneficiaryDetalis.currency)}={" "}
                    {currencySymbols("NGN")}
                    {numberWithCommas(exchangeRate?.rate)}
                  </span>
                </div>

                <div className="flex items-center p-4 gap-6">
                  <Image
                    src={feeLogo}
                    alt="rate"
                    className="w-7 h-7 object-center"
                  />

                  <span className="text-[#07052A] font-inter font-normal text-sm">
                    {currencySymbols(beneficiaryDetalis.currency)}
                    {numberWithCommas(data?.wirefee)}
                  </span>
                </div>
              </div>
              <PaymentMethodSelector
                control={control}
                paymentMethodDetails={paymentMethodDetails}
                setShowMethod={setShowMethod}
              />

              <Button
                disabled={isSubmitting || isLoading || isLoadings}
                className="w-full rounded-xl mb-20 cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              >
                Continue
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/*** BANK MODAL */}

      <ConfirmDrawer
        receiverAccountInfo={userAccountInfo}
        amount={amount}
        narration={narration}
      />

      <TransactionPinModal />
      <LoaderModal />
    </div>
  );
};

export default WireAmountFrom;
