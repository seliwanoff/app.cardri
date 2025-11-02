"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArchiveMinus, CloseCircle, DocumentUpload } from "iconsax-react";
import alipay from "@/public/assets/cardripay/alipay.png";
import wepay from "@/public/assets/cardripay/wepay.png";
import imgLogo from "@/public/assets/signin/ic_outline-privacy-tip.png";
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
  usePaymentTypeChina,
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
import { Item } from "@radix-ui/react-select";
import CountryModal from "@/components/modal/country_modal";
import ChinaTypeModal from "@/components/modal/china_type_modal";

const ChinaFormOne = () => {
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
    type: string;
    userID: string;
    name: string;
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
      type: "",
      userID: "",
      name: "",
    },
  });
  const [checked, setChecked] = useState(false);
  const { open, setOpen, paymentDetails, setPaymentDetails } =
    usePaymentTypeChina();

  const [activeTab, setActiveTab] = useState("company");

  const [isLoadings, setIsLoading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  useEffect(() => {
    if (paymentDetails) {
      reset({ type: paymentDetails.label });
    }
  }, [paymentDetails, reset]);

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

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!file) {
      console.error("No file selected"); // or show a toast/alert
      return;
    }
    const updatedDetails = {
      ...paymentDetails, // or use a ref if needed
      ...data,
      file: file,
    };
    //   console.log(updatedDetails);
    setPaymentDetails(updatedDetails);

    setstep(3);
    updateUrlParams({ step: "3" });
  };
  useEffect(() => {
    if (!userAccountInfo) {
      setstep(1);
      updateUrlParams({ step: "1" });
    }
  }, [userAccountInfo]);
  //console.log(amount);

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
              className=" [&>label]:block flex flex-col gap-6 "
              onSubmit={handleSubmit(onSubmit)}
            >
              <div>
                <label
                  htmlFor="Bank"
                  className="font-inter font-normal text-base text-label-100"
                >
                  Payment Type
                </label>
                {paymentDetails?.label === undefined && (
                  <Controller
                    name={"type"}
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <button
                        onClick={() => setOpen(true)}
                        type="button"
                        className="h-[60px] w-full mt-4 py-[15px] px-[16px] rounded-[10px] border border-[#faf7ff] outline-0 bg-[#FAF7FF] text-[#B4ACCA] text-base font-normal font-inter flex items-center justify-between"
                      >
                        {value ? value : " Select payment type"}

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

              {paymentDetails.label !== undefined && (
                <div
                  className="py-[10px] px-4 bg-[#FAF7FF]  rounded-[10px] flex gap-[10px] items-center justify-between"
                  onClick={() => setOpen(true)}
                >
                  <div className="flex gap-[10px] items-center">
                    <Image
                      src={paymentDetails.image}
                      alt={paymentDetails?.label}
                      className="w-10.5 h-10.5"
                    />
                    <span className="text-[#07052A] font-normal text-base font-inter">
                      {paymentDetails.label}
                    </span>
                  </div>
                  <ChevronDown size={20} color="#9292A0" />
                </div>
              )}
              <Label htmlFor="account" className="flex flex-col gap-4 ">
                <span className="font-inter font-normal text-base text-label-100">
                  User ID
                </span>
                <Input
                  {...register("userID", {
                    required: "User ID is required",
                  })}
                  name="userID"
                  id="userID"
                  type="text"
                  autoComplete="off"
                  maxLength={10}
                  placeholder="Enter your user ID"
                  className="h-[60px] py-[15] mt-4 px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {errors.userID && (
                  <p className="text-xs text-red-500 mt-3">
                    {errors.userID.message}
                  </p>
                )}
              </Label>

              <Label htmlFor="account" className="flex flex-col gap-4 ">
                <span className="font-inter font-normal text-base text-label-100">
                  Name
                </span>
                <Input
                  {...register("name", {
                    required: "Name is required",
                  })}
                  name="name"
                  id="name"
                  type="text"
                  autoComplete="off"
                  placeholder="Enter your recipient name"
                  className="h-[60px] py-[15] mt-4 px-[16px] rounded-[10px] border border-[#faf7ff] outline-0  bg-[#FAF7FF] placeholder:text-base  placeholder:font-normal placeholder:text-placeholder-100  focus-visible:ring-[#faf7ff] focus-visible:ring-offset-0 placeholder:font-inter font-inter  text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {errors.name && (
                  <p className="text-xs text-red-500 mt-3">
                    {errors.name.message}
                  </p>
                )}
              </Label>

              <div className="p-6 border border-[#FAF7FF] flex flex-col rounded-[10px]">
                <div className="flex items-center justify-between ">
                  <div className="flex items-center gap-4">
                    <Image
                      src={imgLogo}
                      alt=""
                      className="w-10 h-10 object-center"
                    />

                    <span className="text-[#474256] text-base font-inter ">
                      Upload User QR Code
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className="text-[#B4ACCA] font-normal text-xs leading-[18px]">
                    {file && file.name}
                  </span>
                  <div className="relative">
                    <label className="flex items-center justify-center gap-2.5 h-12.5 px-4 rounded-lg bg-[#FAF7FF] text-[#B4ACCA] cursor-pointer hover:bg-[#F0EBFA] transition-colors">
                      <UploadCloud size={24} color="#B4ACCA" />
                      <span>Tap to upload</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setFile(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="w-full mb-10 rounded-xl cursor-pointer mt-8 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
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

      <ChinaTypeModal paymentList={TypeList} />
      <TransactionPinModal />
    </div>
  );
};

export default ChinaFormOne;

const TypeList = [
  {
    id: "35",
    label: "Alipay",
    value: "alipay",
    image: alipay,
  },
  {
    id: "36",
    label: "Wepay",
    value: "wepay",
    image: wepay,
  },
];
