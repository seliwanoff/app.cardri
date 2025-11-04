import { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
//import { StatusPill } from "@/components/ui/status-pill";
import transactionLog from "@/public/assets/transaction/tranaction.png";
import { getTextStatus, Status } from "@/helper";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { getCurrencyByType, networkName, transactionType } from "@/lib/misc";

// Types
interface Transaction {
  id: number;
  user: string;
  reciever: string | null;
  type: string;
  network: string | null;
  amount: string;
  ref: string;
  created_at: string;
  status: string;
  phoneNumber?: string;
  cref: string;
  plan: string;
}

interface StatusPillProps {
  status: any;
}

interface MonthlyData {
  month: string;
  payin: number;
  payout: number;
  transactions: Transaction[];
}

interface TransactionsComponentProps {
  data: MonthlyData[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

const numberWithCommas = (x: number | string): string => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const formatMonth = (monthString: string): string => {
  const [year, month] = monthString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "7":
      return " text-[#FA9232] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
    case "1":
      return "  text-[#1FBA79] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
    case "archived":
      return "bg-red-500/5 border-red-500 text-red-500";
    case "draft":
      return "bg-gray-500/5 border-gray-500 text-gray-500";
    case "0":
      return " font-inter text-[10px] border-0 text-red-500";
  }
};

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  return (
    <span
      className={cn(
        "inline-flex w-20 items-center justify-center rounded-full border px-2 py-1 text-xs font-medium",
        getStatusColor(status)
      )}
    >
      {getTextStatus(status)}
    </span>
  );
};

// Mobile Components
const MobileTransactionItem = ({
  transaction,
}: {
  transaction: Transaction;
}) => {
  return (
    <div className="bg-white rounded-xl p-4  mb-3 border border-gray-100">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transactionType(transaction.type)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{transaction.ref}</p>
        </div>
        <StatusPill
          status={
            //@ts-ignore
            transaction.status
          }
        />
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">Amount:</span>
        <span className="text-sm font-semibold text-gray-900">
          {getCurrencyByType(transaction.type)}{" "}
          {numberWithCommas(transaction.amount)}
        </span>
      </div>

      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">To:</span>
        <span className="text-sm text-gray-900 truncate ml-2 text-right">
          {transaction.reciever || transaction.phoneNumber || "N/A"}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Date:</span>
        <span className="text-sm text-gray-500">
          {new Date(transaction.created_at).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

const MonthlySection = ({
  monthData,
  isFirst,
}: {
  monthData: MonthlyData;
  isFirst: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(isFirst);

  return (
    <div className="mb-6">
      <div
        className="flex justify-between items-center bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {formatMonth(monthData.month)}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              +{getCurrencyByType("1")}
              {numberWithCommas(monthData.payin)}
            </span>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
              -{getCurrencyByType("1")}
              {numberWithCommas(monthData.payout)}
            </span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {monthData.transactions.map((transaction) => (
            <MobileTransactionItem
              key={transaction.id}
              transaction={transaction}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Skeleton Loaders
const MobileSkeleton = () => {
  return (
    <div className="space-y-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-4  border border-gray-100"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
    </div>
  );
};

const TableSkeleton = () => {
  return (
    <>
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <TableRow key={i}>
            {Array(6)
              .fill(0)
              .map((__, j) => (
                <TableCell key={j}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
          </TableRow>
        ))}
    </>
  );
};

// Main Component
const TransactionsComponent = ({
  data,
  isLoading = false,
  onLoadMore,
  hasMore = false,
}: any) => {
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  // Flatten all transactions for the table view
  useEffect(() => {
    if (data && data.length > 0) {
      const flattened = data.flatMap(
        (monthData: any) => monthData.transactions
      );
      setAllTransactions(flattened);
    } else {
      setAllTransactions([]);
    }
  }, [data]);

  const handleScroll = useCallback(() => {
    if (isLoading || loadingMore || !hasMore || !onLoadMore) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Load more when 80% from bottom
    if (scrollTop + windowHeight >= documentHeight - documentHeight * 0.2) {
      setLoadingMore(true);
      onLoadMore();
      setTimeout(() => setLoadingMore(false), 1000);
    }
  }, [isLoading, loadingMore, hasMore, onLoadMore]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Empty state
  if (!isLoading && (!data || data.length === 0)) {
    return (
      <div className="w-full">
        <div className="hidden md:block">
          <div className="overflow-x-auto bg-white rounded-xl ">
            <Table>
              <TableHeader className="bg-[#FAF7FF]  text-[#9292A0] font-normal text-base py-4 px-6 rounded-xl border-0 ">
                <TableRow>
                  <TableHead className="xl:block hidden">TRX ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>TRX Type</TableHead>
                  <TableHead>Beneficiary</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <IsEmpty />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="block md:hidden p-4">
          <IsEmpty />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="block">
        <div className="overflow-x-auto bg-white rounded-xl p-6">
          <Table>
            <TableHeader className="bg-[#FAF7FF] border-b text-nowrap border-[#FAF7FF] text-[#9292A0] font-normal text-base py-4 px-6 rounded-xl">
              <TableRow>
                <TableHead className="xl:block hidden">TRX ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>TRX Type</TableHead>
                <TableHead>Beneficiary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="">
              {isLoading ? (
                <TableSkeleton />
              ) : allTransactions.length > 0 ? (
                allTransactions.slice(0, 10).map((transaction: Transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="hover:bg-[#FAF7FF] text-clip border-b-[#FAF7FF] border-b text-[#474256] font-inter text-base"
                  >
                    <TableCell className="xl:block hidden">
                      {transaction.ref}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-nowrap">
                      {getCurrencyByType(transaction.type)}{" "}
                      {numberWithCommas(
                        parseFloat(transaction.amount).toFixed(2)
                      )}
                    </TableCell>
                    <TableCell>{transactionType(transaction.type)}</TableCell>
                    <TableCell>
                      {transaction.reciever || transaction.phoneNumber}{" "}
                      {transaction.type === "6"
                        ? transaction.cref
                        : transaction.type === "12"
                        ? transaction.plan
                        : transaction.type === "1"
                        ? networkName(
                            //@ts-ignore
                            transaction.network
                          )
                        : transaction.type === "2" &&
                          networkName(
                            //@ts-ignore
                            transaction.network
                          )}
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        status={
                          //@ts-ignore
                          transaction.status
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <IsEmpty />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Mobile View */}
      <div className="hidden md:hidden">
        <div className="p-4">
          {isLoading ? (
            <MobileSkeleton />
          ) : (
            <div className="space-y-4">
              {data.map((monthData: any, index: any) => (
                <MonthlySection
                  key={monthData.month}
                  monthData={monthData}
                  isFirst={index === 0}
                />
              ))}
            </div>
          )}

          {/* Mobile Load More Indicator */}
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}

          {hasMore && !loadingMore && (
            <div className="text-center py-4 text-sm text-gray-500">
              Scroll down to load more transactions
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionsComponent;
const IsEmpty = () => {
  return (
    <div className="flex flex-col gap-4 my-10 items-center justify-center w-full h-full">
      <Image
        src={transactionLog}
        alt="transaction log"
        className="w-[201px] h-[220px] object-center"
      />
      <h3 className="text-[#474256] font-inter text-[14px] font-normal">
        You have no transaction yet!
      </h3>
    </div>
  );
};
