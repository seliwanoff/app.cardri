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
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
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
import { currencyImages, currencySymbols } from "@/lib/misc";
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
import { createPaymentLink } from "@/services/payment_link";
import CurrencyModal from "../modal/curency-modal";

const PaymentForm = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const [isBankInfoLoad, setIsBankInfoLoad] = useState(false);
  const { paymentDetails, setPaymentDetails } = usePaymentTypeChina();
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { setOtp, setOpen: setOpenOtp } = useTransactionPinOverlay();
  const [fromCurrency, setFromCurrency] = useState("NGN");

  const { data } = useManagementData();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();

  const [step, setstep] = useState(1);

  const [openDrawer, setOpenDrawer] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);

  const { otp } = useTransactionPinOverlay();

  type FormValues = {
    narration: string;
    amount: string;
    purpose: string;
    amountInNaira: string;
    type: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      narration: "",
      amountInNaira: "",
      amount: "",
      purpose: "",
      type: "",
    },
  });
  const [checked, setChecked] = useState(false);
  const { open, setOpen, bankDetails } = useBankModal();
  const {
    paymentMethodDetails,
    showMethod,
    setShowMethod,
    setPaymentMethodDetails,
  } = usePaymentMethodOverlay();

  const [isLoadings, setIsLoading] = useState(false);

  const handleChange = (nextChecked: any) => {
    setChecked(nextChecked);
  };

  const handleCurrencySelect = useCallback((currency: string) => {
    setFromCurrency(currency);

    // queryClient.invalidateQueries({ queryKey: ["exchangeRate"] });
    setShowCurrencyModal(false);
  }, []);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setOpenDrawer(true);
  };
  useEffect(() => {
    if (!paymentDetails) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [paymentDetails]);
  const openCurrencyModal = (field: "from" | "to") => {
    //  setActiveCurrencyField(field);
    setShowCurrencyModal(true);
  };
  ///onsole.log(paymentDetails.image);

  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isLoadings) return;
      try {
        if (otp && otp.length === 4) {
          await verifyTransactionPin(otp);

          const formData = new FormData();
          setOpenLoader(true);

          formData.append("title", watch("narration"));
          formData.append("currency", fromCurrency);

          formData.append("amount", watch("amountInNaira").replaceAll(",", ""));
          const response = await createPaymentLink(formData);
          toast.success("Payment link created successfully");
          setOpenOtp(false);
          setstep(1);

          // console.log(response);
          // setstep(4);
          // updateUrlParams({ step: "4" });
          setOpenDrawer(false);

          setOpen(false);
          setOtp("");

          //@ts-ignore
          // addUrlParam("ref", response.data.ref);
          //addUrlParam("status", "success");
          setPaymentDetails(null);

          setPaymentMethodDetails(null);
        }
      } catch (e) {
        console.log(e);
        //@ts-ignore
        toast.error("An error occurred while processing your request");
      } finally {
        setOpenLoader(false);
        setOpen(false);
      }
    };
    sendRequest();
  }, [otp]);

  //console.log(watch("narration"));

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();
    const { open, setOpen } = useTransactionPinOverlay();

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
                  <sub>{currencySymbols(fromCurrency)}</sub>
                  {numberWithCommas(watch("amountInNaira").replace(",", ""))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Title:</span>
                <span className="font-medium">
                  {watch("narration") || "No title provided"}
                </span>
              </div>
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
                Payment link
              </h1>
              <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-2 inline-block">
                Select a previous or send to a new recipient
              </span>
            </div>
          </div>

          <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6 p-[30px]">
            <form
              id="sign-up"
              className=" [&>label]:block flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-6">
                <Label htmlFor="Email" className="flex flex-col gap-4 ">
                  <span className="font-inter font-normal text-base text-label-100">
                    Title
                  </span>
                  <Input
                    {...register("narration")}
                    name="narration"
                    id="narration"
                    type="text"
                    placeholder="Enter title"
                    className="h-[60px]  py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {errors.narration && (
                    <p className="text-xs text-red-500 mt-3">
                      {errors.narration.message}
                    </p>
                  )}
                </Label>
                <Label htmlFor="amountInNaira" className="flex flex-col gap-4">
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
                      {...register("amountInNaira", {
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
                      name="amountInNaira"
                      id="amountInNaira"
                      type="text"
                      inputMode="numeric"
                      placeholder="0.00"
                      // onChange={handleamountInNairaChange}
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    />
                  </div>
                  {errors.amountInNaira && (
                    <p className="text-xs text-red-500">
                      {errors.amountInNaira.message}
                    </p>
                  )}
                </Label>
              </div>

              <Button
                disabled={isSubmitting || isLoadings}
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
      <LoaderModal />
      <TransactionPinModal />
      <CurrencyModal
        show={showCurrencyModal}
        setShow={setShowCurrencyModal}
        onSelect={handleCurrencySelect}
        currentCurrency={fromCurrency}
      />
    </div>
  );
};

export default PaymentForm;
