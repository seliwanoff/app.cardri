"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";
import { useAuthStep } from "@/stores/misc";

import { UserData } from "@/types";
import SigninForm from "@/components/auth/signinForm";

const SignIn = () => {
  const { step, setStep } = useAuthStep();

  const searchParams = useSearchParams();

  useEffect(() => {
    const RegStep = searchParams.get("step") || "0";
    setStep(Number(RegStep));
  }, []);

  return (
    <div
      className={cn(
        "bg-[#F5F2FB]   flex justify-center items-center",
        step !== 1 && "h-[100vh]"
      )}
    >
      <SigninForm />
    </div>
  );
};

export default SignIn;
