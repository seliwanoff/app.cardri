"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TransferPage from "@/components/transfer/local_type";
import WireTransferpage from "@/components/transfer/wire_type";
import DomTransferPage from "@/components/transfer/dom_type";
import ChinaTransferPage from "@/components/transfer/china_type";
import AirtimePage from "@/components/bill/airtime";
import DataPage from "@/components/bill/data";
import ElectricityPage from "@/components/bill/electricity";
import TvPage from "@/components/bill/tv";

const BillPaymentType = () => {
  const searchParams = useSearchParams();
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const urlType = searchParams.get("type");
    setType(urlType);
  }, [searchParams]);

  const renderContent = () => {
    switch (type) {
      case "airtime":
        return <AirtimePage />;
      case "data":
        return <DataPage />;
      case "electricity":
        return <ElectricityPage />;
      case "china-pay":
        return <ChinaTransferPage />;
      case "cable":
        return <TvPage />;
      case null:
        return <div>Loading...</div>;
      default:
        return <div>Invalid transfer type</div>;
    }
  };

  return <div className="h-full overflow-y-auto mt-5">{renderContent()}</div>;
};

export default BillPaymentType;
