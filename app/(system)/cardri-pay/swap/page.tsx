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
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FaExchangeAlt, FaSpinner } from "react-icons/fa";
import {
  useBankModal,
  useLoadingSpinOverlay,
  usePaymentMethodOverlay,
  usePaymentTypeChina,
  useTransactionPinOverlay,
  useWireBeneficiaryDetailsOverlay,
} from "@/stores/overlay";
import {
  createChinaPayment,
  createWirepayment,
  getBanks,
  resolveAccountInfo,
} from "@/services/bank";
import BankModal from "@/components/modal/bankModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { currencyImages, currencySymbols } from "@/lib/misc";
import { numberWithCommas } from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";

import { verifyTransactionPin } from "@/services/_request";
import { createPaymentLink } from "@/services/payment_link";
import LoaderModal from "@/components/modal/request_sending_modal";
import CurrencyModal from "@/components/modal/curency-modal";
import { getRate } from "@/services/lib";
import { swapRequest } from "@/services/swap";
import TransactionLastStage from "@/components/navigation/TransactionLastStage";

const SwapPage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});

  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { setOtp } = useTransactionPinOverlay();

  const { data: managementData } = useManagementData();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();
  const queryClient = useQueryClient();

  const [step, setstep] = useState(1);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [activeCurrencyField, setActiveCurrencyField] = useState<"from" | "to">(
    "from"
  );
  const [fromCurrency, setFromCurrency] = useState("NGN");
  const [toCurrency, setToCurrency] = useState("USD"); // Default to USD for demo

  const { otp } = useTransactionPinOverlay();

  type FormValues = {
    narration: string;
    fromAmount: string;
    toAmount: string;
    purpose: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
  } = useForm<FormValues>({
    defaultValues: {
      narration: "",
      fromAmount: "",
      toAmount: "",
      purpose: "",
    },
  });

  // Fetch exchange rate
  const {
    data: rateData,
    isLoading: isRateLoading,
    error: rateError,
  } = useQuery({
    queryKey: ["exchangeRate", fromCurrency, toCurrency, watch("fromAmount")],
    queryFn: async () => {
      if (!watch("fromAmount") || parseFloat(watch("fromAmount")) <= 0)
        return null;

      const amount = parseFloat(watch("fromAmount").replace(/,/g, ""));
      const response = await getRate({
        from: fromCurrency,
        to: toCurrency,
        amount,
      });

      return response;
    },
    enabled:
      !!fromCurrency &&
      !!toCurrency &&
      !!watch("fromAmount") &&
      parseFloat(watch("fromAmount")) > 0,
    refetchInterval: 60000,
    staleTime: 30000,
  });
  // console.log(rateData);

  useEffect(() => {
    if (rateData?.rate && watch("fromAmount")) {
      const amonutToReceive = parseFloat(
        //@ts-ignore
        parseFloat(watch("fromAmount").replaceAll(",", "")) *
          parseFloat(rateData.rate)
      );

      const formattedAmount = numberWithCommas(amonutToReceive.toFixed(2));
      setValue(
        "toAmount",
        formattedAmount //
        //@ts-ignore
      );
    }
  }, [rateData, watch("fromAmount"), setValue]);

  // Handle currency selection
  const handleCurrencySelect = useCallback(
    (currency: string) => {
      if (activeCurrencyField === "from") {
        setFromCurrency(currency);
      } else {
        setToCurrency(currency);
      }
      queryClient.invalidateQueries({ queryKey: ["exchangeRate"] });
      setShowCurrencyModal(false);
    },
    [activeCurrencyField, queryClient]
  );

  const openCurrencyModal = (field: "from" | "to") => {
    setActiveCurrencyField(field);
    setShowCurrencyModal(true);
  };

  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setValue("fromAmount", numberWithCommas(value));
        trigger("fromAmount");
      } else {
        setValue("fromAmount", "");
      }
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!rateData) {
      toast.error("Please wait for exchange rate to load");
      return;
    }
    setOpenDrawer(true);
  };

  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isRateLoading) return;
      try {
        if (otp && otp.length === 4) {
          await verifyTransactionPin(otp);

          const formData = new FormData();
          setOpenLoader(true);

          formData.append("currencyfrom", fromCurrency);

          formData.append("amount", watch("fromAmount").replaceAll(",", ""));
          const response = await swapRequest(formData);

          console.log(response);
          setstep(4);
          updateUrlParams({ step: "2" });
          setOpenDrawer(false);

          //    setOpen(false);
          setOtp("");

          addUrlParam("status", "success");
          //setPaymentDetails(null);
          //setPaymentMethodDetails(null);
        }
      } catch (e) {
        console.log(e);
        toast.error("An error occurred while processing your request");
      } finally {
        setOpenLoader(false);
        // setOpen(false);
      }
    };
    sendRequest();
  }, [otp]);
  // ... (keep existing useEffect hooks and other functions)

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const { open, setOpen } = useTransactionPinOverlay();

    return (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="mx-auto max-w-[500px] bg-white rounded-tl-[24px] rounded-tr-[24px] border-0 focus-visible:outline-none">
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

          <div className="mx-auto w-full max-w-[614px] p-6">
            <div className="space-y-4">
              <div className="w-full flex justify-center items-center">
                <h2 className="text-text-secondary-200 font-bold text-[32px] font-inter">
                  <sub>{currencySymbols(fromCurrency)}</sub>
                  {numberWithCommas(watch("fromAmount").replace(",", ""))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">You'll receive:</span>
                <span className="font-medium">
                  {currencySymbols(toCurrency)}
                  {numberWithCommas(watch("toAmount"))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Exchange rate:</span>
                <span className="font-medium">
                  1{currencySymbols(fromCurrency)} ={" "}
                  {rateData?.rate?.toFixed(6)} {currencySymbols(toCurrency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Fee:</span>
                <span className="font-medium">
                  {currencySymbols(fromCurrency)}
                  {numberWithCommas(managementData?.wirefee || 0)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex gap-3 items-center">
              <button
                onClick={() => setOpenDrawer(false)}
                className="rounded-lg border border-gray-300 h-[60px] flex justify-center items-center px-3 w-fit min-w-[120px] font-medium text-gray-700"
              >
                Cancel
              </button>
              <Button
                onClick={() => {
                  setOpenDrawer(false);
                  setOpen(true);
                }}
                className="w-full rounded-xl cursor-pointer bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              >
                Confirm
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
        className="h-[calc(100vh-125px)] w-full flex flex-col-reverse overflow-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <div className="w-full max-w-[640px] mx-auto rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
          <div className="flex w-full flex-col gap-4 justify-center items-center">
            <div className="w-full text-center">
              <h1 className="text-secondary-500 text-[32px] text-center font-sora font-bold leading-[48px]">
                Swap funds
              </h1>
              <span className="text-[14px] font-normal font-inter text-center text-[#464646] leading-[28px] mt-2 inline-block">
                Select a previous or send to a new recipient
              </span>
            </div>
          </div>

          <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6 p-[30px]">
            <form
              id="sign-up"
              className="[&>label]:block flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <Label htmlFor="fromAmount" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Swap from
                  </span>
                  <div className="flex items-center gap-6 bg-[#FAF7FF] rounded-[10px]">
                    <div
                      className="flex gap-1 items-center ml-2.5 bg-white p-2 rounded-[100px] cursor-pointer"
                      onClick={() => openCurrencyModal("from")}
                    >
                      <Image
                        src={currencyImages(fromCurrency)}
                        alt={fromCurrency}
                        className="w-6 h-6 object-center"
                      />
                      <span className="text-[#474256] font-inter text-base font-bold">
                        {currencySymbols(fromCurrency)}
                      </span>
                      <span className="block mr-4">
                        <ChevronDown color="#9292A0" className="h-6 w-6" />
                      </span>
                    </div>
                    <Input
                      {...register("fromAmount", {
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
                      name="fromAmount"
                      id="fromAmount"
                      type="text"
                      inputMode="numeric"
                      placeholder="0.00"
                      onChange={handleFromAmountChange}
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    />
                  </div>
                  {errors.fromAmount && (
                    <p className="text-xs text-red-500">
                      {errors.fromAmount.message}
                    </p>
                  )}
                </Label>

                <div className="flex gap-4 items-center w-full">
                  <div className="border border-[#B4ACCA66] w-full"></div>
                  <FaExchangeAlt
                    className="rotate-90"
                    size={24}
                    color="#B4ACCA66"
                  />
                  <div className="border border-[#B4ACCA66] w-full"></div>
                </div>

                <Label htmlFor="toAmount" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount to receive
                  </span>
                  <div className="flex items-center gap-6 bg-[#FAF7FF] rounded-[10px]">
                    <div
                      className="flex gap-1 items-center ml-2.5 bg-white p-2 rounded-[100px] cursor-pointer"
                      onClick={() => openCurrencyModal("to")}
                    >
                      <Image
                        src={currencyImages(toCurrency)}
                        alt={toCurrency}
                        className="w-6 h-6 object-center"
                      />
                      <span className="text-[#474256] font-inter text-base font-bold">
                        {currencySymbols(toCurrency)}
                      </span>
                      <span className="block mr-4">
                        <ChevronDown color="#9292A0" className="h-6 w-6" />
                      </span>
                    </div>
                    <Input
                      {...register("toAmount")}
                      name="toAmount"
                      id="toAmount"
                      type="text"
                      readOnly
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    />
                  </div>
                </Label>
              </div>

              <div className="flex items-center gap-6 justify-between">
                <div className="flex items-center p-4 gap-6">
                  <Image
                    src={rateLogo}
                    alt="rate"
                    className="w-7 h-7 object-center"
                  />
                  <span className="text-[#07052A] font-inter font-normal text-sm">
                    Rate:{" "}
                    {isRateLoading ? (
                      <FaSpinner className="animate-spin inline" />
                    ) : rateError ? (
                      "Error loading rate"
                    ) : (
                      `1${currencySymbols(fromCurrency)} = ${
                        rateData?.rate?.toFixed(6) || "--"
                      } ${currencySymbols(toCurrency)}`
                    )}
                  </span>
                </div>

                <div className="flex items-center p-4 gap-6">
                  <Image
                    src={feeLogo}
                    alt="fee"
                    className="w-7 h-7 object-center"
                  />
                  <span className="text-[#07052A] font-inter font-normal text-sm">
                    {currencySymbols(fromCurrency)}
                    {numberWithCommas(managementData?.wirefee || 0)}
                  </span>
                </div>
              </div>

              <Button
                disabled={
                  isSubmitting ||
                  isRateLoading ||
                  !watch("fromAmount") ||
                  !rateData
                }
                className="w-full rounded-xl mb-20 cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              >
                {isRateLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "Continue"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>

      <ConfirmDrawer
        receiverAccountInfo={userAccountInfo}
        amount={amount}
        narration={narration}
      />
      <LoaderModal />
      <TransactionPinModal />
      {step === 2 && <TransactionLastStage />}
      <CurrencyModal
        show={showCurrencyModal}
        setShow={setShowCurrencyModal}
        onSelect={handleCurrencySelect}
        currentCurrency={
          activeCurrencyField === "from" ? fromCurrency : toCurrency
        }
      />
    </div>
  );
};

export default SwapPage;
