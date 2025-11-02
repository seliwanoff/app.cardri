import { MonthlyTransactionGroup, Transaction } from "@/helper";
import { fetchData, postData } from "@/lib/api";
import { useManageStore } from "@/stores/managementStore";
import { AxiosResponse } from "axios";

// api/management.ts

export const getManagementData = async (): Promise<any> => {
  const { setManagementData, setLoading, setError } = useManageStore.getState();

  try {
    setLoading(true);
    setError(null);

    const response = await fetchData("/management");

    // Update the store with the response data

    if (response) {
      //@ts-ignore
      setManagementData(response.data);
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      setError(error);
      throw error;
    }

    const unknownError = new Error(
      "Unknown error occurred while checking email"
    );
    setError(unknownError);
    throw unknownError;
  } finally {
    setLoading(false);
  }
};

type payLoadProps = {
  from: string;
  to: string;
  amount?: string | number;
};
export const getRate = async (payload: payLoadProps): Promise<any> => {
  try {
    const response = await postData("/wire/get-rate", payload);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    const unknownError = new Error(
      "Unknown error occurred while checking email"
    );

    throw unknownError;
  }
};

export const getMerchant = async (payload: any): Promise<any> => {
  try {
    const response = await postData("/getmearchant", payload);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    const unknownError = new Error(
      "Unknown error occurred while checking email"
    );

    throw unknownError;
  }
};

export const getVariation = async (payload: any): Promise<any> => {
  try {
    const response = await fetchData(`/get-variations?serviceID=${payload}`);

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    const unknownError = new Error(
      "Unknown error occurred while checking email"
    );

    throw unknownError;
  }
};

export const getPurpose = async (): Promise<any> => {
  try {
    const response = await fetchData("/wire/get-purpose");

    return response;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    const unknownError = new Error(
      "Unknown error occurred while checking email"
    );

    throw unknownError;
  }
};

export const getTransactions = async (): Promise<MonthlyTransactionGroup[]> => {
  try {
    const response = await fetchData("get-transactions?count=100");
    //@ts-ignore
    return response.data as MonthlyTransactionGroup[]; // Cast to correct type
  } catch (error) {
    console.error("Failed to fetch transactions:", error);
    throw error;
  }
};

export const getTransactionById = async (id: string) => {
  try {
    const response = await fetchData(`get-single-transaction?ref=${id}`);
    //@ts-ignore
    return response.data as Transaction;
  } catch (error) {
    console.error("Failed to fetch transaction:", error);
    throw error;
  }
};
export interface DataPlan {
  id: string;
  name: string;
  price: number;
  validity: string;
  plan: string;
  planid?: string;
  // ... other plan properties
}

interface PlanResponse {
  Status: boolean;
  mtn: DataPlan[];
  glo: DataPlan[];
  airtel: DataPlan[];
  "9mobile": DataPlan[];
}

export const getPlanTwo = async (): Promise<PlanResponse> => {
  try {
    const response = await fetchData("get-data/two");
    //@ts-ignore
    return response;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};
