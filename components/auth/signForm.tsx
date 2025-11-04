"use client";

import Image from "next/image";

import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { debounce } from "lodash";

import { useCallback, useEffect, useState } from "react";
import { addUrlParam } from "@/lib/urlParams";
import { useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { CountryLisT } from "@/lib/assets";
import { FaSpinner } from "react-icons/fa";
import { Button } from "../ui/button";
import Cardri from "@/public/assets/signin/Logo.png";

import {
  checkEmailInputted,
  checkPhoneInputted,
  checkUsernameInputted,
} from "@/services/_request";
import { toast } from "sonner";
import { AspectRatio } from "../ui/aspect-ratio";
import Link from "next/link";

type FormValues = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  referral: string;
  number: string;
  country: string;
  password: string;
  password2: string;
};
interface PasswordProps {
  setUserData?: any;
}
const SignupForm = ({ setUserData }: PasswordProps) => {
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
      username: "",
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
  const [isEmailError, setIsEmailError] = useState(true);
  const [isNumberError, setIsNumberError] = useState(true);
  const [isUsernameError, setIsUsernameError] = useState(true);

  const CountryUrl = searchParams.get("country") || "";

  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    username: "",
    phone: "",
    referral: "",
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const updatedStep = step + 1;
    setUserData(data);

    //   addUrlParam("email", watch("email"));
    addUrlParam("number", watch("number"));

    //
    addUrlParam("step", updatedStep.toString());

    setStep(updatedStep);
    // setOpen(false);
  };

  useEffect(() => {
    const subscription = watch((value) => {
      //console.log(value.email);

      setForm((prevState) => ({
        ...prevState,
        email: value.email || "",
      }));
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const checkEmail = async () => {
    const toastId = toast.loading("Please wait while checking email");
    try {
      const response = await checkEmailInputted(watch("email").trim());

      //@ts-ignore
      if (response.success === "true") {
        toast.error("Email has already been used.", { id: toastId });
      } else {
        setIsEmailError(false);
        toast.dismiss(toastId);
      }
    } catch (error) {
      toast.error("Failed to check email. Try again ");
      toast.dismiss(toastId);
      throw error;
    } finally {
      toast.dismiss();
    }
  };

  const checkPhonenNumber = async () => {
    const toastId = toast.loading("Please wait while checking phone number");

    try {
      const response = await checkPhoneInputted(watch("number").trim());

      //@ts-ignore
      if (response.success === "true") {
        toast.error("Phone number has already been used.", { id: toastId });
      } else {
        setIsNumberError(false);
        toast.dismiss(toastId);
      }
    } catch (error) {
      throw error;
    }
  };
  const checkUsername = async () => {
    const toastId = toast.loading("Please wait while checking username");

    try {
      const response = await checkUsernameInputted(watch("username").trim());

      //@ts-ignore
      if (response.success === "true") {
        toast.error("Username has already been used.", { id: toastId });
      } else {
        setIsUsernameError(false);
        toast.dismiss(toastId);
      }
    } catch (error) {
      throw error;
    }
  };
  return (
    <div className="w-full max-w-[522px] flex flex-col lg:gap-[42px]  gap-8  justify-center items-center  mb-28 lg:pt-32 pt-6 ">
      <div className="w-full">
        <h1 className="text-secondary-500 md:text-3xl sm:text-2xl text-2xl  lg:text-4xl text-left font-sora font-bold  leading-[48px]">
          Set up your account
        </h1>
        <span className="text-xl font-normal font-inter text-left  text-[#464646]  mt-4 inline-block">
          Hi there, we would love to know you.
        </span>
      </div>

      <div className="w-full">
        <form
          id="sign-up"
          className=" [&>label]:block flex flex-col lg:gap-6 gap-3"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Label htmlFor="First name" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              First name
            </span>

            <Input
              {...register("firstname", { required: "First name is required" })}
              name="firstname"
              id="firstname"
              type="text"
              placeholder="Input your firstname"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
            {errors.firstname && (
              <p className="text-xs text-red-500 mt-3">
                {errors.firstname.message}
              </p>
            )}
          </Label>
          <Label htmlFor="First name" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Last name
            </span>

            <Input
              {...register("lastname", { required: "Last name is required" })}
              name="lastname"
              id="lastname"
              type="text"
              placeholder="Input your lastname"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
            {errors.lastname && (
              <p className="text-xs text-red-500 mt-3">
                {errors.lastname.message}
              </p>
            )}
          </Label>

          <Label htmlFor="First name" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Username
            </span>

            <Input
              {...register("username", { required: "Username is required" })}
              name="username"
              id="username"
              type="text"
              onBlur={checkUsername}
              placeholder="Input your username"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-3">
                {errors.username.message}
              </p>
            )}
          </Label>
          <Label htmlFor="Email" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Email
            </span>

            <Input
              {...register("email", { required: "Email is required" })}
              name="email"
              type="email"
              id="email"
              onBlur={checkEmail}
              placeholder="Input your email"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-3">
                {errors.email.message}
              </p>
            )}
          </Label>
          <Label htmlFor="Email" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Phone Number
            </span>

            <div className="flex gap-4 items-center w-full mt-4">
              <div className=" min-w-32 p-4 bg-white rounded-[10px] flex gap-2 items-center text-[#B4ACCA] font-normal text-base w-fit">
                {CountryLisT?.map(
                  (item, index) =>
                    item.label === CountryUrl && (
                      <>
                        <Image
                          src={item.image}
                          alt={item.label}
                          className="h-4.5 object-center w-[26px]"
                        />
                        <span>{item.code}</span>
                      </>
                    )
                )}
              </div>
              <Input
                {...register("number", {
                  required: "Phone Number is required",
                  maxLength: {
                    value: 10,
                    message: "Number must be 10 digits",
                  },
                  minLength: {
                    value: 10,
                    message: "Number must be 10 digits",
                  },
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Only numbers (0-9) allowed",
                  },
                })}
                name="number"
                id="number"
                onBlur={checkPhonenNumber}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Input your number (10 digits)"
                className="h-[60px] py-[15px] px-[16px] rounded-[10px] border-0 outline-0 bg-white placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100 focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {errors.number && (
              <p className="text-xs text-red-500 mt-3">
                {errors.number.message}
              </p>
            )}
          </Label>

          <Label htmlFor="First name" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Referral code (Optional)
            </span>

            <Input
              {...register("referral")}
              name="referral"
              id="referral"
              type="text"
              placeholder="Referral code of the user that referred you"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
          </Label>

          <Button
            type="submit"
            disabled={isEmailError || isNumberError || isUsernameError}
            className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              `Continue`
            )}
          </Button>

          <div className="text-center justify-center flex lg:text-base text-sm text-gray-700 font-normal font-inter">
            <span>Already have an account?</span> &nbsp;
            <Link href={"/signin"} className="font-semibold  text-primary-100">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
