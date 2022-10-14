export type Card = {
  number: string;
  holderName: string;
  expiryMonth: number;
  expiryYear: number;
  CVV: string;
};

export type Payer = {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  birthDate: string;
  phoneNumber: string;
  phoneCode: string;
};

export type BillingAddress = {
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
};

export type SubmitData = {
  type: string;
  card: Card;
  billingAddress: BillingAddress;
  payer: Payer;
};

export type ProcessOperationRedirectResponse = {
  type: "redirect";
  redirectUrl: string;
  metadata: unknown;
};

export type ProcessOperationResponse =
  | {
      type: "submitForm";
      formUrl: string;
      metadata: unknown;
    }
  | ProcessOperationRedirectResponse;
