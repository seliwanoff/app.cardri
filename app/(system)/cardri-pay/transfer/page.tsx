"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import TransferPage from "@/components/transfer/local_type";
import WireTransferpage from "@/components/transfer/wire_type";
import DomTransferPage from "@/components/transfer/dom_type";
import ChinaTransferPage from "@/components/transfer/china_type";
import IntraAfricaPage from "@/components/transfer/intra-africa";

const TransferPageByType = () => {
  const searchParams = useSearchParams();
  const [type, setType] = useState<string | null>(null);

  useEffect(() => {
    const urlType = searchParams.get("type");
    setType(urlType);
  }, [searchParams]);

  const renderContent = () => {
    switch (type) {
      case "local":
        return <TransferPage />;
      case "wire":
        return <WireTransferpage />;
      case "dom":
        return <DomTransferPage />;
      case "china-pay":
        return <ChinaTransferPage />;
      case "intra-africa":
        return <IntraAfricaPage />;
      case null:
        return <div>Loading...</div>;
      default:
        return <div>Invalid transfer type</div>;
    }
  };

  return <div className="h-full overflow-y-auto mt-5">{renderContent()}</div>;
};

export default TransferPageByType;
