export interface UserData {
  email?: string;
  phone?: string;
  password?: string;
  firstName?: string;
  phoneNumber?: string;
  lastName?: string;
  bvn?: string;
  nin?: string;
}

export interface BeneficaiaryData {
  email?: string;
  phone?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  bvn?: string;
  nin?: string;
  image?: string;
}

export interface wireBeneficiaryType {
  entity: string;
  companyName: string;
  firstName?: string;
  lastName?: string;
  currency: string;
  accountNumber: string;
  beneficiaryCountryCode: string;
  nationalId: string;
  image: File | null;
}

export interface createWirePaymentType {
  beneficiaryId: string;
  purposeId: string;
  amount: string;
  currencyfrom: "NGN";
  m: "web";
  balanceType: string;
}
