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
  Search,
  UserCheck2,
  UserRoundCheckIcon,
  X,
} from "lucide-react";
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
  usePaymentMethodOverlay,
  useTransactionPinOverlay,
  useWireBeneficiaryDetailsOverlay,
} from "@/stores/overlay";
import {
  getBanks,
  getWireBeneficiary,
  resolveAccountInfo,
} from "@/services/bank";
import BankModal from "@/components/modal/bankModal";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { toast } from "sonner";
import { updateUrlParams } from "@/lib/urlParams";

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
import { getStatusText, numberWithCommas, Status } from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import WireFormbeneficiary from "./beneficiary-wire-form";
import WireAmountFrom from "./wire_amount_form";
import TransactionLastStage from "../navigation/TransactionLastStage";
import PaymentMethodModal from "../modal/payment_method";
import COM from "@/public/assets/currencies/cashback.png";
import NGN from "@/public/assets/currencies/NGNCurrency.png";
import { useUserStore } from "@/stores/currentUserStore";

interface StatusPillProps {
  status: Status;
}
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-[#FAF7FF]  text-[#474256] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
    case "approved":
      return "bg-[#20D4A91A]  text-[#474256] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
    case "archived":
      return "bg-red-500/5 border-red-500 text-red-500";
    case "draft":
      return "bg-gray-500/5 border-gray-500 text-gray-500";
    case "rejected":
      return "bg-gray-red/5 border-red-500 text-red-500";
  }
};

const WireTransferpage = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const [step, setstep] = useState(1);

  const searchParams = useSearchParams();

  const [openDrawer, setOpenDrawer] = useState(false);
  const { setBeneficiaryDetails } = useWireBeneficiaryDetailsOverlay();

  const handeMovetoNextStep = () => {
    const step = searchParams.get("step");

    //  console.log(step, "step");
    if (step) {
      setstep(parseInt(step) + 1);
      updateUrlParams({ step: "2" });
      // console.log(step, "step");
    }
  };
  const {
    data: beneficiariesList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["Get beneficiary"], // Unique key for this query
    queryFn: getWireBeneficiary, // Your fetch function
  });

  type FormValues = {
    id: string;

    narration: string;
    amount: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      id: "",

      narration: "",
      amount: "",
    },
  });
  const [checked, setChecked] = useState(false);
  const { open, setOpen, bankDetails } = useBankModal();

  const [activeTab, setActiveTab] = useState("recents");

  const [isLoadings, setIsLoading] = useState(false);

  const { paymentMethodDetails, showMethod, setShowMethod } =
    usePaymentMethodOverlay();

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

  const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    return (
      <span
        className={cn(
          "inline-flex w-20 items-center justify-center rounded-full border px-2 py-1 text-xs font-medium",
          getStatusColor(status)
        )}
      >
        {getStatusText(status)}
      </span>
    );
  };

  // console.log(beneficiariesList);
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log(data, "data");
  };

  useEffect(() => {
    const step = searchParams.get("step");
    setstep(Number(step));
  }, [searchParams]);
  useEffect(() => {
    if (!userAccountInfo) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [userAccountInfo]);

  const ConfirmDrawer = ({ receiverAccountInfo, amount, narration }: any) => {
    const { data, loading, error, refresh } = useManagementData();
    const { open, setOpen } = useTransactionPinOverlay();

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
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">
                  <sub>{currencySymbols("NGN")}</sub>
                  {numberWithCommas(watch("amount").replace(",", ""))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bank:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {bankDetails && bankDetails?.bankName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Account Number:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {receiverAccountInfo &&
                    receiverAccountInfo.customer?.account?.number}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Name:</span>
                <span className="font-medium">
                  {" "}
                  {/*** @ts-ignore */}
                  {receiverAccountInfo &&
                    receiverAccountInfo?.customer?.account?.name}
                </span>
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
    <>
      {step === 1 && (
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

              <div className="w-full bg-white rounded-tl-[42px] rounded-tr-[42px] lg:px-[72px] lg:pt-16 gap-6 p-[30px]">
                <form
                  id="sign-up"
                  className=" [&>label]:block flex flex-col gap-6"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  {step === 1 && (
                    <>
                      <div
                        className="w-full p-7.5 bg-[#FAF7FF] border border-[#F5F2FB] rounded-3xl flex flex-col gap-6 justify-center cursor-pointer"
                        onClick={handeMovetoNextStep}
                      >
                        <span className="font-inter font-normal  text-xs leading-4.5 text-[#B4ACCA] text-center inline-block">
                          Send money globally to a new recipient
                        </span>

                        <div className="flex gap-2 items-center text-primary-100 justify-center ">
                          <UserRoundCheckIcon size={32} />
                          <span className="text-[#474256] font-normal text-base font-inter">
                            Add a new Recipient
                          </span>
                        </div>
                      </div>

                      <div className="w-full rounded-3xl border border-[#F5F2FB] gap-4 flex-col p-7.5 mb-6">
                        <div className="flex items-center justify-between">
                          <Tabs
                            value={activeTab}
                            onValueChange={(val) => setActiveTab(val)}
                            className="w-full justify-center md:w-max"
                          >
                            <TabsList
                              className={cn(
                                "w-full justify-start rounded-full bg-[#fff] px-1 py-6 sm:w-auto md:justify-center"
                              )}
                            >
                              {tabs.map((tab: any, index: number) => (
                                <TabsTrigger
                                  value={tab?.value}
                                  key={index}
                                  className={cn(
                                    "flex-grow text-[#B4ACCA] rounded-[8px] px-7.5 h-[50px] flex justify-center items-center  data-[state=active]:bg-[#C90C450D] data-[state=active]:text-primary-100 sm:flex-grow-0 font-normal text-base font-inter cursor-pointer"
                                  )}
                                >
                                  {tab.label}
                                </TabsTrigger>
                              ))}{" "}
                            </TabsList>
                          </Tabs>
                          <div className="px-4 h-[40px] flex max-w-[150px]  justify-start items-center bg-[#FAF7FF] rounded-full gap-2">
                            <Search size={16} color="#D70D4A" />
                            <input
                              type="text"
                              className="outline-none border-0 h-[30px] w-full py-7"
                              placeholder="Search"
                            />
                          </div>
                        </div>

                        {activeTab === "recents" && (
                          <div
                            className="h-full  overflow-y-auto flex flex-col gap-4 mt-6"
                            style={{
                              scrollbarWidth: "none",
                              msOverflowStyle: "none",
                            }}
                          >
                            {
                              //@ts-ignore
                              beneficiariesList?.map((ben, index) => (
                                <div
                                  className="flex justify-between items-center cursor-pointer"
                                  key={index}
                                  onClick={() => {
                                    setstep(3);
                                    setBeneficiaryDetails(ben);
                                    updateUrlParams({ step: "3" });
                                  }}
                                >
                                  <div className="">
                                    {ben.entity === "company" ? (
                                      <h3 className="text-[#474256] font-inter font-normal text-base">
                                        {ben.companyName}
                                      </h3>
                                    ) : (
                                      <h3 className="text-[#474256] font-inter font-normal text-base">
                                        {ben.firstName} &nbsp;{ben.lastName}
                                      </h3>
                                    )}

                                    <div className="text-[#474256] text-[10px]font-inter font-normal leading-4 mt-1">
                                      <span>{ben.accountNumber}</span>&nbsp;{" "}
                                      <span>{ben.currency}</span>
                                    </div>
                                  </div>

                                  <StatusPill status={ben.status} />
                                </div>
                              ))
                            }
                          </div>
                        )}
                      </div>

                      {bankDetails.bankName !== undefined && (
                        <div
                          className="py-[10px] px-4 bg-[#FAF7FF] border border-[#EFD1DC] rounded-[10px] flex gap-[10px] items-center justify-between"
                          onClick={() => setOpen(true)}
                        >
                          <div className="flex gap-[10px] items-center">
                            <Image
                              src={bankLogo}
                              alt={bankDetails?.bankName}
                              className="w-10.5 h-10.5"
                            />
                            <span className="text-[#07052A] font-normal text-base font-inter">
                              {bankDetails.bankName}
                            </span>
                          </div>
                          <ChevronDown size={20} />
                        </div>
                      )}

                      {isLoadings && (
                        <div className="flex items-center gap p-2.5 gap-4 bg-green-100 rounded-[10px]">
                          <FaSpinner
                            size={20}
                            className="animate-spin text-green-300"
                          />
                          {/** @ts-ignore */}
                          <span className="text-green-300 font-semibold text-base font-inter ">
                            {
                              //@ts-ignore
                              userAccountInfo?.message
                            }
                          </span>
                        </div>
                      )}
                      {/** @ts-ignore */}
                      {isLoadings ? (
                        <div className="flex items-center gap p-2.5 gap-4 bg-green-100 rounded-[10px]">
                          <FaSpinner
                            size={20}
                            className="text-green-500 animate-spin"
                          />
                          {/** @ts-ignore */}
                          <span className="text-green-500 font-semibold text-base font-inter ">
                            Verifying account details...
                          </span>
                        </div>
                      ) : //@ts-ignore
                      userAccountInfo.code === "00" ? (
                        <div className="flex items-center gap p-2.5 gap-4">
                          <CheckCircle2 fill="#1FBA79" color="#fff" size={32} />
                          {/** @ts-ignore */}
                          <span className="text-[#07052A] font-semibold text-base font-inter ">
                            {
                              //@ts-ignore
                              userAccountInfo?.customer?.account?.name
                            }
                          </span>
                        </div>
                      ) : (
                        //@ts-ignore
                        userAccountInfo !== undefined ||
                        //@ts-ignore
                        (userAccountInfo.code !== "00" && (
                          <div className="flex items-center gap p-2.5 gap-4 bg-red-50 rounded-[10px]">
                            <CloseCircle fill="red" color="red" size={32} />
                            {/** @ts-ignore */}
                            <span className="text-[red] font-semibold text-base font-inter ">
                              {
                                //@ts-ignore
                                userAccountInfo?.message
                              }
                            </span>
                          </div>
                        ))
                      )}
                    </>
                  )}
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
        </div>
      )}

      {step === 2 && <WireFormbeneficiary />}
      {step === 3 && <WireAmountFrom />}
      {step === 4 && <TransactionLastStage />}
    </>
  );
};

export default WireTransferpage;

const tabs = [
  {
    label: "Recents",
    value: "recents",
  },
  {
    label: "Favourites",
    value: "favourites",
  },
];
