import {
  Bell,
  LogOut,
  LucideIcon,
  Menu,
  OctagonAlert,
  Settings,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Avater from "@/public/assets/avater/avater.png";
import { useUserStore } from "@/stores/currentUserStore";
import { usePathname } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@radix-ui/react-select";
import { HambergerMenu } from "iconsax-react";
import { useSidebar } from "@/stores/overlay";

const DashTopNav = () => {
  const currentUser = useUserStore((state) => state.user);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { open: isOpen, setOpen: setIsOpen } = useSidebar();

  //console.log("currentUser", currentUser);
  //@ts-ignore
  const name = currentUser?.firstName;

  const pathname = usePathname();

  const routeSegment = pathname?.split("/dashboard/")[1];
  let displayName = "";

  if (routeSegment && routeSegment !== "root") {
    displayName = routeSegment.replace(/-/g, " ");
  }
  const profileImage = useMemo(() => {
    /***if (currentUser) {
      //@ts-ignore
      return currentUser?.profile?.profile_photo_path;
    }
    **/
    return Avater || null;
  }, []);

  // console.log(profileImage);
  return (
    <div className="w-full justify-between flex items-center bg-[#fff] py-6 lg:pr-20  lg:pl-[42px]  lg:px-0 px-[30px]">
      {displayName ? (
        <h2 className="text-secondary-500 font-sora font-bold text-2xl">
          {displayName}
        </h2>
      ) : (
        <div className="">
          <h2 className="text-secondary-500 font-sora font-bold lg:text-2xl text-xl text-nowrap">
            Welcome {name}, 👋🏻
          </h2>

          <span className="text-[#9292A0] font-normal text-xs font-inter ">
            Easily send, receive, and manage funds across multiple currencies.
          </span>
        </div>
      )}
      <div className="flex items-center lg:gap-[42px]  gap-4  relative">
        <div className="relative text-[#525071]">
          <Bell fill="true" size={28} />
          <span className="h-3 w-3 absolute -top-1.5 -right-1.5 text-white bg-primary-100 rounded-full flex justify-center items-center font-inter text-[6px]">
            {" "}
            2
          </span>
        </div>
        <div
          className="text-black  lg:hidden block"
          onClick={() => setIsOpen(true)}
        >
          <Menu size={24} />
        </div>
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger className="transit shadow-1 cursor-pointer items-center justify-center gap-3 rounded-full hover:bg-gray-100 lg:flex lg:bg-[#F7F7F8] lg:px-5 lg:py-1.5 hidden">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold text-white`}
              // style={{ backgroundColor }}
            >
              {profileImage && (
                <Image
                  //@ts-ignore
                  src={profileImage}
                  alt="Profile"
                  className="h-full w-full rounded-full object-center"
                />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="bg-white border-0 shadow-2xl mt-5">
            <Separator className="my-4" />

            {/* links */}
            <div className=" flex flex-col gap-5 px-2 font-semibold bg-white">
              {UserBubbleLinks.map((bubbleData) => (
                <Link
                  onClick={() => setIsPopoverOpen(false)}
                  key={bubbleData.title}
                  href={bubbleData.href}
                  className="transit flex items-center gap-3 text-gray-500 hover:text-gray-800"
                >
                  <bubbleData.icon size={20} strokeWidth={1.5} />
                  <p>{bubbleData.title}</p>
                </Link>
              ))}
              <Dialog>
                <DialogTrigger className="transit flex items-center gap-3 text-rose-400 hover:text-rose-500">
                  <LogOut size={20} strokeWidth={1.5} />
                  <p className="text-[#D92D20]">Logout</p>
                </DialogTrigger>
                <DialogContent className="flex flex-col items-center gap-10 py-8 text-center">
                  <div className="rounded-full bg-rose-50 p-2 text-rose-600">
                    <OctagonAlert />
                  </div>
                  <DialogTitle className="-mt-8 text-xl font-bold">
                    Proceed to logout?
                  </DialogTitle>
                  <p>
                    By clicking on <b>continue</b>, you will be logged out of
                    your dashboard. Do you want to proceed?
                  </p>
                  <div className="flex w-full items-center justify-between gap-6">
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                    <Button
                      className="w-full bg-rose-500 hover:bg-rose-400"
                      // onClick={initiateLogout}
                    >
                      Continue
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default DashTopNav;

const UserBubbleLinks: { icon: LucideIcon; title: string; href: string }[] = [
  {
    icon: UserRound,
    title: "View Profile",
    href: "",
  },
  {
    icon: Settings,
    title: "Settings",
    href: "",
  },
];
