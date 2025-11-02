import { create } from "zustand";

interface addBVNManualState {
  open: boolean;
  setOpen: (value: boolean) => void;
}
interface sendMoneyModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
}

interface billModalState {
  openBill: boolean;
  setOpenBill: (value: boolean) => void;
}

interface beneficiaryState {
  beneficiaryDetalis: any;
  setBeneficiaryDetails: (value: boolean) => void;
}
interface bankModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
  bankDetails: any;
  setBandDetails: (value: any) => void;
}

interface countryModalState {
  open: boolean;
  setOpen: (value: boolean) => void;
  countryDetails: any;
  setCountryDetails: (value: any) => void;
}

interface paymentState {
  open: boolean;
  setOpen: (value: boolean) => void;
  paymentDetails: any;
  setPaymentDetails: (value: any) => void;
}

interface billPaymetState {
  show: boolean;
  showVariation?: boolean;
  setShowVariatiom?: (value: boolean) => void;
  setShow: (value: boolean) => void;
  paymentDetails: any;
  setPaymentDetails: (value: any) => void;
}

interface paymentMethodState {
  showMethod: boolean;
  setShowMethod: (value: boolean) => void;
  paymentMethodDetails: any;
  setPaymentMethodDetails: (value: any) => void;
}

interface paymentBillState {
  open: boolean;
  setOpen: (value: boolean) => void;
  paymentDetails: any;
  setPaymentDetails: (value: any) => void;
}
interface devicingBindingState {
  open: boolean;
  setOpen: (value: boolean) => void;
  id: string;
  setId: (value: string) => void;
}

interface transactionPinState {
  open: boolean;
  otp: string;
  setOtp: (value: string) => void;
  setOpen: (value: boolean) => void;
}

interface loadingSpinState {
  openLoader: boolean;

  setOpenLoader: (value: boolean) => void;
}

interface sidebarOpenState {
  open: boolean;

  setOpen: (value: boolean) => void;
}
const useBVNmanualOverlay = create<addBVNManualState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
}));

const useSendMoneyModalOverlay = create<sendMoneyModalState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
}));

const useBillModalOverlay = create<billModalState>((set) => ({
  openBill: false,
  setOpenBill: (value) => set({ openBill: value }),
}));
const useWireBeneficiaryDetailsOverlay = create<beneficiaryState>((set) => ({
  beneficiaryDetalis: [],
  setBeneficiaryDetails: (value) => set({ beneficiaryDetalis: value }),
}));
const useBankModal = create<bankModalState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  bankDetails: [],
  setBandDetails: (value) => set({ bankDetails: value }),
}));
const useCountryModal = create<countryModalState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  countryDetails: [],

  setCountryDetails: (value) => set({ countryDetails: value }),
}));

const usePaymentTypeChina = create<paymentState>((set) => ({
  open: false,
  setOpen: (value) => set({ open: value }),
  paymentDetails: [],

  setPaymentDetails: (value) => set({ paymentDetails: value }),
}));

const useBillStoreOverlay = create<billPaymetState>((set) => ({
  showVariation: false,
  setShowVariatiom: (value) => set({ showVariation: value }),

  show: false,
  setShow: (value) => set({ show: value }),
  paymentDetails: [],

  setPaymentDetails: (value) => set({ paymentDetails: value }),
}));

const usePaymentMethodOverlay = create<paymentMethodState>((set) => ({
  showMethod: false,
  setShowMethod: (value) => set({ showMethod: value }),
  paymentMethodDetails: [],

  setPaymentMethodDetails: (value) => set({ paymentMethodDetails: value }),
}));
interface billPaymentState {
  openBill: boolean;
  setOpenBill: (value: boolean) => void;
  paymentDetails: any;
  setPaymentDetails: (value: any) => void;
}

interface networkState {
  openNetwork: boolean;
  setOpenNetwork: (value: boolean) => void;
  networkDetails: any;
  setNetworkDetails: (value: any) => void;
}
const useBillPaymentOverlay = create<billPaymentState>((set) => ({
  openBill: false,
  setOpenBill: (value) => set({ openBill: value }),
  paymentDetails: [],

  setPaymentDetails: (value) => set({ paymentDetails: value }),
}));

const useNetworkOverlay = create<networkState>((set) => ({
  openNetwork: false,
  setOpenNetwork: (value) => set({ openNetwork: value }),
  networkDetails: [],

  setNetworkDetails: (value) => set({ networkDetails: value }),
}));

const useDeviceBindingOverlay = create<devicingBindingState>((set) => ({
  open: false,
  id: "",
  setId: (value) => set({ id: value }),
  setOpen: (value) => set({ open: value }),
}));

const useTransactionPinOverlay = create<transactionPinState>((set) => ({
  open: false,
  otp: "",
  setOtp: (value) => set({ otp: value }),

  setOpen: (value) => set({ open: value }),
}));
const useLoadingSpinOverlay = create<loadingSpinState>((set) => ({
  openLoader: false,

  setOpenLoader: (value) => set({ openLoader: value }),
}));

const useSidebar = create<sidebarOpenState>((set) => ({
  open: false,

  setOpen: (value) => set({ open: value }),
}));
export {
  useBVNmanualOverlay,
  useDeviceBindingOverlay,
  useSendMoneyModalOverlay,
  useBankModal,
  useTransactionPinOverlay,
  useCountryModal,
  useWireBeneficiaryDetailsOverlay,
  useLoadingSpinOverlay,
  usePaymentTypeChina,
  useBillModalOverlay,
  useBillPaymentOverlay,
  useBillStoreOverlay,
  usePaymentMethodOverlay,
  useNetworkOverlay,
  useSidebar,
};
