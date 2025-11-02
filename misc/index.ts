import { CountryLisT } from "@/lib/assets";
import { currencySymbols } from "@/lib/misc";
import { useUserStore } from "@/stores/currentUserStore";

export const getCountryCode = (search: string): string | undefined => {
  const country = CountryLisT?.find(
    (country: any) => country.label.toLowerCase() === search.toLowerCase()
  );
  return country?.code;
};

export const formatDateToRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();

  // Check if the date is today
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Format the time part (12-hour format with AM/PM)
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const formattedTime = timeFormatter.format(date);

  return isToday
    ? `Today ${formattedTime}`
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + ` ${formattedTime}`;
};
