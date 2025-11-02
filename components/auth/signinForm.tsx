"use client";

import { useForm, SubmitHandler, Controller } from "react-hook-form";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { FaSpinner } from "react-icons/fa";
import { Button } from "../ui/button";

import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { userSignIn } from "@/services/auth";
import { getBrowserUID } from "@/helper";
import { useDeviceBindingOverlay } from "@/stores/overlay";
import DeviceBindingModal from "../modal/device-binding-modal";
import { useRemoteUserStore } from "@/stores/remoteUser";
import { useUserStore } from "@/stores/currentUserStore";

type FormValues = {
  id: string;

  password: string;
};
interface PasswordProps {
  setUserData?: any;
}
const SigninForm = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      id: "",
      password: "",
    },
  });
  const router = useRouter();

  const { setOpen, setId } = useDeviceBindingOverlay();
  const { setUser } = useRemoteUserStore();
  const loginUser = useUserStore((state) => state.loginUser);

  const [isLoading, setIsloading] = useState(false);

  const [eye1, setEye1] = useState(false);

  const handleToggle1 = () => {
    setEye1((prev: boolean) => !prev);
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (isSubmitting || isLoading) return;
    const uid = getBrowserUID();
    const toastId = toast.loading("Logging in...");
    try {
      setIsloading(true);
      const response = await userSignIn(data.id, data.password, uid);
      //console.log("response", response);
      //@ts-ignore
      if (response && response.message === "code sent") {
        //@ts-ignore
        setId(response.userid);
        toast.success(
          "Code has been sent to registered number for verification",
          { id: toastId }
        );
        setOpen(true);
      } else {
        //@ts-ignore
        loginUser(response.data);
        //@ts-ignore
        setUser(response.data);

        //@ts-ignore
        localStorage.setItem("access_token", JSON.stringify(response.token));
        //@ts-ignore
        localStorage.setItem("refresh_token", JSON.stringify(response.token));
        //@ts-ignore
        localStorage.setItem("token_type", JSON.stringify(response.token));

        toast.success("Login succesfully.", { id: toastId });
        router.push("/dashboard/root");
      }
    } catch (error) {
      console.log(error);
      //@ts-ignore
      toast.error(error?.response.data.message || "Invalid credentials", {
        id: toastId,
      });
    } finally {
      setIsloading(false);
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="w-full max-w-[522px] flex flex-col gap-[42px]  justify-center items-center  mb-28 pt-32 ">
      <div className="w-full">
        <h1 className="text-secondary-500 text-4xl text-left font-sora font-bold  leading-[48px]">
          Welcome back
        </h1>
        <span className="text-[22px] font-normal font-inter text-left  text-[#464646] leading-[28px] mt-4 inline-block">
          Kindly login to your cardri account.
        </span>
      </div>

      <div className="w-full">
        <form
          id="sign-up"
          className=" [&>label]:block flex flex-col gap-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Label htmlFor="First name" className="flex flex-col gap-4">
            <span className="font-inter font-normal text-base text-label-100">
              Email or Username
            </span>

            <Input
              {...register("id", { required: "ID's  is required" })}
              name="id"
              id="id"
              type="text"
              placeholder="Input your email or username"
              className="h-[60px] mt-4 py-[15] px-[16px] rounded-[10px] border-0 outline-0 bg-[#fff] placeholder:text-base placeholder:font-extralight placeholder:text-placeholder-100  focus-visible:ring-primary-100 focus-visible:ring-offset-0 text-base font-normal"
            />
            {errors.id && (
              <p className="text-xs text-red-500 mt-3">{errors.id.message}</p>
            )}
          </Label>
          <Label htmlFor="password">
            <span className="inline-block text-base font-normal text-label-100">
              Password
            </span>
            <div className="relative">
              <Input
                type={eye1 ? "text" : "password"}
                id="password"
                {...register("password", {
                  required: "Password is required",
                })}
                placeholder="Input password"
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
              <span className="mt-4 inline-block text-red-600">
                {errors.password.message}
              </span>
            )}
          </Label>
          <Button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="w-full rounded-xl cursor-pointer mt-4 bg-primary-100 text-white font-inter font-medium text-[20px] h-[60px] flex justify-center items-center"
          >
            {isSubmitting ? (
              <FaSpinner className="animate-spin text-white" />
            ) : (
              `Continue`
            )}
          </Button>
        </form>
      </div>
      <DeviceBindingModal />
    </div>
  );
};

export default SigninForm;
