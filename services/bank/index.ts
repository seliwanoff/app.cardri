import { queryClient } from "@/components/layout/tanstackProvider";
import { fetchData, postData } from "@/lib/api";
import axiosInstance from "@/lib/axiosInstance";
import { createWirePaymentType, wireBeneficiaryType } from "@/types";
import { UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

export const resolveAccountInfo = async (
  bank: string,
  bankCode: string
): Promise<UseQueryResult<AxiosResponse<any>>> =>
  await queryClient.fetchQuery({
    queryKey: ["Account profile"],
    queryFn: async () => {
      try {
        const instance = axios.create({
          baseURL: "https://api.cardri.ng/api/v1",
        });

        const response = await instance.post("/resolve_account", {
          accountNumber: bank,
          bankCode,
        });
        return response.data;

        // OR if fetchData is a custom wrapper:
      } catch (error) {
        console.error("Failed to verify bank details:", error);
        return null;
      }
    },
  });

export const getBanks = async (): Promise<
  UseQueryResult<AxiosResponse<any>>
> => {
  return await queryClient.fetchQuery({
    queryKey: ["Bank"],
    queryFn: async () => {
      try {
        const instance = axios.create({
          baseURL: "https://api.cardri.ng/api/v1", // Without /v1
        });

        const response = await instance.get("/get-bank-list");
        return response.data?.data.bankList;

        // OR if fetchData is a custom wrapper:
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        return null;
      }
    },
  });
};

export const getCountries = async (): Promise<
  UseQueryResult<AxiosResponse<any>>
> => {
  return await queryClient.fetchQuery({
    queryKey: ["Country"],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get("wire/available-countries");
        return response.data.data;

        // OR if fetchData is a custom wrapper:
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        return null;
      }
    },
  });
};

export const getWireBeneficiary = async (): Promise<
  UseQueryResult<AxiosResponse<any>>
> => {
  return await queryClient.fetchQuery({
    queryKey: ["Get beneficiary"],
    queryFn: async () => {
      try {
        const response = await fetchData("wire/get-beneficiary");
        //@ts-ignore
        return response.data;
      } catch (error) {
        console.error("Failed to fetch banks:", error);
        return null;
      }
    },
  });
};

export const createWirePayBeneficiary = async (
  payload: wireBeneficiaryType
): Promise<AxiosResponse<any>> => {
  try {
    const formData = new FormData();

    // Append all fields to FormData (example)
    Object.entries(payload).forEach(([key, value]) => {
      // Skip undefined/null values (optional)
      if (value !== undefined && value !== null) {
        // Handle file separately if needed
        if (key === "image" && value instanceof File) {
          formData.append(key, value, value.name);
        } else {
          formData.append(key, value);
        }
      }
    });

    const response = await postData("wire/createbeneficiary", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Explicitly set for Axios
      },
    });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating beneficiary");
  }
};

export const createWirepayment = async (
  payload: createWirePaymentType
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("wire/make-payment", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating beneficiary");
  }
};

export const tranferToBank = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("general/transfer", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating beneficiary");
  }
};
export const createChinaPayment = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("china-pay", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating china pay");
  }
};

export const createAirtimePayment = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("airtime", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating airtime payment");
  }
};

export const createDataPayment = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("data", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating data payment");
  }
};

export const createElectricityPayment = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("electricity", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Unknown error occurred while creating electricity payment"
    );
  }
};

export const createDomPayment = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("fund-dom-account", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating beneficiary");
  }
};
