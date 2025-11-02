import NGN from "@/public/assets/currencies/NGNCurrency.png";
import USD from "@/public/assets/currencies/DollarCurrency.png";
import EUR from "@/public/assets/currencies/EurCurrency.png";
import GBP from "@/public/assets/currencies/PoundsCurrency.png";
import JPY from "@/public/assets/currencies/jpy.png";
import glo from "@/public/assets/network/glo.png";
import mtn from "@/public/assets/network/mtn.png";
import airtel from "@/public/assets/network/airtel.png";
import mobile from "@/public/assets/network/mobile.png";

export const currencySymbols = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    NGN: "₦",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$", // Australia flag + AUD symbol
    CAD: "C$", // Canada flag + CAD symbol
    CHF: "₣", // Switzerland flag + Franc symbol
    CNY: "¥", // China flag + Yuan symbol
    INR: "₹", // India flag + Rupee symbol
    KRW: "₩", // South Korea flag + Won symbol
    MXN: "$", // Mexico flag + Peso symbol
    RUB: "₽", // Russia flag + Ruble symbol
    ZAR: "R", // South Africa flag + Rand symbol
    BRL: "R$", // Brazil flag + Real symbol
    SEK: "kr", // Sweden flag + Krona symbol
    SGD: "S$", // Singapore flag + SGD symbol
  };

  return symbols[currency] || currency;
};

export const getCurrencyByType = (type: string) => {
  switch (type) {
    case "1":
      return "₦";
    case "2":
      return "₦";
    case "6":
      return "₦";
    case "31":
      return "₦";
    case "30":
      return "$";
    case "35":
      return "₦";
    case "0":
      return "";
  }
};

export const networkName = (network: string): string => {
  const names: { [key: string]: string } = {
    1: "MTN",
    2: "Airtel",
    3: "Glo",
    4: "9mobile",
  };

  return names[network] || network;
};

export const transactionType = (network: string): string => {
  const names: { [key: string]: string } = {
    1: "Airtime purchase",
    2: "Data purchae",
    30: "Wire payment",
    31: "DOM Payment",
    35: "Alipay",
    12: "Local transfer",
    6: "Deposit",
    23: "Swap funds",
  };

  return names[network] || network;
};
export const currencyImages = (currency: string): string => {
  const imagePaths: { [key: string]: any } = {
    NGN: NGN,
    USD: USD,
    EUR: EUR,
    GBP: GBP,
    JPY: JPY,
  };

  return imagePaths[currency] || "/images/currencies/generic.png";
};

export const networkImage = (currency: string): string => {
  const imagePaths: { [key: string]: any } = {
    1: mtn,
    2: airtel,
    3: mobile,
    4: glo,
  };

  return imagePaths[currency] || "/images/currencies/generic.png";
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    // Format as million with 2 decimal places if needed
    const millionValue = num / 1000000;
    return millionValue % 1 === 0
      ? `${millionValue.toFixed(0)}M`
      : `${millionValue.toFixed(2)}M`;
  } else if (num >= 1000) {
    // Add commas for thousands
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return num.toString();
};

export const calculateCommision = (amount: string, rate: string) => {
  if (isNaN(parseFloat(amount))) return;
  let commision = parseFloat(amount) * parseFloat(rate);

  return commision;
};

// utils/downloadReceipt.ts
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useManagementData } from "@/hooks/useManagementData";
import { getPlanTwo } from "@/services/lib";

export const downloadReceipt = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};

interface DataPlan {
  id: string;
  name: string;
  price: number;
  validity: string;
  plan: string;
}

export const useNetworkPlans = () => {
  const getNetworkPlans = async (network: string): Promise<DataPlan[]> => {
    try {
      const response = await getPlanTwo();

      // console.log(response);

      const networkKey = network.toLowerCase();

      //@ts-ignore
      return response[networkKey] || [];
    } catch (error) {
      console.error(`Error getting ${network} plans:`, error);
      throw error;
    }
  };

  return { getNetworkPlans };
};
