"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
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
        "inline-flex w-20 items-center justify-center rounded-full border px-2 py-1 text-xl font-medium",
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
      queryParams.set(key, value);
    } else {
      queryParams.delete(key);
    }

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

  const searchParams = useSearchParams();

  const loadMore = () => {
    if (!isLoading && hasMore) {
      // const nextPage = page + 1;
      // setPage(nextPage);
      // fetchTransactions(nextPage);
    }
  };

  useEffect(() => {
    setSearchTerm(searchParams.get("search") || "");

    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const statusParam = searchParams.get("status");

    setStartDate(startDateParam ? new Date(startDateParam) : null);
    setEndDate(endDateParam ? new Date(endDateParam) : null);
    setActiveStatus(statusParam || "all");
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(window.location.search);

    // Update status
    params.set("status", activeStatus);

    // Update dates
    if (startDate) {
      params.set("startDate", startDate.toISOString());
    } else {
      params.delete("startDate");
    }
    if (endDate) {
      params.set("endDate", endDate.toISOString());
    } else {
      params.delete("endDate");
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
    setOpenFilter(false);
  };

  const clearAllFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setActiveStatus("all");

    const params = new URLSearchParams(window.location.search);
    params.delete("startDate");
    params.delete("endDate");
    params.delete("status");

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="justify-between items-center bg-white p-4 rounded-xl mt-4">
        <div className="rounded-2xl bg-white p-[14px] w-full">
          {/* OPTIONS */}
          <div className="">
            <div className="flex items-center justify-between">
              <div className="flex justify-between gap-4 lg:justify-start items-center w-full">
                <div className="flex lg:gap-4 justify-between w-full">
                  <div className="flex lg:gap-4 w-full items-center">
                    <span className="lg:block hidden font-medium ">Filter</span>
                    <Select
                      value={activeStatus}
                      onValueChange={setActiveStatus}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-[150px] rounded-full border border-gray-100 focus:outline-none bg-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                        )}
                      >
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-0">
                        <SelectGroup>
                          <SelectItem value="all">All Transaction</SelectItem>
                          <SelectItem value="debit">Debit</SelectItem>
                          <SelectItem value="credit">Credit</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex lg:gap-4  w-full items-center justify-end">
                    <span className="lg:block hidden font-medium ">Sort</span>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-min justify-start gap-3 rounded-full px-3 pr-1 text-center text-sm font-normal bg-white border border-gray-100"
                          )}
                        >
                          {startDate && endDate
                            ? `${format(startDate, "MMM dd, yyyy")} - ${format(
                                endDate,
                                "MMM dd, yyyy"
                              )}`
                            : "Select date range"}
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#fff] border border-gray-100">
                            <Calendar size={20} color="#828282" />
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-4 bg-white"
                        align="start"
                      >
                        <CalenderDate
                          mode="range"
                          selected={{
                            from: startDate || undefined,
                            to: endDate || undefined,
                          }}
                          onSelect={(
                            range: { from?: Date; to?: Date } | undefined
                          ) => {
                            setStartDate(range?.from || null);
                            setEndDate(range?.to || null);
                          }}
                          className="rounded-md border border-gray-200"
                          numberOfMonths={2}
                        />
                        <div className="flex w-full items-center justify-between mt-4">
                          <button
                            className="rounded-full bg-[#F8F8F8] px-4 py-2 text-sm text-blue-500"
                            onClick={() => {
                              setStartDate(null);
                              setEndDate(null);
                            }}
                          >
                            Clear
                          </button>
                          <button
                            className="rounded-full bg-primary-100 px-4 py-2 text-sm text-white"
                            onClick={() => {
                              const params = new URLSearchParams(
                                window.location.search
                              );
                              if (startDate) {
                                params.set(
                                  "startDate",
                                  startDate.toISOString()
                                );
                              } else {
                                params.delete("startDate");
                              }
                              if (endDate) {
                                params.set("endDate", endDate.toISOString());
                              } else {
                                params.delete("endDate");
                              }
                              window.history.replaceState(
                                null,
                                "",
                                `${
                                  window.location.pathname
                                }?${params.toString()}`
                              );
                            }}
                          >
                            Apply
                          </button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer open={openFilter} onOpenChange={setOpenFilter}>
        <DrawerContent className="bg-white max-h-[90vh]">
          <DrawerHeader className="text-left border-b border-gray-200">
            <DrawerTitle className="text-lg font-semibold">
              Filter Options
            </DrawerTitle>
          </DrawerHeader>

          <div className="flex flex-col gap-6 py-4 px-4 overflow-y-auto">
            {/* Status Filter */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Transaction Status
              </label>
              <Select value={activeStatus} onValueChange={setActiveStatus}>
                <SelectTrigger className="w-full rounded-lg border border-gray-200 bg-white py-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200">
                  <SelectGroup>
                    <SelectItem value="all">All Transaction</SelectItem>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Filter */}
            <div className="flex flex-col gap-4">
              <label className="text-sm font-medium text-gray-700">
                Date Range
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-white border border-gray-200 py-3"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate && endDate
                      ? `${format(startDate, "MMM dd, yyyy")} - ${format(
                          endDate,
                          "MMM dd, yyyy"
                        )}`
                      : "Select date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="center">
                  <CalenderDate
                    mode="range"
                    selected={{
                      from: startDate || undefined,
                      to: endDate || undefined,
                    }}
                    onSelect={(
                      range: { from?: Date; to?: Date } | undefined
                    ) => {
                      setStartDate(range?.from || null);
                      setEndDate(range?.to || null);
                    }}
                    className="rounded-md border"
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Action Buttons - Fixed at bottom */}
          <div className="flex gap-3 p-4 border-t border-gray-200 bg-white sticky bottom-0">
            <button
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
            <button
              className="flex-1 rounded-lg bg-primary-100 px-4 py-3 text-sm font-medium text-white  transition-colors"
              onClick={applyFilters}
            >
              Apply Filters
            </button>
          </div>
        </DrawerContent>
      </Drawer>

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
