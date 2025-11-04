import { Bell } from "lucide-react";
import Image from "next/image";
import { useUserStore } from "@/stores/currentUserStore";
import { usePathname } from "next/navigation";

import Logo from "@/public/assets/CardriSvg.svg";
const DashTopNav2 = () => {
  const currentUser = useUserStore((state) => state.user);
  //console.log("currentUser", currentUser);
  //@ts-ignore
  const name = currentUser?.firstName;

  const pathname = usePathname();

  const routeSegment = pathname?.split("/dashboard/")[1];
  let displayName = "";

  if (routeSegment && routeSegment !== "root") {
    displayName = routeSegment.replace(/-/g, " ");
  }

  return (
    <div className="w-full justify-between flex items-center bg-[#fff] py-3 lg:pr-20  lg:pl-[60px] p-4">
      <Image
        src={Logo}
        alt="Cardri logo "
        className="h-10.5 object-center w-[113px]"
      />
    </div>
  );
};

export default DashTopNav2;
