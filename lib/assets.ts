import Ngn from "@/public/assets/flag/NG.png";
import SL from "@/public/assets/flag/SL.png";
import GM from "@/public/assets/flag/GM.png";
import GH from "@/public/assets/flag/GH.png";
import NIN from "@/public/assets/oboarding/nin.png";
import BVN from "@/public/assets/oboarding/bvn.png";
import avater1 from "@/public/assets/avater/avatar1.png";
import avater2 from "@/public/assets/avater/avatar2.png";
import avater3 from "@/public/assets/avater/avater3.png";
import avater4 from "@/public/assets/avater/avater4.png";
import image1 from "@/public/assets/dashboard/frame1.png";
import image2 from "@/public/assets/dashboard/frame2.png";
import image3 from "@/public/assets/dashboard/frame3.png";
import image4 from "@/public/assets/dashboard/frame4.png";

import banks from "@/public/assets/cardripay/sendmoney/banks.png";
import china from "@/public/assets/cardripay/sendmoney/chinapay.png";
import dom from "@/public/assets/cardripay/sendmoney/dom.png";
import otc from "@/public/assets/cardripay/sendmoney/otc.png";
import wire from "@/public/assets/cardripay/sendmoney/wire.png";

import airtime from "@/public/assets/bill/solar_iphone-bold.png";
import data from "@/public/assets/bill/data.png";
import cable from "@/public/assets/bill/cable.png";
import tv from "@/public/assets/bill/tv.png";

export const CountryLisT = [
  {
    label: "Nigeria",
    value: "Nigeria",
    image: Ngn,
    code: "234",
    isAvailable: true,
  },
  {
    label: "Ghana",
    value: "Ghana",
    image: GH,
    code: "233",
    isAvailable: false,
  },
  {
    label: "Sierra Leone",
    value: "Sierra Leone",
    image: SL,
    code: "232",
    isAvailable: false,
  },
  {
    label: "Gambia",
    value: "Gambia",
    image: GM,
    code: "220",
    isAvailable: false,
  },
];

export const OnboardingList = [
  {
    label: "Bank Verification Number (BVN)",
    image: BVN,
    value: "bvn",
  },
];

export const BeneficiaryList = [
  {
    name: "Festus Ade",
    image: avater1,
    id: 1,
  },
  {
    name: "Festus Ade",
    image: avater2,
    id: 2,
  },
  {
    name: "Festus Ade",
    image: avater3,
    id: 3,
  },
  {
    name: "Festus Ade",
    image: avater4,
    id: 4,
  },
  {
    name: "Festus Ade",
    image: avater2,
    id: 15,
  },
  {
    name: "Festus Ade",
    image: avater1,
    id: 6,
  },
];

export const SideBarMenuList = [
  {
    label: "Global payout",
    image: image1,
  },
  {
    label: "Global payout",
    image: image2,
  },
  ,
  {
    label: "Global payout",
    image: image3,
  },
  ,
  {
    label: "Global payout",
    image: image4,
  },
  {
    label: "Global payout",
    image: image4,
  },
];

export const sendMoneyList = [
  {
    label: "Local Banks",
    description: "Withdraw commission to other banks using the bank details.",
    image: banks,
    link: "../cardri-pay/transfer?step=1&type=local",
  },
  {
    label: "Wire Transfer",
    description:
      "Send money to friends, family or business using their foreign bank details.",
    image: wire,
    link: "../cardri-pay/transfer?step=1&type=wire",
  },

  {
    label: "Dom Accounts",
    description: "Send money to domiciliary account using the bank details.",
    image: dom,
    link: "../cardri-pay/transfer?step=1&type=dom",
  },
  {
    label: "China Pay",
    description:
      "Send money to china beneficiaries Alipay, Wechat pay and more.",
    image: china,
    link: "../cardri-pay/transfer?step=1&type=china-pay",
  },
  {
    label: "OTC",
    description: "Send money manually to bank account using the bank details.",
    image: otc,
    link: "",
  },
  {
    label: "Intra Africa Tranfer",
    description: "Send money manually to bank account using the bank details.",
    image: otc,
    link: "../cardri-pay/transfer?step=1&type=intra-africa",
  },
];

export const billPaymentList = [
  {
    label: "Airtime",
    description: "Top up airtime on your most preferred network.",
    image: airtime,
    link: "../cardri-pay/bill?step=1&type=airtime",
  },
  {
    label: "Mobile Data",
    description: "Buy data plans seamlessly across all networks.",
    image: data,
    link: "../cardri-pay/bill?step=1&type=data",
  },

  {
    label: "Cable Tv",
    description: "Subscribe or Renew your most preferred viewing platform. ",
    image: tv,
    link: "../cardri-pay/bill?step=1&type=cable",
  },
  {
    label: "Electricity",
    description: "Purchase electricity tokens seamlessly.",
    image: cable,
    link: "../cardri-pay/bill?step=1&type=electricity",
  },
];
