export type Status =
  | "pending"
  | "reviewed"
  | "approved"
  | "rejected"
  | "accepted";

export function numberWithCommas(x: any) {
  if (isNaN(parseFloat(x)) || !isFinite(x)) {
    return "0.00";
  }

  return parseFloat(x).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// GET UID
export const getBrowserUID = (): string => {
  const STORAGE_KEY = "browser_uid";

  // Check if we already have a UID in localStorage
  const storedUid = localStorage.getItem(STORAGE_KEY);

  if (storedUid) {
    return storedUid;
  }

  // Generate a new UUID
  const newUid = (() => {
    // Try crypto.randomUUID() first if available
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback UUID v4 generator
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  })();

  // Store for future visits
  localStorage.setItem(STORAGE_KEY, newUid);

  return newUid;
};

export const getStatusText = (status: Status | string) => {
  const firstChar = status?.charAt(0)?.toUpperCase();
  const rest = status?.slice(1).toLowerCase();
  return `${firstChar}${rest}`;
};

export const getTextStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "7":
      return "Pending";
    case "1":
      return "Completed";
    case "archived":
      return "bg-red-500/5 border-red-500 text-red-500";
    case "draft":
      return "bg-gray-500/5 border-gray-500 text-gray-500";
    case "0":
      return "Failed";
  }
};

// types.ts (create this if you don't have it)
export interface Transaction {
  id: string;
  type: "credit" | "debit" | "transfer" | string; // More specific if possible
  amount: number;
  date: string;
  network: string;
  reciever: string;
  // Add other fields as needed
}

export interface MonthlyTransactionGroup {
  month: string;
  total: number;
  transactions: Transaction[];
}

// transactionHelpers.ts
export const filterTransactionsByType = (
  transactionGroups: MonthlyTransactionGroup[],
  type: Transaction["type"],
  network?: string // Make network optional
): MonthlyTransactionGroup[] => {
  return transactionGroups
    .map((group) => {
      const filteredTransactions = group.transactions.filter((tx) => {
        const typeMatches = tx.type === type;
        // If network is provided, check network match too
        const networkMatches = network ? tx.network === network : true;
        return typeMatches && networkMatches;
      });

      return {
        ...group,
        transactions: filteredTransactions,
        total: filteredTransactions.length,
      };
    })
    .filter((group) => group.total > 0);
};

export const getFormattedTransactions = (
  transactionGroups: MonthlyTransactionGroup[] | undefined
): Transaction[] => {
  if (!transactionGroups) return [];

  // Flatten all transactions across months
  return transactionGroups.flatMap((group) =>
    group.transactions.map((tx) => ({
      ...tx,
      // Add any formatting here
      date: new Date(tx.date).toLocaleDateString(),
      amount: parseFloat(tx.amount.toFixed(2)),
    }))
  );
};
