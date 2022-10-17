export type Card = {
  number: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  CVV: string;
  tokenize: boolean;
};

export type Payer = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  birthDate: string;
  phoneNumber: string;
  phoneCountryCode: string;
};

export type BillingAddress = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type SubmitData = {
  type: string;
  card: Card;
  billingAddress: BillingAddress;
  payer: Payer;
};
