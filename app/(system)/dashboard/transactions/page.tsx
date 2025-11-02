"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import transactionLog from "@/public/assets/transaction/tranaction.png";
import { format } from "date-fns";
import { Calendar as CalenderDate } from "@/components/ui/calendar";
import { Calendar, Setting4 } from "iconsax-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search, X } from "lucide-react";
import {
  getTextStatus,
  MonthlyTransactionGroup,
  numberWithCommas,
  Status,
} from "@/helper";
import { getTransactions } from "@/services/lib";
import { getCurrencyByType, transactionType } from "@/lib/misc";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "next/navigation";
import TransactionsComponent from "@/components/transaction-component";
interface StatusPillProps {
  status: Status;
}
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "7":
      return " text-[#474256] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
    case "1":
      return "  text-[#474256] font-inter border-0 text-[10px] font-normal leading-[16px] p-[10px]";
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
export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [openFilter, setOpenFilter] = useState<boolean>(false);
  const [activeStatus, setActiveStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [hasMore, setHasMore] = useState(true);

  const updateQueryParams = (key: string, value: string | null) => {
    const queryParams = new URLSearchParams(window.location.search);

    if (value) {
      queryParams.set(key, value); // Add or update parameter
    } else {
      queryParams.delete(key); // Remove parameter if value is null
    }

    // Update the URL without reloading
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${queryParams.toString()}`
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    updateQueryParams("search", value);
  };

  const { data: transactions, isLoading } = useQuery<
    MonthlyTransactionGroup[],
    Error
  >({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  // console.log(transactions);
  const searchParams = useSearchParams();
  const loadMore = () => {
    if (!isLoading && hasMore) {
      //  const nextPage = page + 1;
      //  setPage(nextPage);
      // fetchTransactions(nextPage);
    }
  };
  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");

    // Parse date params

    // Parse date params
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    setStartDate(startDateParam ? new Date(startDateParam) : null);
    setEndDate(endDateParam ? new Date(endDateParam) : null);
  }, [searchParams]);
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="hidden lg:flex justify-between items-center bg-white p-4 rounded-xl  mt-4">
        <div className="rounded-2xl bg-white p-[14px] w-full">
          {/* OPTIONS */}
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex justify-between gap-4 lg:justify-start items-center w-full ">
                <span>Filter</span>

                <div className="hidden lg:flex lg:gap-4  justify-between w-full">
                  <Select value={activeStatus} onValueChange={setActiveStatus}>
                    <SelectTrigger
                      className={cn(
                        "w-[150px] rounded-full  border border-gray-100 focus:outline-none bg-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                      )}
                    >
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-0">
                      <SelectGroup>
                        <SelectItem value="all">All Tranaction</SelectItem>
                        <SelectItem value="debit">Debit</SelectItem>
                        <SelectItem value="credit">Credit</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {/* NUMBER */}

                  {/* DATE */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-min justify-start gap-3 rounded-full px-3 pr-1 text-center text-sm font-normal bg-white border border-gray-100"
                        )}
                      >
                        {startDate && endDate
                          ? `${format(startDate, "PPP")} - ${format(
                              endDate,
                              "PPP"
                            )}`
                          : "Select date range"}
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff] border  border-gray-100">
                          <Calendar size={20} color="#828282" />
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4">
                      <div className="flex flex-col items-center gap-4 bg-white border-0">
                        <CalenderDate
                          mode="range"
                          className="border-0"
                          //@ts-ignore
                          selected={{ from: startDate, to: endDate }}
                          onSelect={(range: any) => {
                            setStartDate(range?.from || null);
                            setEndDate(range?.to || null);
                          }}
                          initialFocus
                        />

                        <div className="flex w-full items-center justify-between">
                          <button
                            className="rounded-full bg-[#F8F8F8] px-2 py-1 text-sm text-blue-500"
                            onClick={() => {
                              updateQueryParams("startDate", null);
                              updateQueryParams("endDate", null);
                              setStartDate(null);
                              setEndDate(null);
                            }}
                          >
                            Clear
                          </button>
                          <button
                            className="rounded-full bg-blue-500 px-2 py-1 text-sm text-[#F8F8F8]"
                            // onClick={applyFilters}
                            onClick={() => {
                              // Update the URL with the selected dates
                              const params = new URLSearchParams(
                                window.location.search
                              );
                              if (startDate)
                                params.set(
                                  "startDate",
                                  startDate.toISOString()
                                );
                              if (endDate)
                                params.set("endDate", endDate.toISOString());
                              window.history.replaceState(
                                null,
                                "",
                                `${
                                  window.location.pathname
                                }?${params.toString()}`
                              );
                            }}
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* -- filter icon */}
                <div
                  onClick={() => setOpenFilter(true)}
                  className="inline-flex cursor-pointer items-center justify-center gap-3 rounded-full border bg-white p-1 pr-3 lg:hidden"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F8F8]">
                    <Setting4 size={20} />
                  </span>
                  <span>Filter</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
        <TransactionsComponent
          data={transactions}
          isLoading={isLoading}
          onLoadMore={loadMore}
          hasMore={hasMore}
        />
      </div>
    </div>
  );
}
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
