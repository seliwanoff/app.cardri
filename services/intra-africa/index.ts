import { queryClient } from "@/components/layout/tanstackProvider";
import { fetchData, postData } from "@/lib/api";
import axiosInstance from "@/lib/axiosInstance";
import { createWirePaymentType, wireBeneficiaryType } from "@/types";
import { UseQueryResult } from "@tanstack/react-query";
import axios, { AxiosResponse } from "axios";

export const getChannel = async (country: string): Promise<[any]> => {
  try {
    const response = await fetchData(
      `intra-africa/getchannels?country=${country}`
    );
    //@ts-ignore
    return response.channels; // Cast to correct type
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};

export const getNetwork = async (country: string): Promise<[any]> => {
  try {
    const response = await fetchData(
      `intra-africa/getnetworks?country=${country}`
    );
    //@ts-ignore
    return response.networks; // Cast to correct type
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};

export const getRate = async (country: string): Promise<[any]> => {
  try {
    const response = await fetchData(
      `intra-africa/getrates?currency=${country}`
    );
    //@ts-ignore
    return response; // Cast to correct type
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};
export const sendIntraAfricaRequest = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("intra-africa/submitrequest", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Unknown error occurred while creating creating intra africa"
    );
  }
};
