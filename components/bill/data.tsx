"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveMinus, CloseCircle } from "iconsax-react";
import MTN from "@/public/assets/network/mtn.png";
import { ArrowLeft, ChevronDown, User2, X } from "lucide-react";
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
import {
  useBankModal,
  useBillPaymentOverlay,
  useLoadingSpinOverlay,
  usePaymentMethodOverlay,
  usePaymentTypeChina,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import {
  createAirtimePayment,
  createChinaPayment,
  createDataPayment,
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
import {
  calculateCommision,
  currencyImages,
  currencySymbols,
  useNetworkPlans,
} from "@/lib/misc";
import {
  filterTransactionsByType,
  getFormattedTransactions,
  MonthlyTransactionGroup,
  numberWithCommas,
} from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import { DataPlan, getPurpose, getRate, getTransactions } from "@/services/lib";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "../ui/select";
import { verifyTransactionPin } from "@/services/_request";
import LoaderModal from "../modal/request_sending_modal";
import NetWorkModal from "../modal/newtork";
import { useUserStore } from "@/stores/currentUserStore";
import { useQuery } from "@tanstack/react-query";
import { number } from "yup";
import TransactionLastStage from "../navigation/TransactionLastStage";
import PaymentMethodModal from "../modal/payment_method";
import COM from "@/public/assets/currencies/cashback.png";
import NGN from "@/public/assets/currencies/NGNCurrency.png";
import PaymentMethodSelector from "../paymentMethodSelector";
const DataPage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const { paymentDetails, setOpenBill } = useBillPaymentOverlay();
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { data } = useManagementData();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();
  const { open, setOpen } = useTransactionPinOverlay();

  const currentUser = useUserStore((state) => state.user);

  const { getNetworkPlans } = useNetworkPlans();

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
      balance: currentUser?.commission || "0", // Using ngn_ld for cashback too
      currency: currencySymbols("NGN"),
      image: COM,
      label: "Commission Balance",
      value: "commission",
    },
  ];

  const [plans, setPlans] = useState<DataPlan[]>([]);

  const [planId, setPlanId] = useState<string | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();

  useEffect(() => {
    const fetchPlansForPaymentMethod = async () => {
      setIsLoading(true);

      try {
        // Determine network based on paymentDetails.id
        const networkMap: Record<string, string> = {
          "1": "mtn",
          "2": "airtel",
          "3": "glo",
          "4": "9mobile",
        };

        const network = networkMap[paymentDetails.id] || "mtn"; // Default to 'mtn' if not found
        const networkPlans = await getNetworkPlans(network);
        setPlans(networkPlans);
      } catch (error) {
        console.error("Failed to load plans:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlansForPaymentMethod();
  }, [paymentDetails.id]);

  // console.log(plans);

  const initialRecentBeneficiaries = [
    {
      label: "My number",
      //@ts-ignore
      reciever: currentUser?.phoneNumber?.replace("234", "0"),
      network: "MTN",
    },
  ];

  const [step, setstep] = useState(1);

  const [openDrawer, setOpenDrawer] = useState(false);

  const { otp, setOtp } = useTransactionPinOverlay();

  type FormValues = {
    narration: string;
    amount: string;
    purpose: string;
    amountInNaira: string;
    number: string;
    type: string;
  };

  const {
    data: monthlyGroups,
    isLoading,
    isError,
    error,
  } = useQuery<MonthlyTransactionGroup[]>({
    queryKey: ["transactions"],
    queryFn: getTransactions,
    staleTime: 1000 * 60 * 5,
  });

  const airtimeTransaction = filterTransactionsByType(
    monthlyGroups || [],
    "2",
    paymentDetails.id || "1"
  );
  // console.log(airtimeTransaction);

  const transactionBeneficiaries = airtimeTransaction
    .flatMap((month: any) => month.transactions)
    .reduce((unique: any, transaction: any) => {
      //@ts-ignore
      if (!unique.some((item) => item.reciever === transaction.reciever)) {
        //@ts-ignore
        unique.push({
          //@ts-ignore
          label: transaction.reciever,
          //@ts-ignore
          reciever: transaction.reciever,
          //@ts-ignore
          network: transaction.network,
        });
      }
      return unique;
    }, []);

  // Combine with initial list, avoiding duplicates
  const allRecentBeneficiaries = [
    ...initialRecentBeneficiaries,
    ...transactionBeneficiaries.filter(
      (txBeneficiary: any) =>
        //@ts-ignore
        txBeneficiary.reciever !== initialRecentBeneficiaries[0].reciever
    ),
  ];

  // console.log(allRecentBeneficiaries);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      narration: "",
      number: "",
      amountInNaira: "",
      amount: "",
      purpose: "",
      type: "",
    },
  });
  const [checked, setChecked] = useState(false);
  // const { open, setOpen, bankDetails } = useBankModal();

  const [isLoadings, setIsLoading] = useState(false);

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
  }, [window.location.search]);

  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isLoadings) return;
      try {
        if (otp && otp.length === 4 && watch("amount") && watch("number")) {
          const toastId = toast.loading("verifying pin..");
          await verifyTransactionPin(otp);

          toast.dismiss(toastId);

          setOpenLoader(true);

          const payload = {
            amount: watch("amount"),
            number: watch("number"),
            plan: planId,
            // bl: true,
            balanceType: paymentMethodDetails.value,

            m: "web",
            network: paymentDetails.id || "1",
          };

          const response = await createDataPayment(payload);

          console.log(response);
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
        console.log(e);
        //@ts-ignore
        if (e?.response?.data.success === "false 1") {
          toast.error("Incorrect PIN");
        } else {
          //@ts-ignore
          toast.error(
            //@ts-ignore
            e?.response?.data.Message ||
              //@ts-ignore
              e?.response?.data.comment ||
              "Could not complete transaction, try again"
          );
        }
        setOtp("");
        setOpen(false);
      } finally {
        setOpenLoader(false);
        setOpenBill(false);
      }
    };
    sendRequest();
  }, [otp]);

  const ConfirmDrawer = ({ recieverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();

    // console.log(paymentDetails);

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
                  {numberWithCommas(watch("amount"))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Amount </span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {numberWithCommas(watch("amount"))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Plan </span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {planName}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Recipient </span>
                <span className="font-medium">{watch("number")}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Network:</span>
                <span className="font-medium">
                  {paymentDetails.label || "MTN"}
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
                    {numberWithCommas(parseFloat(watch("amount")))}
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
          <div className="w-full max-w-[640px] mx-auto rounded-tl-[42px] rounded-tr-[42px] flex flex-col gap-[42px] justify-center items-center">
            <div className="flex w-full flex-col gap-4 justify-center items-center">
              <div className="w-full text-center mb-3">
                <h1 className="text-secondary-500 text-[32px] text-center font-sora font-bold  leading-[48px]">
                  Mobile Data
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
                <div className="flex flex-col gap-6">
                  <Label htmlFor="amount" className="flex flex-col gap-4">
                    <div className="flex items-center gap-2  rounded-[10px]">
                      <div
                        className="flex gap-2 items-center ml-2.5 bg-[#FAF7FF] h-[60px] p-2.5 rounded-[12px]"
                        onClick={() => setOpenBill(true)}
                      >
                        <Image
                          src={paymentDetails.image || MTN}
                          alt=""
                          className="w-6 h-6 object-center"
                        />
                        <span className="text-[#474256] font-inter text-base font-bold">
                          {paymentDetails.label || "MTN"}
                        </span>

                        <ChevronDown
                          className="text-[#474256]"
                          color="#474256"
                          size={20}
                        />
                      </div>

                      <Input
                        {...register("number", {
                          required: "Phone Number is required",
                          maxLength: {
                            value: 11,
                            message: "Number must be 10 digits",
                          },
                          minLength: {
                            value: 11,
                            message: "Number must be 10 digits",
                          },
                          pattern: {
                            value: /^[0-9]{11}$/,
                            message: "Only numbers (0-9) allowed",
                          },
                        })}
                        name="number"
                        id="number"
                        //   onBlur={checkPhonenNumber}
                        type="tel"
                        inputMode="numeric"
                        maxLength={11}
                        placeholder="0814 308 3149"
                        className="h-[60px] py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-[#B4ACCA] focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>

                    {errors.amount && (
                      <p className="text-xs text-red-500 font-sora ">
                        {errors.amount.message ||
                          `Mininmum amount is ${currencySymbols("JPY")}500 `}
                      </p>
                    )}
                  </Label>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[#1b1b1b] font-normal text-base font-inter">
                    Recent Beneficiaries{" "}
                  </span>

                  <div className="flex gap-3 items-center">
                    {allRecentBeneficiaries?.map(
                      (ben, index) =>
                        ben.reciever && (
                          <div
                            className="flex-col flex items-center gap-2 cursor-pointer"
                            onClick={() => setValue("number", ben.reciever)}
                          >
                            <div
                              className={cn(
                                "h-12 w-12 rounded-full flex justify-center items-center",
                                index === 0
                                  ? "bg-primary-100"
                                  : "bg-[#C90C451A]"
                              )}
                            >
                              <User2 color="white" size={24} />
                            </div>

                            <span className="font-normal text-[#474256] text-xs font-inter">
                              {ben.label}
                            </span>
                          </div>
                        )
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-[#1b1b1b] font-normal text-base font-inter">
                    Top up
                  </span>

                  <div className="grid grid-cols grid-cols-3 gap-2">
                    {plans?.map((datas, index) => (
                      <div
                        className="flex-col flex items-center gap-2 cursor-pointer bg-[#F5F2FBCC] py-6 px-5 rounded-[16px] max-w-[115px]"
                        key={index}
                        onClick={() => {
                          //@ts-ignore
                          setValue("amount", datas.price);
                          //@ts-ignore
                          setPlanId(datas.planid);
                          setPlanName(datas.name);
                        }}
                      >
                        <h3 className="text-[#07052A] font-sora font-bold text-[20px]">
                          {datas.plan}
                        </h3>

                        <span className="font-normal text-[#474256] text-xs font-inter whitespace-nowrap inline-flex items-baseline">
                          <sub className="mr-0.5">{currencySymbols("NGN")}</sub>
                          <span>
                            {numberWithCommas(datas.price)?.replace(".00", "")}
                          </span>
                        </span>

                        <span className="font-normal text-[#474256] text-xs font-inter text-center ">
                          {datas.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Label htmlFor="amount" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount
                  </span>
                  <div className="flex items-center gap-2  rounded-[10px] bg-[#FAF7FF] mt-2">
                    <div className="flex gap-2 items-center ml-2.5  h-[60px] ">
                      <Image
                        src={currencyImages("NGN")}
                        alt=""
                        className="w-6 h-6 object-center"
                      />
                      {currencySymbols("NGN")}
                    </div>

                    <Input
                      {...register("amount", {
                        required: "Amount is required",
                      })}
                      name="amount"
                      id="amount"
                      type="text"
                      readOnly
                      inputMode="numeric"
                      placeholder="Enter amount"
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    />
                  </div>

                  {errors.amount && (
                    <p className="text-xs text-red-500 font-sora ">
                      {errors.amount.message ||
                        `Mininmum amount is ${currencySymbols("JPY")}500 `}
                    </p>
                  )}
                </Label>
                <PaymentMethodSelector
                  control={control}
                  paymentMethodDetails={paymentMethodDetails}
                  setShowMethod={setShowMethod}
                />
                <Button
                  disabled={isSubmitting || isLoadings}
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
    </div>
  );
};

export default DataPage;
const TypeList = [
  {
    id: "1",
    label: "MTN",
    value: "mtn",
    image: mtn,
  },
  {
    id: "2",
    label: "Airtel",
    value: "airtel",
    image: airtel,
  },
  {
    id: "3",
    label: "9Mobile",
    value: "9mobile",
    image: mobile,
  },
  {
    id: "4",
    label: "GLO",
    value: "glo",
    image: glo,
  },
];
