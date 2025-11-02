// hooks/useManagementData.ts

"use client";
import { getManagementData } from "@/services/lib";
import { useManageStore } from "@/stores/managementStore";
import { useEffect } from "react";

export const useManagementData = () => {
  const { managementData, loading, error } = useManageStore();

  useEffect(() => {
    if (!managementData && !loading && !error) {
      getManagementData();
    }
  }, [managementData, loading, error]);

  return {
    data: managementData,
    loading,
    error,
    refresh: getManagementData,
  };
};
