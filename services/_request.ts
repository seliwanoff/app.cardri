import { postData } from "@/lib/api";
import { UserData } from "@/types";
import { AxiosResponse } from "axios";

export const checkEmailInputted = async (
  email: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("/auth/check-email", { email });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Unknown error occurred while checking email");
    throw new Error("Unknown error occurred while checking email");
  }
};

export const checkPhoneInputted = async (
  phone: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("/auth/check-phonenumber", {
      phoneNumber: "234" + phone,
    });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Unknown error occurred while checking email");
    throw new Error("Unknown error occurred while checking email");
  }
};

export const checkUsernameInputted = async (
  username: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("/auth/check-username", {
      username,
    });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error("Unknown error occurred while checking email");
    throw new Error("Unknown error occurred while checking email");
  }
};

export const registerUser = async (
  user: UserData
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("auth/register", user);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};
export const sendPhoneNUmberVerification = async (): Promise<
  AxiosResponse<any>
> => {
  try {
    const response = await postData("auth/send-phone-verification-code");
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};

export const verifyPhoneNumberUsedForRegistration = async (
  code: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("auth/confirm-phone", { code });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};

export const setTransactionPIN = async (
  pin: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("auth/set-pin", { pin });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};
export const verifyTransactionPin = async (
  pin: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("auth/verifypin", { pin });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};

export const verifyLoginPin = async (
  phone: string,
  id: string,
  code: string
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("auth/verify-login-device", {
      phone,
      id,
      code,
    });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while checking email");
  }
};
