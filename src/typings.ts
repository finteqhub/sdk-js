export type Card = {
  number: string;
  holder: string;
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

export type Address = {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
};

export type SessionResponse = {
  customer?: Customer;
  initCredentials: {
    billingAddress?: Address;
    card?: Card;
    payer?: Payer;
    shippingAddress: Address;
  };
  operation: OperationSession;
  paymentMethods: PaymentMethods;
  session: Session;
};

export interface Customer {
  accounts?: CustomerAccount[];
  country?: string;
  id: string;
  merchantCustomerId: string;
  name?: string;
  projectId: string;
}

export type CustomerAccount = {
  id?: string;
  integrationAccountId?: string;
  paymentMethod?: string;
  status?: string;
  metadata?: any;
};

export type OperationSession = {
  amount: string;
  currencyCode: string;
  failUrl: string;
  operationId: string;
  projectId: string;
  successUrl: string;
  transactionId: string;
  transactionType: string;
};

export type PaymentMethods = {
  credentials: {
    [key: string]: {
      fields?: { [key: string]: FieldDetails };
      required?: Array<string>;
    };
  };
  paymentMethods: {
    [key: string]: {
      friendlyName?: string;
      logo?: string;
      credentials?: string;
    };
  };
};

export type Session = {
  ttl: number;
  createdAt: string;
};

export type FieldDetails = {
  type?: string;
  friendlyName?: string;
  description?: string;
  format?: string;
  example?: string;
};

export type SubmitData = {
  type: string;
  card: Card;
  billingAddress: Address;
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
