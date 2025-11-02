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
import PaymentMethodSelector from "../paymentMethodSelector";

const ChinaAmountForm = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const [isBankInfoLoad, setIsBankInfoLoad] = useState(false);
  const { paymentDetails, setPaymentDetails } = usePaymentTypeChina();
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const { setOtp } = useTransactionPinOverlay();

  const { data } = useManagementData();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();

  const [step, setstep] = useState(1);

  const [openDrawer, setOpenDrawer] = useState(false);

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setOpenDrawer(true);
  };
  useEffect(() => {
    if (!paymentDetails) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [paymentDetails]);

  ///onsole.log(paymentDetails.image);

  useEffect(() => {
    const sendRequest = async () => {
      if (isSubmitting || isLoadings) return;
      try {
        if (otp && otp.length === 4) {
          await verifyTransactionPin(otp);

          const formData = new FormData();
          setOpenLoader(true);

          formData.append("type", paymentDetails.id);
          formData.append("accountName", paymentDetails.name);
          formData.append("userId", paymentDetails.userID);
          formData.append(
            "image",
            paymentDetails.file,
            paymentDetails.file.name
          );
          formData.append("balanceType", paymentMethodDetails.value);

          formData.append("amount", watch("amount").replaceAll(",", ""));
          formData.append("m", "web");
          const response = await createChinaPayment(formData);
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

          setPaymentMethodDetails(null);
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
        setOpen(false);
      }
    };
    sendRequest();
  }, [otp]);

  const calculateNairaAmount = (amount: any) => {
    const numAmount = parseFloat(amount) || 0;

    if (numAmount < 500) return 0; // Minimum amount not met

    // Determine rate based on amount tier
    let rate;
    if (numAmount >= 500 && numAmount < 10000) {
      rate = data["Alipay5k-10k"] || 0;
    } else if (numAmount >= 10000 && numAmount < 20000) {
      rate = data["Alipay10k-20k"] || 0;
    } else if (numAmount >= 20000) {
      rate = data["Alipay20k"] || 0;
    }

    return numberWithCommas(numAmount * rate);
  };
  const getActualAmountRate = (amount: any) => {
    // console.log(amount);
    const numAmount = parseFloat(amount) || 0;

    if (numAmount < 500) return 0; // Minimum amount not met

    // Determine rate based on amount tier
    let rate;
    if (numAmount >= 500 && numAmount < 10000) {
      rate = data["Alipay5k-10k"] || 0;
    } else if (numAmount >= 10000 && numAmount < 20000) {
      rate = data["Alipay10k-20k"] || 0;
    } else if (numAmount >= 20000) {
      rate = data["Alipay20k"] || 0;
    }

    return numberWithCommas(rate);
  };
  //console.log(paymentDetails);

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
                  <sub>{currencySymbols("JPY")}</sub>
                  {numberWithCommas(watch("amount").replace(",", ""))}
                </h2>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Amount in Naira:</span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {calculateNairaAmount(watch("amount"))}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {paymentDetails && paymentDetails?.userID}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">{paymentDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transaction Fee:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    <sub>{currencySymbols("JPY")}</sub>
                    {numberWithCommas(data?.chinapafee)}
                  </span>
                )}
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Rate:</span>
                {loading ? (
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                ) : (
                  <span className="font-medium">
                    1{currencySymbols("JPY")}={" "}
                    <sub> {currencySymbols("NGN")}</sub>
                    {getActualAmountRate(watch("amount"))}
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
                    <sub>{currencySymbols("JPY")}</sub>
                    {numberWithCommas(
                      parseFloat(watch("amount").replace(",", "")) +
                        parseFloat(data?.chinapafee)
                    )}
                  </span>
                  <span>&asymp;</span>
                  <span className="font-medium">
                    <sub>{currencySymbols("NGN")}</sub>
                    {calculateNairaAmount(
                      //@ts-ignore
                      parseFloat(
                        //@ts-ignore
                        parseFloat(watch("amount")) +
                          parseFloat(data?.chinapafee)
                      )
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
                China Pay
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
                <div className="py-[10px] px-4 bg-[#fff] border border-[#FAF7FF] rounded-[10px] flex gap-[10px] items-center justify-between">
                  <div className="flex gap-[10px] items-center">
                    {paymentDetails?.image && (
                      <Image
                        src={paymentDetails?.image}
                        alt={paymentDetails?.type}
                        className="w-10.5 h-10.5"
                      />
                    )}
                    <div>
                      <h3 className="text-[#07052A] font-bold font-sora  text-[20px]">
                        {/***@ts-ignore */}
                        {paymentDetails?.name}
                      </h3>

                      <div className="text-[#474256] font-normal font-inter text-[14px]">
                        <span className="text-[#474256] font-normal font-inter text-[14px]">
                          {paymentDetails?.type}
                        </span>{" "}
                        &nbsp;
                        {
                          <span className="text-[#474256] font-normal font-inter text-[14px]">
                            {/***@ts-ignore */}
                            {paymentDetails?.userID}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <Label htmlFor="amount" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount in (JPY)
                  </span>

                  <div className="flex items-center gap-6 bg-[#FAF7FF] rounded-[10px]">
                    <div className="flex gap-2 items-center ml-2.5">
                      <Image
                        src={currencyImages("JPY")}
                        alt=""
                        className="w-6 h-6 object-center"
                      />
                      <span className="text-[#474256] font-inter text-base font-bold">
                        {" "}
                        {currencySymbols("JPY")}
                      </span>
                    </div>
                    <Input
                      {...register("amount", {
                        required: "Amount is required",
                        validate: (value) => {
                          const numValue = parseFloat(value.replace(/,/g, ""));
                          if (isNaN(numValue))
                            return "Please enter a valid number";
                          if (numValue < 500)
                            return `Minimum amount is ${currencySymbols(
                              "JPY"
                            )}500`;
                          return true;
                        },
                      })}
                      name="amount"
                      id="amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="Enter amount"
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                      onChange={(e) => {
                        const { value, selectionStart } = e.target;
                        const numValue =
                          parseFloat(value.replace(/,/g, "")) || 0;

                        // Determine the rate based on amount range
                        let rate;
                        if (numValue >= 500 && numValue < 10000) {
                          rate = data["Alipay5k-10k"]; // 5k-10k rate
                        } else if (numValue >= 10000 && numValue < 20000) {
                          rate = data["Alipay10k-20k"]; // 10k-20k rate
                        } else if (numValue >= 20000) {
                          rate = data["Alipay20k"]; // 20k+ rate
                        } else {
                          rate = 0; // Default or error case
                        }

                        setValue(
                          "amountInNaira",
                          numberWithCommas(numValue * rate)
                        );

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

                  {errors.amount && (
                    <p className="text-xs text-red-500 font-sora ">
                      {errors.amount.message ||
                        `Mininmum amount is ${currencySymbols("JPY")}500 `}
                    </p>
                  )}
                </Label>

                <Label htmlFor="amountInNaira" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Amount in (NGN)
                  </span>

                  <div className="flex items-center gap-6 bg-[#FAF7FF] rounded-[10px]">
                    <div className="flex gap-2 items-center ml-2.5">
                      <Image
                        src={currencyImages("NGN")}
                        alt=""
                        className="w-6 h-6 object-center"
                      />
                      <span className="text-[#474256] font-inter text-base font-bold">
                        {currencySymbols("NGN")}
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
                      readOnly
                      inputMode="numeric"
                      placeholder="Enter amount (e.g., 1,000,000)"
                      className="h-[60px] py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal placeholder:text-placeholder-100 focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter text-base font-normal"
                    />
                  </div>

                  {errors.amountInNaira && (
                    <p className="text-xs text-red-500">
                      {errors.amountInNaira.message}
                    </p>
                  )}
                </Label>

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
                    className="h-[60px]  py-[15] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />

                  {errors.narration && (
                    <p className="text-xs text-red-500 mt-3">
                      {errors.narration.message}
                    </p>
                  )}
                </Label>
              </div>

              <PaymentMethodSelector
                control={control}
                paymentMethodDetails={paymentMethodDetails}
                setShowMethod={setShowMethod}
              />

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
                <div className="flex flex-col gap-2">
                  <h3 className="text-[#07052A] font-bold font-inter ">
                    Current Exchange Rate
                  </h3>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center p-4 gap-6">
                      <Image
                        src={rateLogo}
                        alt="rate"
                        className="w-7 h-7 object-center"
                      />

                      <span className="text-[#07052A] font-inter font-normal text-sm">
                        {currencySymbols("JPY")}500 - 10k={" "}
                        {currencySymbols("NGN")}
                        {data["Alipay5k-10k"]}
                      </span>
                    </div>
                    <div className="flex items-center p-4 gap-6">
                      <Image
                        src={rateLogo}
                        alt="rate"
                        className="w-7 h-7 object-center"
                      />

                      <span className="text-[#07052A] font-inter font-normal text-sm">
                        {currencySymbols("JPY")}10k - 20k={" "}
                        {currencySymbols("NGN")}
                        {data["Alipay10k-20k"]}
                      </span>
                    </div>
                    <div className="flex items-center p-4 gap-6">
                      <Image
                        src={rateLogo}
                        alt="rate"
                        className="w-7 h-7 object-center"
                      />

                      <span className="text-[#07052A] font-inter font-normal text-sm">
                        {currencySymbols("JPY")}20k= {currencySymbols("NGN")}
                        {data["Alipay20k"]}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 gap-6">
                  <Image
                    src={feeLogo}
                    alt="rate"
                    className="w-7 h-7 object-center"
                  />

                  <span className="text-[#07052A] font-inter font-normal text-sm">
                    {currencySymbols("USD")}
                    {numberWithCommas(data?.chinapafee)}
                  </span>
                </div>
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
    </div>
  );
};

export default ChinaAmountForm;
