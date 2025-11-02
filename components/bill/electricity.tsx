"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveMinus, CloseCircle } from "iconsax-react";
import MTN from "@/public/assets/network/mtn.png";
import { ArrowLeft, CheckCircle2, ChevronDown, User2, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import glo from "@/public/assets/network/glo.png";
import mtn from "@/public/assets/network/mtn.png";
import airtel from "@/public/assets/network/airtel.png";
import mobile from "@/public/assets/network/mobile.png";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Prepaid from "@/public/assets/bill/prepaid.png";
import Postpaid from "@/public/assets/bill/postpaid.png";

import PHED from "@/public/assets/bill/phed.jpeg";
import IBEDC from "@/public/assets/bill/logo 2.png";
import EKODC from "@/public/assets/bill/logo-1.png";
import IE from "@/public/assets/bill/iedc.png";
import AEDC from "@/public/assets/bill/aedc.png";
import KEDCO from "@/public/assets/bill/kedco.jpeg";
import ENUGU from "@/public/assets/bill/enugu.jpeg";
import KADUNA from "@/public/assets/bill/kaduna.jpeg";
import COM from "@/public/assets/currencies/cashback.png";
import NGN from "@/public/assets/currencies/NGNCurrency.png";
import {
  useBankModal,
  useBillPaymentOverlay,
  useBillStoreOverlay,
  useLoadingSpinOverlay,
  usePaymentMethodOverlay,
  usePaymentTypeChina,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import {
  createAirtimePayment,
  createChinaPayment,
  createDataPayment,
  createElectricityPayment,
} from "@/services/bank";
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
import { currencyImages, currencySymbols, useNetworkPlans } from "@/lib/misc";
import {
  filterTransactionsByType,
  MonthlyTransactionGroup,
  numberWithCommas,
} from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import { DataPlan, getMerchant, getVariation } from "@/services/lib";

import { verifyTransactionPin } from "@/services/_request";
import LoaderModal from "../modal/request_sending_modal";
import { useUserStore } from "@/stores/currentUserStore";
import { useQuery } from "@tanstack/react-query";
import TransactionLastStage from "../navigation/TransactionLastStage";
import ElectricityProviderModal from "../modal/electricity_service_provider_modal";
import PaymentMethodModal from "../modal/payment_method";
import PaymentMethodSelector from "../paymentMethodSelector";

const ElectricityPage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const { paymentDetails } = useBillStoreOverlay();
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { data } = useManagementData();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();
  const { open, setOpen } = useTransactionPinOverlay();
  const [activeTab, setActiveTab] = useState("prepaid");

  const { setShow } = useBillStoreOverlay();
  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();
  //  console.log(paymentDetails);

  const currentUser = useUserStore((state) => state.user);

  const PaymentMethodList = [
    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.ngn_b || "0",
      currency: currencySymbols("NGN"),
      //@ts-ignore
      ledger: currentUser?.ngn_ld,
      image: NGN,
      label: "9PSB Balance",
      value: "psb",
    },
    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.ngn_safe_b || "0",
      currency: currencySymbols("NGN"),
      //@ts-ignore
      ledger: currentUser?.ngn_safe_ld,
      image: NGN,
      label: "Safe Heaven Balance",
      value: "safeHeaven",
    },

    {
      title: "NGN",
      //@ts-ignore
      balance: currentUser?.commission || "0",
      currency: currencySymbols("NGN"),
      image: COM,
      label: "Commission Balance",
      value: "commission",
    },
  ];

  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);

  const tabs = [
    {
      label: "Prepaid",
      value: "prepaid",
      image: Prepaid,
    },
    {
      label: "Postpaid",
      value: "postpaid",
      image: Postpaid,
    },
  ];

  const [step, setstep] = useState(1);

  const [openDrawer, setOpenDrawer] = useState(false);

  const { otp, setOtp } = useTransactionPinOverlay();

  type FormValues = {
    amount: string;
    type: string;

    meter_number: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isValid, isDirty },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      amount: "",
      type: "",

      meter_number: "",
    },
    mode: "onChange",
  });
  const [isLoadings, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  //console.log(isLoadings);

  useEffect(() => {
    getMeterDetails(watch("meter_number"));
  }, [activeTab, paymentDetails.value]);
  const getMeterDetails = async (meterNumber: string) => {
    if (meterNumber.length !== 13 || !activeTab) {
      return;
    }

    if (paymentDetails.value === undefined) return;
    try {
      const toastId = toast.loading("Fetching meter details...");
      setIsLoading(true);

      const payload = {
        billersCode: meterNumber,
        serviceID: paymentDetails.value,
        type: activeTab,
      };

      const response = await getMerchant(payload);
      // console.log(response);
      setUserAccountInfo(response);

      if (response.content?.error) {
        setIsError(true);
      } else {
        setIsError(false);
      }
      setIsLoading(false);

      toast.dismiss(toastId);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch plans");
    } finally {
      setIsLoading(false);
      toast.dismiss();
    }
  };

  const [checked, setChecked] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (paymentMethodDetails.value === undefined) {
      return toast.error("Please select a payment method");
    }
    setOpenDrawer(true);
  };
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepFromParams = params.get("step") || "1";

    setstep(Number(stepFromParams));
    updateUrlParams({ step: stepFromParams });
  }, []);
  //console.log(paymentDetails);
  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting) return;
      try {
        if (otp && otp.length === 4 && watch("amount")) {
          const toastId = toast.loading("verifying pin..");
          await verifyTransactionPin(otp);

          toast.dismiss(toastId);

          setOpenLoader(true);

          const payload = {
            amount: watch("amount"),
            balanceType: paymentMethodDetails.value,
            serviceID: paymentDetails.value,
            billersCode: watch("meter_number"),

            plan: planId,
            variation_code: activeTab,
            m: "web",
          };
          //@ts-ignore
          const response = await createElectricityPayment(payload);

          //  console.log(response);
          //@ts-ignore
          if (response.success === "false") {
            //@ts-ignore

            toast.error(response.Message || "An unknown error occur");
            setstep(2);
            updateUrlParams({ step: "2" });
            setOpenDrawer(false);
            setOpen(false);
            addUrlParam("status", "failed");
          } else {
            //@ts-ignore
            toast.success(response.message || "Data purchased succesfully");
            setstep(2);
            updateUrlParams({ step: "2" });
            setOpenDrawer(false);
            setOpen(false);
            addUrlParam("status", "success");
            //@ts-ignore
            addUrlParam("ref", response.id);

            reset();
          }
          setOtp("");
          reset();
        }
      } catch (e) {
        //console.log(e);
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
        setOtp("");
        setOpen(false);
      } finally {
        setOpenLoader(false);
      }
    };
    sendRequest();
  }, [otp]);

  const ConfirmDrawer = ({ recieverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();

    //console.log(recieverAccountInfo);

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
                  {watch("amount")}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Amount </span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {watch("amount")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="font-medium">Electricity Token</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Recipient </span>
                <span className="font-medium">{watch("meter_number")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Meter Name:</span>
                <span className="font-medium">
                  {
                    //@ts-ignore
                    recieverAccountInfo?.content?.Customer_Name || "N/A"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Fee:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    <sub>{currencySymbols("NGN")}</sub>
                    {numberWithCommas(0)}
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
                    <sub>{currencySymbols("NGN")}</sub>
                    {watch("amount")}
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
        className={cn(
          "h-[calc(100vh-90px)] w-full flex  overflow-auto flex-col-reverse"
        )}
        style={{
          scrollbarWidth: "none",

          msOverflowStyle: "none",
        }}
      >
        {step === 1 && (
          <div className="w-full max-w-[640px] mx-auto   rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
            <div className="flex w-full flex-col gap-4 justify-center items-center">
              <div className="w-full text-center">
                <h1 className="text-secondary-500 text-[32px] text-center font-sora font-bold  leading-[48px]">
                  Electricity
                </h1>
                <span className="text-[14px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-2 inline-block">
                  Renew your data subscription plan.
                </span>
              </div>
            </div>

            <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6 p-[30px]">
              <form
                id="sign-up"
                className=" [&>label]:block flex flex-col gap-6"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div>
                  <label
                    htmlFor="Bank"
                    className="font-inter font-normal text-base text-label-100"
                  >
                    Service Provider
                  </label>

                  {paymentDetails.label !== undefined && (
                    <div
                      className="mt-4 mb-4 py-[10px] px-4 bg-[#FAF7FF] border border-[#EFD1DC] rounded-[10px] flex gap-[10px] items-center justify-between"
                      onClick={() => setShow(true)}
                    >
                      <div className="flex gap-[10px] items-center">
                        <Image
                          src={paymentDetails?.image}
                          alt={paymentDetails?.label}
                          className="w-10.5 h-10.5"
                        />
                        <span className="text-[#07052A] font-normal text-base font-inter">
                          {paymentDetails.label}
                        </span>
                      </div>
                      <ChevronDown size={20} />
                    </div>
                  )}
                  {paymentDetails?.label === undefined && (
                    <Controller
                      name={"type"}
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <button
                          onClick={() => {
                            setShow(true);
                            // Set the initial value if paymentDetails exists
                            if (paymentDetails?.value) {
                              onChange(paymentDetails.value);
                            }
                          }}
                          type="button"
                          className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
                        >
                          {value ? value : "Service provider"}

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

                <div className="flex items-center justify-between">
                  <Tabs
                    value={activeTab}
                    onValueChange={(val) => setActiveTab(val)}
                    className="w-full justify-center"
                  >
                    <TabsList
                      className={cn(
                        "w-full rounded-full bg-[#fff] px-1 py-6 flex items-center "
                      )}
                    >
                      {tabs.map((tab: any, index: number) => (
                        <TabsTrigger
                          value={tab?.value}
                          key={index}
                          className={cn(
                            "text-primary-100 shadow-none rounded-[8px] transition w-full gap-4   px-7.5 h-[50px] flex justify-center items-center data-[state=active]:border  data-[state=active]:border-primary-100 data-[state=active]:text-primary-100 sm:flex-grow-0 font-normal text-base font-inter cursor-pointer"
                          )}
                        >
                          <Image
                            src={tab.image}
                            alt="type"
                            sizes="18"
                            className="object-center w-4.5"
                          />
                          {tab.label}
                        </TabsTrigger>
                      ))}{" "}
                    </TabsList>
                  </Tabs>
                </div>

                <Label htmlFor="meter_number" className="flex flex-col gap-1">
                  <span className="font-inter font-normal text-base text-label-100">
                    Meter Number
                  </span>

                  <Input
                    {...register("meter_number", {
                      required: "Meter Number is required",
                      pattern: {
                        value: /^[0-9]{13}$/,
                        message: "Only numbers are allowed (13 digits)",
                      },
                    })}
                    name="meter_number"
                    id="meter_number"
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 13-digit meter number"
                    className="h-[60px] py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    maxLength={13}
                    value={watch("meter_number") || ""} // Ensure controlled value
                    onChange={(e) => {
                      const numericValue = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 13);
                      setValue("meter_number", numericValue, {
                        shouldValidate: true,
                      });
                    }}
                    onBlur={(e) => getMeterDetails(e.target.value)}
                  />
                </Label>

                {isLoadings ? (
                  <div className="flex items-center gap p-2.5 gap-4 bg-green-100 rounded-[10px]">
                    <FaSpinner
                      size={20}
                      className="text-green-500 animate-spin"
                    />
                    <span className="text-green-500 font-semibold text-base font-inter">
                      Verifying meter details...
                    </span>
                  </div>
                ) : //@ts-ignore
                userAccountInfo?.code === "000" ? (
                  //@ts-ignore
                  userAccountInfo?.content?.Customer_Name ? (
                    <div className="flex items-center gap p-2.5 gap-4">
                      <CheckCircle2 fill="#1FBA79" color="#fff" size={32} />
                      <span className="text-[#07052A] font-semibold text-base font-inter">
                        {
                          //@ts-ignore
                          userAccountInfo.content.Customer_Name
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap p-2.5 gap-4 bg-red-50 rounded-[10px]">
                      <CloseCircle fill="red" color="red" size={32} />
                      <span className="text-[red] font-semibold text-base font-inter">
                        {
                          //@ts-ignore
                          userAccountInfo.content?.error ||
                            "Invalid meter number"
                        }
                      </span>
                    </div>
                  ) //@ts-ignore
                ) : userAccountInfo?.content ? (
                  <div className="flex items-center gap p-2.5 gap-4 bg-red-50 rounded-[10px]">
                    <CloseCircle fill="red" color="red" size={32} />
                    <span className="text-[red] font-semibold text-base font-inter">
                      {
                        //@ts-ignore
                        typeof userAccountInfo.content === "string"
                          ? //@ts-ignore
                            userAccountInfo.content
                          : //@ts-ignore
                            userAccountInfo.content?.error ||
                            "Invalid meter number"
                      }
                    </span>
                  </div>
                ) : null}

                <Label htmlFor="amount" className="flex flex-col gap-1">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount
                  </span>
                  <div className="flex items-center gap-2 rounded-[10px] bg-[#FAF7FF] mt-2">
                    <div className="flex gap-2 items-center ml-2.5 h-[60px]">
                      <Image
                        src={currencyImages("NGN")}
                        alt="Naira currency"
                        width={24}
                        height={24}
                        className="w-6 h-6 object-center"
                      />
                      <span>{currencySymbols("NGN")}</span>
                    </div>

                    <Input
                      {...register("amount", {
                        required: "Amount is required",
                        validate: (value) => {
                          // Remove commas if present
                          const numericValue = Number(value.replace(/,/g, ""));

                          if (isNaN(numericValue)) {
                            return "Please enter a valid number";
                          }
                          if (numericValue < 2000) {
                            return `Minimum amount is ${currencySymbols(
                              "NGN"
                            )}2,000`;
                          }
                          return true;
                        },
                        pattern: {
                          value: /^[0-9,]+$/,
                          message: "Please enter numbers only",
                        },
                      })}
                      disabled={isLoadings}
                      name="amount"
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter amount"
                      className="h-[60px] py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                      onChange={(e) => {
                        // Format with commas as user types
                        const value = e.target.value.replace(/\D/g, "");
                        if (value) {
                          e.target.value = Number(value).toLocaleString();
                        }
                      }}
                    />
                  </div>

                  {errors.amount && (
                    <p className="text-xs text-red-500 font-sora mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </Label>

                <PaymentMethodSelector
                  control={control}
                  paymentMethodDetails={paymentMethodDetails}
                  setShowMethod={setShowMethod}
                />

                <Button
                  disabled={isSubmitting || isLoadings || isError}
                  className="w-full rounded-xl mb-20 cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
                >
                  Continue
                </Button>
              </form>
            </div>
          </div>
        )}
        {step === 2 && <TransactionLastStage />}
      </div>

      {/*** BANK MODAL */}

      <ConfirmDrawer
        recieverAccountInfo={userAccountInfo}
        amount={amount}
        narration={narration}
      />
      <LoaderModal />
      <TransactionPinModal />

      <ElectricityProviderModal paymentList={TypeList} />
    </div>
  );
};

export default ElectricityPage;
const TypeList = [
  {
    id: "1",
    label: "Ibadan Electricity (IBEDC)",
    value: "ibadan-electric",
    image: IBEDC,
  },
  {
    id: "2",
    label: "Kano Electricity (KEDCO)",
    value: "kano-electric",
    image: KEDCO,
  },
  {
    id: "3",
    label: "Eko Electricity (EKEDC)",
    value: "eko-electric",
    image: EKODC,
  },
  {
    id: "4",
    label: "Abuja Electricity (AEDC)",
    value: "abuja-electric",
    image: AEDC,
  },
  {
    id: "5",
    label: "Ikeja Electric (IE)",
    value: "ikeja-electric",
    image: IE,
  },
  {
    id: "6",
    label: "Port Harcourt Electricity (PHED)",
    value: "port-harcourt-electric",
    image: PHED,
  },
  {
    id: "7",
    label: "Enugu Electricity (EEDC)",
    value: "enugu-electric",
    image: ENUGU,
  },
  {
    id: "8",
    label: "Kaduna Electricity (KEDC)",
    value: "kaduna-electric",
    image: KADUNA,
  },
];
