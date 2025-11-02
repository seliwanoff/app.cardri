import { fetchData, postData } from "@/lib/api";
import { AxiosResponse } from "axios";

export const swapRequest = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  try {
    const response = await postData("/convert-balance", payload);
    //@ts-ignore
    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error occurred while creating china pay");
  }
};
