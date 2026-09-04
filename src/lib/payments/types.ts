export type PaymentRequestInput = {
  amount: number;
  description: string;
  callbackUrl: string;
  metadata?: Record<string, string>;
};

export type PaymentRequestResult = {
  authority: string;
  paymentUrl: string;
};

export type PaymentVerifyInput = {
  amount: number;
  authority: string;
};

export type PaymentVerifyResult = {
  ok: boolean;
  refId?: string;
  message?: string;
};

export interface PaymentProvider {
  request(input: PaymentRequestInput): Promise<PaymentRequestResult>;
  verify(input: PaymentVerifyInput): Promise<PaymentVerifyResult>;
}
