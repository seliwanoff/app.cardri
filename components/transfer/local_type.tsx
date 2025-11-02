"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloseCircle } from "iconsax-react";
import { CheckCircle2, ChevronDown, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import Switch from "react-switch";
import bankLogo from "@/public/assets/cardripay/bank.png";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import {
  useBankModal,
  useLoadingSpinOverlay,
  usePaymentMethodOverlay,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import {
  createWirepayment,
  getBanks,
  resolveAccountInfo,
  tranferToBank,
} from "@/services/bank";
import BankModal from "@/components/modal/bankModal";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import { addUrlParam, updateUrlParams } from "@/lib/urlParams";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { currencySymbols } from "@/lib/misc";
import { numberWithCommas } from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import PaymentMethodSelector from "../paymentMethodSelector";
import { verifyTransactionPin } from "@/services/_request";
import TransactionLastStage from "../navigation/TransactionLastStage";
import LoaderModal from "../modal/request_sending_modal";

type FormValues = {
  id: string;
  narration: string;
  amount: string;
};

const TransferPage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState<any>({});
  const [isBankInfoLoad, setIsBankInfoLoad] = useState(false);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [step, setStep] = useState(1);
  const searchParams = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(false);
  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();
  const { otp, setOtp, setOpen: setOpenOtp } = useTransactionPinOverlay();
  const { openLoader, setOpenLoader } = useLoadingSpinOverlay();

  const { data: bankList, isLoading } = useQuery({
    queryKey: ["banks"],
    queryFn: getBanks,
    staleTime: 1000 * 60 * 5,
  });

  //console.log(showMethod);

  const { register, handleSubmit, control, formState, watch } =
    useForm<FormValues>({
      defaultValues: { id: "", narration: "", amount: "" },
    });

  const { errors, isSubmitting } = formState;
  const [checked, setChecked] = useState(false);
  const { open, setOpen, bankDetails } = useBankModal();
  const [isLoadings, setIsLoading] = useState(false);
  const params = new URLSearchParams(window.location.search);

  const handeMovetoNextStep = () => {
    if (userAccountInfo) {
      setStep(2);
      updateUrlParams({ step: "2" });
    }
  };

  useEffect(() => {
    if (userAccountInfo?.data?.accountNumber === undefined) {
      setStep(1);
      updateUrlParams({ step: "1" });
    }
  }, [userAccountInfo]);
  useEffect(() => {
    const stepFromParams = params.get("step") || "1";

    setStep(Number(stepFromParams));
    updateUrlParams({ step: stepFromParams });
  }, [params]);
  useEffect(() => {
    const fetchBankDetails = async () => {
      if (bankDetails?.bankCode === undefined && watch("id") === "") return;
      try {
        if (bankDetails?.bankCode && watch("id")?.length === 10) {
          setIsLoading(true);
          const response = await resolveAccountInfo(
            watch("id"),
            bankDetails?.bankCode
          );
          setUserAccountInfo(response);
          setIsBankInfoLoad(true);
          if (
            //@ts-ignore
            response?.responseCode !== "00"
          ) {
            toast.error("Invalid account number. Please try again.");
            setIsBankInfoLoad(false);
          }
        }
      } catch {
        toast.error("Error fetching bank details. Please try again later.");
        setIsBankInfoLoad(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBankDetails();
  }, [bankDetails, watch("id")]);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log(data, "submitted");
  };
  useEffect(() => {
    if (!otp || otp.length !== 4) return;

    const handleTransaction = async () => {
      if (isSubmitting || isLoadings || isLoading) return;

      const toastId = toast.loading("Verifying PIN...");

      try {
        await verifyTransactionPin(otp);
        toast.dismiss(toastId);

        setOpenLoader(true);

        const response = await tranferToBank({
          accountNumber: userAccountInfo.data.accountNumber,
          accountName: userAccountInfo.data.accountName,
          accountCode: userAccountInfo.data.bankCode,
          amount: watch("amount"),
          naration: watch("narration"),
          bankName: bankDetails.bankName,
          type: paymentMethodDetails?.value,
          nameEnquiryReference: userAccountInfo.data.sessionId,
          isBeneficiary: checked,
          m: "web",
        });
        //  console.log(response);
        setStep(4);
        updateUrlParams({ step: "4" });
        setOpenDrawer(false);
        setOpen(false);
        setOtp("");
        setOpenOtp(false);

        addUrlParam(
          "ref",
          //@ts-ignore
          response.ref
        );
        addUrlParam("status", "success");
      } catch (error: any) {
        console.error("Transaction error:", error);
        setOtp("");

        toast.dismiss(toastId);

        if (error?.response?.data?.success === "false 1") {
          toast.error("Incorrect PIN");
        } else {
          toast.error(
            error?.response?.data?.message ||
              "Could not complete transaction, try again"
          );
        }
      } finally {
        setOpenLoader(false);
      }
    };

    handleTransaction();
  }, [
    otp,
    isSubmitting,
    isLoadings,
    isLoading,
    // beneficiaryDetalis,
    watch,
    paymentMethodDetails,
    verifyTransactionPin,
    createWirepayment,
  ]);

  // console.log(userAccountInfo.accountNumber);
  const ConfirmDrawer = ({ receiverAccountInfo }: any) => {
    const { data, loading } = useManagementData();
    const { setOpen } = useTransactionPinOverlay();

    return (
      <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
        <DrawerContent className="mx-auto w-full max-w-[500px] bg-white rounded-t-2xl border-0 focus-visible:outline-none">
          <DrawerHeader className="relative bg-main-100 p-6 ">
            <DrawerTitle className="text-xl font-bold font-sora">
              Confirm Transaction
            </DrawerTitle>
            <button
              onClick={() => setOpenDrawer(false)}
              className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#000]"
            >
              <X size={20} />
            </button>
          </DrawerHeader>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-[28px] font-bold text-[#242E3E]">
                <sub>{currencySymbols("NGN")}</sub>
                {numberWithCommas(watch("amount").replace(",", ""))}
              </h2>
            </div>

            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-500">Bank:</span>
              <span>{bankDetails?.bankName}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-500">Account:</span>
              <span>{receiverAccountInfo?.data?.accountNumber ?? "-"}</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base">
              <span className="text-gray-500">Name:</span>
              <span>{receiverAccountInfo?.data?.accountName ?? "-"}</span>
            </div>

            <div className="my-6 border-t border-gray-200" />

            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                <sub>{currencySymbols("NGN")}</sub>
                {numberWithCommas(
                  parseFloat(watch("amount").replace(",", "")) +
                    parseFloat(data?.tfee ?? "0")
                )}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setOpenDrawer(false)}
                className="rounded-lg border border-gray-300 h-[50px] sm:h-[60px] w-full sm:w-auto px-6 font-medium text-gray-700"
              >
                Cancel
              </button>
              <Button
                onClick={() => {
                  setOpenDrawer(false);
                  setOpen(true);
                }}
                className="w-full sm:w-auto h-[50px] sm:h-[60px] rounded-xl bg-primary-100 text-white font-medium"
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
      <div className="min-h-[calc(100vh-125px)] w-full flex  overflow-auto lg:overflow-visible flex-col-reverse">
        <div className="w-full max-w-[640px] mx-auto px-0 sm:px-0 md:px-0 lg:px-0 flex flex-col gap-10">
          {/* Title */}
          {step !== 4 && (
            <div className="text-center mt-4">
              <h1 className="text-[26px] sm:text-[32px] font-bold font-sora text-secondary-500">
                Send Money
              </h1>
              <p className="text-sm sm:text-base text-[#464646] mt-2">
                Select a previous or send to a new recipient
              </p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-t-3xl p-6 sm:p-8 lg:px-[72px] lg:pt-16">
            <form
              id="transfer-form"
              className="flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              {step === 1 && (
                <>
                  <Label htmlFor="id" className="flex flex-col gap-2">
                    <span className="font-inter text-base text-label-100">
                      Recipient account
                    </span>
                    <Input
                      {...register("id", {
                        required: "Account number is required",
                        minLength: { value: 10, message: "Must be 10 digits" },
                        maxLength: { value: 10, message: "Must be 10 digits" },
                      })}
                      type="number"
                      placeholder="Enter account number"
                      className="h-[56px] bg-[#FAF7FF]"
                    />
                    {errors.id && (
                      <p className="text-xs text-red-500">
                        {errors.id.message}
                      </p>
                    )}
                  </Label>

                  {/* Bank selector */}
                  <div>
                    <label className="font-inter text-base text-label-100">
                      Bank
                    </label>
                    {bankDetails.bankName ? (
                      <div
                        className="mt-3 py-2.5 px-4 bg-[#FAF7FF] border border-[#EFD1DC] rounded-[10px] flex items-center justify-between"
                        onClick={() => setOpen(true)}
                      >
                        <div className="flex gap-3 items-center">
                          <Image
                            src={bankLogo}
                            alt={bankDetails.bankName}
                            className="w-10 h-10"
                          />
                          <span className="text-[#07052A] font-inter">
                            {bankDetails.bankName}
                          </span>
                        </div>
                        <ChevronDown size={20} />
                      </div>
                    ) : (
                      <Controller
                        name="id"
                        control={control}
                        render={() => (
                          <button
                            type="button"
                            onClick={() => setOpen(true)}
                            className="mt-3 h-[56px] w-full py-3 px-4 rounded-[10px] bg-[#FAF7FF] text-[#B4ACCA] text-base font-inter flex items-center justify-between"
                          >
                            Select bank
                            <ChevronDown size={16} />
                          </button>
                        )}
                      />
                    )}
                  </div>

                  {/* Verification states */}
                  {isLoadings && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-[10px]">
                      <FaSpinner
                        size={18}
                        className="text-green-500 animate-spin"
                      />
                      <span className="text-green-600 text-sm font-medium">
                        Verifying account details...
                      </span>
                    </div>
                  )}
                  {/* Success / Error */}
                  {!isLoadings && userAccountInfo?.responseCode === "00" && (
                    <div className="flex items-center gap-3 p-3">
                      <CheckCircle2 fill="#1FBA79" color="#fff" size={28} />
                      <span className="text-[#07052A] font-semibold text-base">
                        {userAccountInfo?.data?.accountName}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* Step 2 */}
              {step === 2 && (
                <div className="flex flex-col gap-6">
                  <div className="py-3 px-4 bg-white border border-[#FAF7FF] rounded-[10px] flex items-center gap-3">
                    <Image
                      src={bankLogo}
                      alt={bankDetails?.bankName}
                      className="w-10 h-10"
                    />
                    <div>
                      <h3 className="font-sora text-lg font-semibold">
                        {userAccountInfo?.data?.accountName}
                      </h3>
                      <p className="text-sm text-[#474256]">
                        {bankDetails.bankName} •{" "}
                        {userAccountInfo?.data?.accountNumber}
                      </p>
                    </div>
                  </div>

                  <Label htmlFor="amount" className="flex flex-col gap-2">
                    <span className="font-inter text-base text-label-100">
                      Amount
                    </span>
                    <Input
                      {...register("amount", {
                        required: "Amount is required",
                      })}
                      placeholder="Enter amount (e.g., 1,000)"
                      className="h-[56px] bg-[#FAF7FF]"
                    />
                    {errors.amount && (
                      <p className="text-xs text-red-500">
                        {errors.amount.message}
                      </p>
                    )}
                  </Label>

                  <Label htmlFor="narration" className="flex flex-col gap-2">
                    <span className="font-inter text-base text-label-100">
                      Narration
                    </span>
                    <Input
                      {...register("narration")}
                      placeholder="Enter narration"
                      className="h-[56px] bg-[#FAF7FF]"
                    />
                  </Label>
                  <PaymentMethodSelector
                    control={control}
                    paymentMethodDetails={paymentMethodDetails}
                    setShowMethod={setShowMethod}
                  />
                </div>
              )}
              {step === 4 && <TransactionLastStage />}
              {/* Switch & Buttons */}
              {step !== 4 && (
                <div className="flex justify-between items-center">
                  <span className="font-inter text-sm sm:text-base text-[#242E3E]">
                    Save as Favourite?
                  </span>
                  <Switch
                    checked={checked}
                    onChange={(v) => setChecked(v)}
                    onColor="#D70D4A"
                    height={20}
                    width={38}
                  />
                </div>
              )}

              {/* Continue Button */}
              {step === 1 && (
                <Button
                  type="submit"
                  onClick={handeMovetoNextStep}
                  disabled={!isBankInfoLoad}
                  className="w-full rounded-xl h-[56px] bg-primary-100 text-white font-inter text-lg mt-4"
                >
                  Continue
                </Button>
              )}

              {step !== 1 && step !== 4 && (
                <Button
                  type="submit"
                  onClick={() => setOpenDrawer(true)}
                  disabled={isSubmitting}
                  className="w-full rounded-xl h-[56px] bg-primary-100 text-white font-inter text-lg mt-4"
                >
                  Continue
                </Button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ConfirmDrawer receiverAccountInfo={userAccountInfo} />
      <BankModal bankList={bankList} />
      <TransactionPinModal />

      <LoaderModal />
    </div>
  );
};

export default TransferPage;
