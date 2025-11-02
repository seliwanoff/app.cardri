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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Switch from "react-switch";
import bankLogo from "@/public/assets/cardripay/bank.png";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import {
  useBankModal,
  useBillPaymentOverlay,
  useCountryModal,
  useLoadingSpinOverlay,
  useNetworkOverlay,
  usePaymentMethodOverlay,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import {
  createChinaPayment,
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
import CountryModal from "../modal/country_modal";

import BWP from "@/public/assets/country/bwp.png";
import Camerron from "@/public/assets/country/xaf.png";
import CongoXaf from "@/public/assets/country/Conxaf.png";
//import DRccongo from "@/public/assets/country/";
import CDF from "@/public/assets/country/cdf.png";
import Gabon from "@/public/assets/country/gabon.png";
import Ghana from "@/public/assets/country/ghana.png";
import IvoryCoast from "@/public/assets/country/IvoryCoast.png";
import Kenya from "@/public/assets/country/kenya.png";
import Malawi from "@/public/assets/country/Malawi.png";
import Nigeria from "@/public/assets/country/Nigeria.png";
import Rwanda from "@/public/assets/country/Rwanda.png";
import Senegal from "@/public/assets/country/Senegal.png";
import Tanzania from "@/public/assets/country/Tanzania.png";
import Uganda from "@/public/assets/country/Uganda.png";
import Mali from "@/public/assets/country/Mali.png";
import Togo from "@/public/assets/country/Togo.png";
import Burkinafaso from "@/public/assets/country/Burkinafaso.png";
import Benin from "@/public/assets/country/Benin.png";
import MobileMoney from "@/public/assets/country/MobileMoney.png";
import BankMoney from "@/public/assets/country/BankMoney.png";
import PaymentMethodModal from "../modal/payment_method";
import NetWorkModal from "../modal/newtork";
import DeliveryMethod from "../modal/delivery-methos";
import COM from "@/public/assets/currencies/cashback.png";
import NGN from "@/public/assets/currencies/NGNCurrency.png";
import {
  getChannel,
  getNetwork,
  getRate,
  sendIntraAfricaRequest,
} from "@/services/intra-africa";
import IntraNetworkMoal from "../modal/intra-network-moal";
import { verifyTransactionPin } from "@/services/_request";
import { useUserStore } from "@/stores/currentUserStore";
import PaymentMethodSelector from "../paymentMethodSelector";
import TransactionLastStage from "../navigation/TransactionLastStage";
import LoaderModal from "../modal/request_sending_modal";

interface Transaction {
  id: string;
  amount: number;
  date: string;
  // ... other properties
}

interface Rate {
  currency: string;
  rate1: any;
}
const IntraAfricaPage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});

  const { data, loading, error: errorss, refresh } = useManagementData();

  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { setOpenLoader } = useLoadingSpinOverlay();
  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();
  const [step, setstep] = useState(1);
  const currentUser = useUserStore((state) => state.user);

  const searchParams = useSearchParams();

  const [openDrawer, setOpenDrawer] = useState(false);
  const { open: opens, setOpen: setOpens, countryDetails } = useCountryModal();

  const {
    data: channel,
    isLoading: isLoadingTransactions,
    isError: isErrorTransactions,
    error: errorTransactions,
  } = useQuery<Transaction[], Error>({
    queryKey: ["channel", countryDetails.countryCode],
    queryFn: () => getChannel(countryDetails.countryCode),
    enabled: !!countryDetails.countryCode,
  });

  const handeMovetoNextStep = () => {
    const step = searchParams.get("step");

    if (step) {
      setstep(parseInt(step) + 1);
      updateUrlParams({ step: "2" });
    }
  };
  const {
    data: bankList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["banks"], // Unique key for this query
    queryFn: getBanks, // Your fetch function
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  type FormValues = {
    id: string;
    type: string;

    narration: string;
    amount: string;
    fullname: string;

    country: string;

    number: string;
    amountToReceive: string;
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
      id: "",
      fullname: "",
      type: "",

      narration: "",
      country: "",
      amount: "",
      number: "",
      amountToReceive: "",
    },
  });
  const [checked, setChecked] = useState(false);
  //  const { open, setOpen, bankDetails } = useBankModal();
  const { openBill, setOpenBill, setPaymentDetails, paymentDetails } =
    useBillPaymentOverlay();

  const { openNetwork, setOpenNetwork, networkDetails, setNetworkDetails } =
    useNetworkOverlay();

  const [isLoadings, setIsLoading] = useState(false);

  const {
    data: network,
    isLoading: isLoadingNetwork,
    isError: isErrorNetwork,
    error: errorNetwork,
  } = useQuery<Transaction[], Error>({
    queryKey: ["network", countryDetails.countryCode],
    queryFn: () => getNetwork(countryDetails.countryCode),
    enabled: !!countryDetails.countryCode,
  });

  const {
    data: rate = [], // Default to empty array
    isLoading: isLoadingRate,
    isError: isErrorRate,
    refetch: refetchOrganization,
  } = useQuery<Rate[]>({
    queryKey: ["rateData", paymentDetails.currency], // Add currency to query key for better caching
    queryFn: () => getRate(paymentDetails.currency),
    enabled: !!paymentDetails.currency,
  });
  const { open, setOpen, otp, setOtp } = useTransactionPinOverlay();

  //  console.log(rate);
  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isLoadings) return;
      try {
        if (otp && otp.length === 4) {
          await verifyTransactionPin(otp);
          const channelType = paymentDetails.channelType;
          setOpenLoader(true);
          const payload: Record<string, any> = {
            networkid: networkDetails.id,
            networkname: networkDetails.name,
            channelId: paymentDetails.id,
            am: watch("amountToReceive"),
            accountName: watch("fullname"),
            bank: paymentDetails.channelType,
            balanceType: paymentMethodDetails.value,

            narration: watch("narration"),
            currency: paymentDetails.currency,
            ...(channelType === "bank" && {
              accountNumber: watch("id"),
            }),
            ...(channelType === "momo" && {
              phone: watch("number"),
            }),
          };

          const response = await sendIntraAfricaRequest(payload);
          //@ts-ignore
          if (response.success === "false") {
            //@ts-ignore
            toast.error(response.Message || "An unknown error occur");
          }

          console.log(response);
          setstep(4);
          updateUrlParams({ step: "4" });
          setOpenDrawer(false);

          setOpen(false);
          setOtp("");

          //@ts-ignore
          addUrlParam("ref", response.data.ref);
          addUrlParam("status", "success");
          setPaymentDetails(null);

          //   setPaymentMethodDetails(null);
        }
      } catch (e) {
        console.log(e);
        //@ts-ignore
        if (e?.response?.data.success === "false 1") {
          toast.error("Incorrect PIN");
        } else {
          //@ts-ignore
          toast.error(
            //@ts-ignore
            e?.response?.data.Message ||
              "Could not complete transaction, try again"
          );
        }
      } finally {
        setOpenLoader(false);
        //  setOpen(false);
      }
    };
    sendRequest();
  }, [otp]);
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log(data, "data");
  };

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();

    //console.log(data);

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
                  <sub>{currencySymbols("NGN")}</sub>
                  {numberWithCommas(watch("amount").replace(",", ""))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Amount to Receive:</span>
                <span className="font-medium">
                  <sub>
                    {paymentDetails.currency}
                    {numberWithCommas(watch("amountToReceive"))}
                  </sub>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {paymentDetails.channelType}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {paymentDetails.channelType === "momo"
                    ? watch("number")
                    : watch("id")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{watch("fullname")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Fee:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    <sub>{currencySymbols("NGN")}</sub>
                    {data?.tfee}
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-gray-200" />

            {/* Total */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>

              {loading ? (
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              ) : (
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {numberWithCommas(
                    parseFloat(watch("amount").replace(",", "")) +
                      parseFloat(data?.tfee)
                  )}
                </span>
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
                Intra Africa Transfer
              </h1>
              <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
                Send money across Africa in a few seconds.
              </span>
            </div>
          </div>

          <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6 p-[30px]">
            <form
              id="sign-up"
              className=" [&>label]:block flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {step === 1 && (
                <>
                  <div>
                    <label
                      htmlFor="Bank"
                      className="font-inter font-normal text-base text-label-100"
                    >
                      Country
                    </label>

                    <Controller
                      name={"country"}
                      control={control}
                      defaultValue={countryDetails?.bankCode || ""}
                      render={({ field: { onChange } }) => (
                        <button
                          onClick={() => setOpens(true)}
                          type="button"
                          className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
                        >
                          {countryDetails.country || "Select Country"}
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
                  </div>

                  <div>
                    <label
                      htmlFor="Bank"
                      className="font-inter font-normal text-base text-label-100"
                    >
                      Channel
                    </label>

                    <Controller
                      name={"id"}
                      control={control}
                      defaultValue={paymentDetails?.value || ""}
                      render={({ field: { onChange } }) => (
                        <button
                          onClick={() => setOpenBill(true)}
                          type="button"
                          className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
                        >
                          {paymentDetails.channelType || " Select Channel"}

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
                  </div>

                  <div>
                    <label
                      htmlFor="Bank"
                      className="font-inter font-normal text-base text-label-100"
                    >
                      Network
                    </label>

                    <Controller
                      name={"id"}
                      control={control}
                      defaultValue={networkDetails?.value || ""}
                      render={({ field: { onChange } }) => (
                        <button
                          onClick={() => setOpenNetwork(true)}
                          type="button"
                          className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
                        >
                          {networkDetails.name || " Select network"}

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
                  </div>
                  <Label htmlFor="First name" className="flex flex-col gap-4">
                    <span className="font-inter font-normal text-base text-label-100">
                      First name
                    </span>

                    <Input
                      {...register("fullname", {
                        required: "Full name is required",
                      })}
                      name="fullname"
                      id="fullname"
                      type="text"
                      placeholder="Input your full name"
                      className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                    />
                    {errors.fullname && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.fullname.message}
                      </p>
                    )}
                  </Label>

                  {paymentDetails?.channelType === "momo" && (
                    <Label htmlFor="Email" className="flex flex-col gap-4">
                      <span className="font-inter font-normal text-base text-label-100">
                        Phone Number
                      </span>

                      <div className="flex gap-4 items-center w-full mt-4">
                        <div className=" min-w-32 p-4 bg-white rounded-[10px] flex gap-2 items-center text-[#B4ACCA] font-normal text-base w-fit">
                          <Image
                            src={countryDetails.image || Nigeria}
                            alt={countryDetails.countryv || "NGN"}
                            className="h-4 max-w-4 w-full object-center rounded-full"
                          />
                          <span>{countryDetails.phoneCode || "+234"}</span>
                        </div>
                        <Input
                          {...register("number", {
                            required: "Phone Number is required",

                            pattern: {
                              value: /^[0-9]{10}$/,
                              message: "Only numbers (0-9) allowed",
                            },
                          })}
                          name="number"
                          id="number"
                          // onBlur={checkPhonenNumber}
                          type="tel"
                          inputMode="numeric"
                          placeholder="Input your number "
                          className="h-[60px] py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-white placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      {errors.number && (
                        <p className="text-xs text-red-500 mt-3">
                          {errors.number.message}
                        </p>
                      )}
                    </Label>
                  )}
                  {paymentDetails?.channelType === "bank" && (
                    <Label htmlFor="account" className="flex flex-col gap-4 ">
                      <span className="font-inter font-normal text-base text-label-100">
                        Recipient account
                      </span>
                      <Input
                        {...register("id", {
                          required: "Account number is required",
                          maxLength: {
                            value: 10,
                            message: "Account number must be 10 digits",
                          },
                          minLength: {
                            value: 10,
                            message: "Account number must be 10 digits",
                          },
                          pattern: {
                            value: /^[0-9]{10}$/,
                            message: "Only numbers (0-9) allowed",
                          },
                        })}
                        name="id"
                        id="id"
                        type="number"
                        autoComplete="off"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="Enter your account number"
                        className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />

                      {errors.id && (
                        <p className="text-xs text-red-500 mt-3">
                          {errors.id.message}
                        </p>
                      )}
                    </Label>
                  )}
                </>
              )}

              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="py-[10px] px-4 bg-[#fff] border border-[#FAF7FF] rounded-[10px] flex gap-[10px] items-center justify-between">
                    <div className="flex gap-[10px] items-center">
                      <Image
                        src={bankLogo}
                        alt={""}
                        className="w-10.5 h-10.5"
                      />

                      <div>
                        <h3 className="text-[#07052A] font-bold font-sora  text-[20px]">
                          {/***@ts-ignore */}
                          {watch("fullname")}
                        </h3>

                        <div className="text-[#474256] font-normal font-inter text-[14px]">
                          <span className="text-[#474256] font-normal font-inter text-[14px]">
                            {paymentDetails.currency}{" "}
                            {paymentDetails.channelType === "momo"
                              ? watch("number")
                              : watch("id")}
                          </span>{" "}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Label htmlFor="Email" className="flex flex-col gap-4">
                    <span className="font-inter font-normal text-base text-label-100">
                      Amount to Send
                    </span>

                    <div className="flex gap-4 items-center w-full mt-4">
                      <div className=" min-w-32 p-4 bg-white rounded-[10px] flex gap-2 items-center text-[#B4ACCA] font-normal text-base w-fit">
                        <Image
                          src={Nigeria}
                          alt={"NGN"}
                          className="h-4 max-w-4 w-full object-center rounded-full"
                        />
                        <span>{"NGN"}</span>
                      </div>
                      <Input
                        {...register("amount", {
                          required: "Amount is required",
                          validate: (value) => {
                            const numValue = parseFloat(
                              value.replace(/,/g, "")
                            );
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
                        className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                        onChange={(e) => {
                          const { value, selectionStart } = e.target;

                          // Remove all non-digit characters (keep numbers & decimal)
                          const rawValue = value.replace(/[^0-9.]/g, "");

                          const totalAmount =
                            parseFloat(rawValue) *
                            parseFloat(
                              //@ts-ignore
                              rate.rate
                            );

                          setValue(
                            "amountToReceive",
                            totalAmount.toLocaleString()
                          );

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
                            const commaCount = (
                              formattedValue.match(/,/g) || []
                            ).length;
                            const originalCommaCount = (
                              value.substring(0, selectionStart).match(/,/g) ||
                              []
                            ).length;
                            const cursorOffset =
                              commaCount - originalCommaCount;
                            const newCursorPosition =
                              selectionStart + cursorOffset;

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
                    </div>
                    {errors.number && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.number.message}
                      </p>
                    )}
                  </Label>

                  <Label htmlFor="Email" className="flex flex-col gap-4">
                    <span className="font-inter font-normal text-base text-label-100">
                      Amount to Receive
                    </span>

                    <div className="flex gap-4 items-center w-full mt-4">
                      <div className=" min-w-32 p-4 bg-white rounded-[10px] flex gap-2 items-center text-[#B4ACCA] font-normal text-base w-fit">
                        <Image
                          src={countryDetails?.image || Nigeria}
                          alt={paymentDetails?.currency || "Nigeria"}
                          className="h-4 max-w-4 w-full object-center rounded-full"
                        />
                        <span>{paymentDetails?.currency || "NGN"}</span>
                      </div>
                      <Input
                        {...register("amountToReceive", {
                          required: "Amount is required",
                          validate: (value) => {
                            const numValue = parseFloat(
                              value.replace(/,/g, "")
                            );
                            if (isNaN(numValue))
                              return "Please enter a valid number";
                            if (numValue <= 0)
                              return "Amount must be greater than 0";
                            return true;
                          },
                        })}
                        name="amountToReceive"
                        id="amountToReceive"
                        type="text"
                        inputMode="decimal"
                        readOnly
                        placeholder="Enter amount (e.g., 1,000,000)"
                        className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
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
                            const commaCount = (
                              formattedValue.match(/,/g) || []
                            ).length;
                            const originalCommaCount = (
                              value.substring(0, selectionStart).match(/,/g) ||
                              []
                            ).length;
                            const cursorOffset =
                              commaCount - originalCommaCount;
                            const newCursorPosition =
                              selectionStart + cursorOffset;

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
                    </div>
                    {errors.number && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.number.message}
                      </p>
                    )}
                  </Label>

                  <Label htmlFor="Email" className="flex flex-col gap-4 ">
                    <span className="font-inter font-normal text-base text-label-100">
                      Reason
                    </span>
                    <Controller
                      name="narration"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Select value={value} onValueChange={onChange}>
                          <SelectTrigger
                            className={cn(
                              "h-[60px] mt-2 w-full rounded-[10px] border border-[#FAF7FF] outline-none bg-[#FAF7FF] text-[#07052A] placeholder:text-[#B4ACCA] text-base font-inter font-normal focus:ring-0 focus:ring-offset-0"
                            )}
                          >
                            <SelectValue placeholder="Select narration" />
                          </SelectTrigger>

                          <SelectContent className="bg-white border-0">
                            <SelectGroup>
                              <SelectItem value="gift">Gift</SelectItem>
                              <SelectItem value="bills">Bills</SelectItem>
                              <SelectItem value="groceries">
                                Groceries
                              </SelectItem>
                              <SelectItem value="travel">Travel</SelectItem>
                              <SelectItem value="health">Health</SelectItem>
                              <SelectItem value="entertainment">
                                Entertainment
                              </SelectItem>
                              <SelectItem value="housing">Housing</SelectItem>
                              <SelectItem value="School/Fees">
                                School/Fees
                              </SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />

                    {errors.id && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.id.message}
                      </p>
                    )}
                  </Label>
                  <PaymentMethodSelector
                    control={control}
                    paymentMethodDetails={paymentMethodDetails}
                    setShowMethod={setShowMethod}
                  />
                </div>
              )}

              {step === 1 && (
                <Button
                  type="submit"
                  onClick={handeMovetoNextStep}
                  disabled={isSubmitting}
                  className="w-full rounded-xl mb-20 cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
                >
                  Continue
                </Button>
              )}

              {step === 2 && (
                <Button
                  type="submit"
                  onClick={() => setOpenDrawer(true)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl mb-20 cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
                >
                  Continue
                </Button>
              )}

              {step === 4 && <TransactionLastStage />}
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
      <CountryModal bankList={countryList} />

      <BankModal bankList={bankList} />
      <DeliveryMethod paymentList={channel} />
      <IntraNetworkMoal paymentList={network} />
      <LoaderModal />
      <TransactionPinModal />
    </div>
  );
};

export default IntraAfricaPage;

const methods = [
  {
    id: 1,
    label: "Mobile Money",
    image: MobileMoney,
    desc: "Transfer within minutes",
    value: "Mobile Money",
  },
  {
    id: 1,
    label: "Bank Account",
    image: BankMoney,
    desc: "Transfer within 24-48 working hours",
    value: "Bank Account",
  },
];
//complete the country list
const countryList = [
  {
    id: "bwp",
    country: "Botswana (BWP)",
    image: BWP,
    value: "BW",
    countryCode: "BW",
    phoneCode: "+267",
  },
  {
    id: "xaf",
    country: "Cameroon (XAF)",
    image: BWP,
    value: "CM",
    countryCode: "CM",
    phoneCode: "+237",
  },
  {
    id: "congo-xaf",
    country: "Congo (XAF)",
    image: CongoXaf,
    value: "CG",
    countryCode: "CG",
    phoneCode: "+242",
  },
  {
    id: "drc",
    country: "DR Congo (CDF)",
    image: CDF,
    value: "CD",
    countryCode: "CD",
    phoneCode: "+243",
  },
  {
    id: "gabon",
    country: "Gabon (XAF)",
    image: Gabon,
    value: "GA",
    countryCode: "GA",
    phoneCode: "+241",
  },
  {
    id: "ghana",
    country: "Ghana (GHS)",
    image: Ghana,
    value: "GH",
    countryCode: "GH",
    phoneCode: "+233",
  },
  {
    id: "ivory-coast",
    country: "Ivory Coast (XOF)",
    image: IvoryCoast,
    value: "CI",
    countryCode: "CI",
    phoneCode: "+225",
  },
  {
    id: "kenya",
    country: "Kenya (KES)",
    image: Kenya,
    value: "KE",
    countryCode: "KE",
    phoneCode: "+254",
  },
  {
    id: "malawi",
    country: "Malawi (MWK)",
    image: Malawi,
    value: "MW",
    countryCode: "MW",
    phoneCode: "+265",
  },
  {
    id: "nigeria",
    country: "Nigeria (NGN)",
    image: Nigeria,
    value: "NG",
    countryCode: "NG",
    phoneCode: "+234",
  },
  {
    id: "rwanda",
    country: "Rwanda (RWF)",
    image: Rwanda,
    value: "RW",
    countryCode: "RW",
    phoneCode: "+250",
  },
  {
    id: "senegal",
    country: "Senegal (XOF)",
    image: Senegal,
    value: "SN",
    countryCode: "SN",
    phoneCode: "+221",
  },
  {
    id: "tanzania",
    country: "Tanzania (TZS)",
    image: Tanzania,
    value: "TZ",
    countryCode: "TZ",
    phoneCode: "+255",
  },
  {
    id: "uganda",
    country: "Uganda (UGX)",
    image: Uganda,
    value: "UG",
    countryCode: "UG",
    phoneCode: "+256",
  },
  {
    id: "mali",
    country: "Mali (XOF)",
    image: Mali,
    value: "ML",
    countryCode: "ML",
    phoneCode: "+223",
  },
  {
    id: "togo",
    country: "Togo (XOF)",
    image: Togo,
    value: "TG",
    countryCode: "TG",
    phoneCode: "+228",
  },
  {
    id: "burkina-faso",
    country: "Burkina Faso (XOF)",
    image: Burkinafaso,
    value: "BF",
    countryCode: "BF",
    phoneCode: "+226",
  },
  {
    id: "benin",
    country: "Benin (XOF)",
    image: Benin,
    value: "BJ",
    countryCode: "BJ",
    phoneCode: "+229",
  },
];
