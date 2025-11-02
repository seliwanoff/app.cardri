import { fetchData, postData } from "@/lib/api";
import { AxiosResponse } from "axios";

export const createPaymentLink = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("paymentlink/generatepaymentlink", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating china pay");
  }
};

export const getPaymentLinks = async (): Promise<any[]> => {
  try {
    const response = await fetchData("paymentlink/get-links");
    //@ts-ignore

    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while fetching payment links");
  }
};
