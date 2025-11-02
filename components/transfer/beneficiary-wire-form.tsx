"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveMinus, CloseCircle, DocumentUpload } from "iconsax-react";
import {
  ArrowLeft,
  Badge,
  BriefcaseBusinessIcon,
  Camera,
  CheckCheckIcon,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  InfoIcon,
  Search,
  UploadCloud,
  UserCheck2,
  UserRoundCheckIcon,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import business from "@/public/assets/beneficiary/businessbag.png";
import individual from "@/public/assets/beneficiary/individual.png";
import Switch from "react-switch";
import bankLogo from "@/public/assets/cardripay/bank.png";

import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FaSpinner } from "react-icons/fa";
import {
  useBankModal,
  useCountryModal,
  useTransactionPinOverlay,
} from "@/stores/overlay";
import {
  createWirePayBeneficiary,
  getCountries,
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
import { numberWithCommas } from "@/helper";
import { useManagementData } from "@/hooks/useManagementData";
import TransactionPinModal from "@/components/modal/transaction_pin_modal";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Item } from "@radix-ui/react-select";
import CountryModal from "../modal/country_modal";

const WireFormbeneficiary = () => {
  const router = useRouter();
  const [userAccountInfo, setUserAccountInfo] = useState({});
  const [isBankInfoLoad, setIsBankInfoLoad] = useState(false);

  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");

  const [step, setstep] = useState(1);

  const searchParams = useSearchParams();

  const [openDrawer, setOpenDrawer] = useState(false);

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
    data: countryList,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["country"], // Unique key for this query
    queryFn: getCountries, // Your fetch function
    staleTime: 1000 * 60 * 1, // 5 minutes cache
  });

  type FormValues = {
    id: string;
    name: string;
    relationship: string;
    lastname: string;
    firstname: string;
    narration: string;
    amount: string;
    nationalId: string;
    sort: string;
    country: string;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      id: "",
      name: "",
      relationship: "",
      narration: "",
      amount: "",
      lastname: "",
      firstname: "",
      nationalId: "",
      sort: "",
      country: "",
    },
  });
  const [checked, setChecked] = useState(false);
  const { open, setOpen, countryDetails } = useCountryModal();

  const [activeTab, setActiveTab] = useState("company");

  const [isLoadings, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0];

    // console.log(e.target.files);
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === "string") {
            setFilePreview(result);
          }
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const simulateLocalUpload = () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadProgress(0);
  };

  const handleChange = (nextChecked: any) => {
    setChecked(nextChecked);
  };

  //  console.log(countryList);

  useEffect(() => {
    const fetchcountryDetails = async () => {
      if (countryDetails?.bankCode === undefined && watch("id") === "") return;

      try {
        // setIsBankInfoLoad(true);
        if (
          countryDetails?.bankCode &&
          watch("id") !== "" &&
          watch("id").length === 10
        ) {
          setIsLoading(true);

          const response = await resolveAccountInfo(
            watch("id"),
            countryDetails?.bankCode
          );
          setUserAccountInfo(response);
          setIsBankInfoLoad(true);

          //@ts-ignore
          if (response?.code !== "00") {
            toast.error("Invalid account number. Please try again.");
            setIsBankInfoLoad(false);
          }
        }
      } catch (error) {
        toast.error("Error fetching bank details. Please try again later.");
        setIsBankInfoLoad(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchcountryDetails();
  }, [countryDetails, watch("id")]);

  // console.log(countryDetails);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isLoading || isSubmitting) return;
    try {
      setIsLoading(true);
      const payload = {
        entity: activeTab,
        companyName: data.name,
        firstName: data.firstname ?? undefined,
        lastName: data.lastname ?? undefined,
        currency: countryDetails.currency,
        accountNumber: data.id,
        country: countryDetails.country,
        beneficiaryCountryCode: countryDetails.iso,
        relationship: data.relationship,
        image: selectedFile,
        nationalId: data.nationalId,
      };
      //@ts-ignore
      //   console.log(selectedFile.name);
      const formData = new FormData();
      formData.append("entity", payload.entity);
      formData.append("companyName", payload.companyName);
      if (payload.firstName) formData.append("firstName", payload.firstName);
      if (payload.lastName) formData.append("lastName", payload.lastName);
      formData.append("currency", payload.currency);
      formData.append("accountNumber", payload.accountNumber);
      formData.append("country", payload.country);
      formData.append("beneficiaryCountryCode", payload.beneficiaryCountryCode);
      formData.append("relationship", payload.relationship);
      //@ts-ignore
      formData.append("image", selectedFile, selectedFile.name);

      formData.append("nationalId", payload.nationalId);

      await createWirePayBeneficiary(payload);
      reset();
      setSelectedFile(null);
      toast.success("Beneficiary addded succesfully.");
      setstep(1);
      updateUrlParams({ step: "1" });
    } catch (error) {
      //  console.log(error);
      //@ts-ignore
      toast.error(error?.response.data.message || "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!userAccountInfo) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [userAccountInfo]);
  //console.log(amount);

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
                  {countryDetails && countryDetails?.bankName}
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
            <Tabs
              value={activeTab}
              onValueChange={(val) => setActiveTab(val)}
              className="w-full justify-between items-center "
            >
              <TabsList
                className={cn(
                  "w-full justify-between items-center rounded-full gap-4 bg-[#fff] px-1 py-6"
                )}
              >
                {tabs.map((tab: any, index: number) => (
                  <TabsTrigger
                    value={tab?.value}
                    key={index}
                    className={cn(
                      "text-[#B4ACCA] w-full border border-[#FAF7FF] rounded-[8px] px-7.5 h-[64px] flex gap-4   items-center justify-start   font-normal text-base font-inter cursor-pointer"
                    )}
                  >
                    <Image
                      src={tab.image}
                      alt={tab.label}
                      className="h-[40px] w-[40px] object-center"
                    />
                    {tab.label}
                  </TabsTrigger>
                ))}{" "}
              </TabsList>
            </Tabs>
            <form
              id="sign-up"
              className=" [&>label]:block flex flex-col gap-6 mt-10"
              onSubmit={handleSubmit(onSubmit)}
            >
              {activeTab === "company" && (
                <Label htmlFor="First name" className="flex flex-col gap-4">
                  <span className="font-inter font-normal text-base text-label-100">
                    Company name
                  </span>

                  <Input
                    {...register("name", {
                      required: "Company name is required",
                    })}
                    name="name"
                    id="name"
                    type="text"
                    placeholder="Enter recipient’s full name"
                    className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-3">
                      {errors.name.message}
                    </p>
                  )}
                </Label>
              )}

              {activeTab === "individual" && (
                <>
                  <Label htmlFor="First name" className="flex flex-col gap-4">
                    <span className="font-inter font-normal text-base text-label-100">
                      First name
                    </span>

                    <Input
                      {...register("firstname", {
                        required: "Firstname is required",
                      })}
                      name="firstname"
                      id="firsname"
                      type="text"
                      placeholder="Enter firstname"
                      className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                    />
                    {errors.firstname && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.firstname.message}
                      </p>
                    )}
                  </Label>
                  <Label htmlFor="First name" className="flex flex-col gap-4">
                    <span className="font-inter font-normal text-base text-label-100">
                      Lastname
                    </span>

                    <Input
                      {...register("lastname", {
                        required: "Lastname is required",
                      })}
                      name="lastname"
                      id="lastname"
                      type="text"
                      placeholder="Enter lastname"
                      className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                    />
                    {errors.lastname && (
                      <p className="text-xs text-red-500 mt-3">
                        {errors.lastname.message}
                      </p>
                    )}
                  </Label>
                </>
              )}

              <Label htmlFor="First name" className="flex flex-col gap-4">
                <span className="font-inter font-normal text-base text-label-100">
                  Recipient account
                </span>

                <Input
                  {...register("id", {
                    required: "Recipient's account is required",
                  })}
                  name="id"
                  id="id"
                  type="number"
                  placeholder="Enter recipient’s account"
                  className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                {errors.id && (
                  <p className="text-xs text-red-500 mt-3">
                    {errors.id.message}
                  </p>
                )}
              </Label>

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
                      onClick={() => setOpen(true)}
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

              <Label htmlFor="First name" className="flex flex-col gap-4">
                <span className="font-inter font-normal text-base text-label-100">
                  National ID(Swift code, Routing Number)
                </span>

                <Input
                  {...register("nationalId", {
                    required: "National ID's is required",
                  })}
                  name="nationalId"
                  id="lastname"
                  type="text"
                  placeholder="Enter swift code full"
                  className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                />
                {errors.nationalId && (
                  <p className="text-xs text-red-500 mt-3">
                    {errors.nationalId.message}
                  </p>
                )}
              </Label>
              <Label htmlFor="First name" className="flex flex-col gap-4">
                <span className="font-inter font-normal text-base text-label-100">
                  Relationship with the beneficiary
                </span>

                <Input
                  {...register("relationship", {
                    required: "Relationship is required",
                  })}
                  name="relationship"
                  id="relationship"
                  type="text"
                  placeholder="Relationship with the beneficiary"
                  className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#FAF7FF] placeholder:text-base placeholder:font-normal  placeholder:font-inter placeholder:text-[#B4ACCA]  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                />
                {errors.relationship && (
                  <p className="text-xs text-red-500 mt-3">
                    {errors.relationship.message}
                  </p>
                )}
              </Label>

              <div className="w-full bg-white border border-[rgb(204,204,204)] rounded-xl flex flex-col gap-6 p-3">
                <div className="flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-full text-purple-900 bg-purple-300 flex justify-center items-center">
                    <Camera />
                  </div>
                  <span className="text-base font-inter font-bold">
                    Proof of sending money
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />

                {!selectedFile ? (
                  <div
                    className="flex items-center gap-2 bg-[#FAF7FF]  justify-center  rounded-[8px] py-4 px-2 cursor-pointer hover:bg-[#F0E5FF] transition-colors"
                    onClick={handleUploadClick}
                  >
                    <UploadCloud color="#ccc" size={20} />
                    <span className="text-center inline-block font-sora text-sm ">
                      Upload new file
                    </span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* File Preview */}
                    {filePreview && (
                      <div className="flex justify-center">
                        <img
                          src={filePreview}
                          alt="Preview"
                          className="max-h-40 rounded-lg border border-gray-200"
                        />
                      </div>
                    )}

                    {/* File Info */}
                    <div className="flex justify-between items-center">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {/***@ts-ignore */}
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {/***@ts-ignore */}
                          {formatFileSize(selectedFile.size)} •{" "}
                          {/***@ts-ignore */}
                          {selectedFile.type}
                        </p>
                      </div>
                      <button
                        onClick={removeFile}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-100 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full mb-5 rounded-xl cursor-pointer mt-8 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
              >
                {isSubmitting ? (
                  <FaSpinner className="animate-spin text-white" />
                ) : (
                  `Continue`
                )}
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

      <CountryModal bankList={countryList} />
      <TransactionPinModal />
    </div>
  );
};

export default WireFormbeneficiary;

const tabs = [
  {
    label: "Business",
    value: "company",
    image: business,
  },
  {
    label: "Individual",
    value: "individual",
    image: individual,
  },
];
