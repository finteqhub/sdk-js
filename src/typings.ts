export type Card = {
  number: string;
  holder: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
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

export type CustomerAccount =
  | {
      id?: string;
      integrationAccountId?: string;
      paymentMethod?: string;
      status?: string;
      metadata?: any;
    }
  | {
      id?: string;
      integrationAccountId?: string;
      paymentMethod?: "card-acquirer";
      status?: string;
      metadata?: {
        iin: string;
        brand: string;
        type: string;
        issuer: string;
        issuer_country: string;
        expiryMonth: number;
        expiryYear: number;
        maskedPAN: string;
        tokenized?: boolean;
      };
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

export type PaymentMethod = {
  friendlyName?: string;
  logo?: string;
  $credentials?: string;
};

export type PaymentMethodCredentials = {
  [key: string]: {
    fields?:
      | {
          [key: string]: FieldDetails;
        }
      | undefined;
    required?: string[] | undefined;
  };
};

export type PaymentMethods = {
  credentials: PaymentMethodCredentials;
  paymentMethods: {
    [key: string]: PaymentMethod;
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

export type SubmitData =
  | {
      customerAccountId: string;
      credentials: {
        billingAddress: Address;
        card: {
          cvv: string;
        };
        payer: Payer;
      };
      paymentMethodType: string;
    }
  | {
      credentials: {
        billingAddress: Address;
        card: Card;
        payer: Payer;
      };
      paymentMethodType: string;
    }
  | {
      credentials: Record<string, string>;
      paymentMethodType: string;
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
  | {
      type: "wait";
      waitInterval: number;
    }
  | ProcessOperationRedirectResponse;
