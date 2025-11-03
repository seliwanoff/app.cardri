"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";

import { useEffect, useState } from "react";
import { addUrlParam, removeUrlParam } from "@/lib/urlParams";
import { FiEye, FiEyeOff } from "react-icons/fi";

import { useParams, useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CountryLisT } from "@/lib/assets";
import { FaSpinner } from "react-icons/fa";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { registerUser, sendPhoneNUmberVerification } from "@/services/_request";
import { UserData } from "@/types";
import { getCountryCode } from "@/misc";
import { SecurityUser } from "iconsax-react";
import { useRemoteUserStore } from "@/stores/remoteUser";
import { useUserStore } from "@/stores/currentUserStore";

const IsNotAvailable = () => {
  return (
    <div className="flex items-center justify-center bg-[#FAF7FF] text-primary-100 py-1.5 px-2 font-normal  text-[8px]  rounded-full">
      Coming Soon
    </div>
  );
};
type FormValues = {
  firstname: string;
  lastname: string;
  email: string;
  referral: string;
  number: string;
  country: string;
  password: string;
  password2: string;
};
interface userData {
  datas: any;
}

const Password = ({ datas }: userData) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      referral: "",
      number: "",
      country: "",
      password: "",
      password2: "",
    },
  });

  const { step, setStep } = useAuthStep();

  const searchParams = useSearchParams();
  const { setUser } = useRemoteUserStore();
  const loginUser = useUserStore((state) => state.loginUser);

  const [eye1, setEye1] = useState(false);
  const [eye2, setEye2] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
    lowercase: false,
  });
  const ValidationIndicator = ({ valid, text }: any) => (
    <div
      className={cn(
        "flex items-center text-sm p-2 w-fit rounded-[100px]  text-wrap",
        valid ? "bg-[#1BB4461A]" : "bg-white"
      )}
    >
      <span className={valid ? "#474256" : "text-[#B4ACCA]"}>{text}</span>
    </div>
  );

  // Simple check icon component
  const CheckIcon = ({ className }: any) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const toastId = toast.loading("Registering...");
    if (isSubmitting || isLoading) return;
    // console.log(data);

    try {
      setIsLoading(true);
      const userDatas = {
        firstName: datas.firstname,
        lastName: datas.lastname,
        email: datas.email,
        referral: datas.referral,
        phoneNumber:
          getCountryCode(searchParams.get("country") || "") + datas.number,
        method: "web",
        username: datas.username,
        password: data.password,
      };
      //@ts-ignore
      const response = await registerUser(userDatas);

      //console.log(response);
      //@ts-ignore

      loginUser(response.data);
      setUser(response.data);

      // console.log(token);
      //@ts-ignore
      localStorage.setItem("access_token", JSON.stringify(response.token));
      //@ts-ignore
      localStorage.setItem("refresh_token", JSON.stringify(response.token));
      //@ts-ignore
      localStorage.setItem("token_type", JSON.stringify(response.token));
      await sendPhoneNUmberVerification();

      //@ts-ignore

      toast.success(
        "Registration sucessfully. Verification has been sent to you email",
        { id: toastId }
      );
      const updatedStep = step + 1;
      const number = searchParams.get("number") || "";
      addUrlParam("number", number);
      addUrlParam("step", updatedStep.toString());
      removeUrlParam("firstname");
      removeUrlParam("lastname");
      removeUrlParam("email");

      setStep(updatedStep);
    } catch (error) {
      console.log(error);

      toast.error(
        //@ts-ignore
        error?.response?.data.message || "Unable to register users. try again.",
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }

    //await registerUser()
  };

  const handleToggle1 = () => {
    setEye1((prev: boolean) => !prev);
  };
  const handleToggle2 = () => {
    setEye2((prev: boolean) => !prev);
  };

  useEffect(() => {
    setValidations({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  }, [password]);

  const handleChange = (e: any) => {
    setPassword(e.target.value); // Local state update
    register("password").onChange(e); // react-hook-form's onChange
  };

  const handleMatchPassword = async () => {
    if (!password.match(watch("password2"))) {
      toast.error("Password does not match.");
    }
  };
  return (
    <div className="w-full max-w-[522px] flex flex-col gap-[42px]  justify-center items-center ">
      <div className="w-full text-center">
        <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-3xl text-center lg:text-4xl  font-sora font-bold  leading-[48px]">
          Create Password
        </h1>
        <span className="text-[22px] font-normal font-inter text-center  text-[#464646] leading-[28px] mt-4 inline-block">
          Create a new password
        </span>
      </div>

      <div className="w-full">
        <form
          id="sign-up"
          className=" [&>label]:block flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Label htmlFor="password">
            <span className="inline-block text-base font-extralight text-[#4F4F4F]">
              Password
            </span>
            <div className="relative">
              <Input
                type={eye1 ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Password is required",
                  validate: () =>
                    Object.values(validations).every(Boolean) ||
                    "Missing requirements",
                })}
                onChange={handleChange}
                placeholder="Create password"
                className="h-[60px] mt-4 py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-white placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
              />

              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#828282]"
                onClick={handleToggle1}
              >
                {!eye1 ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </span>
            </div>
            {errors.password && (
              <span className="mt-2 text-red-600">
                {errors.password.message}
              </span>
            )}
          </Label>
          <Label htmlFor="password">
            <span className="inline-block text-base font-extralight text-[#4F4F4F]">
              Confirm Password
            </span>
            <div className="relative mb-4">
              <Input
                type={eye2 ? "text" : "password"}
                id="password2"
                {...register("password2", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watch("password") || "Passwords do not match",
                })}
                placeholder="Re-type password"
                className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
                {...register("password2", {
                  required: "Confirm password is required",
                })}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-[#828282]"
                onClick={handleToggle2}
              >
                {!eye2 ? <FiEye size={20} /> : <FiEyeOff size={20} />}
              </span>
            </div>
            {errors.password2 && (
              <span className="mt-4 text-red-600">
                {errors.password2.message}
              </span>
            )}
          </Label>

          <div className="mt-2 grid grid-cols grid-cols-3 gap-2   w-full mx-auto">
            <ValidationIndicator
              valid={validations.length}
              text="8 characters in length"
            />
            <ValidationIndicator
              valid={validations.uppercase}
              text="Uppercase letter"
            />
            <ValidationIndicator valid={validations.number} text="Number" />

            <ValidationIndicator
              valid={validations.lowercase}
              text="Lowercase letter"
            />
            <ValidationIndicator
              valid={validations.specialChar}
              text="Special character"
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
          >
            {isSubmitting || isLoading ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              `Continue`
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Password;
