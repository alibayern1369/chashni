import type {
  PaymentProvider,
  PaymentRequestInput,
  PaymentRequestResult,
  PaymentVerifyInput,
  PaymentVerifyResult,
} from "./types";

const ZARINPAL_REQUEST =
  process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
    : "https://api.zarinpal.com/pg/v4/payment/request.json";

const ZARINPAL_VERIFY =
  process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
    : "https://api.zarinpal.com/pg/v4/payment/verify.json";

const ZARINPAL_START =
  process.env.ZARINPAL_SANDBOX === "true"
    ? "https://sandbox.zarinpal.com/pg/StartPay/"
    : "https://www.zarinpal.com/pg/StartPay/";

/**
 * Zarinpal payment adapter (IRR tomans → Rials * 10 for gateway).
 * Amount is stored in Toman in CHASHNI; Zarinpal expects Rials.
 */
export function createZarinpalProvider(merchantId: string): PaymentProvider {
  return {
    async request(input: PaymentRequestInput): Promise<PaymentRequestResult> {
      const amountRial = Math.max(1000, input.amount * 10);
      const res = await fetch(ZARINPAL_REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: amountRial,
          callback_url: input.callbackUrl,
          description: input.description,
          metadata: input.metadata,
        }),
      });

      const data = await res.json();
      const authority = data?.data?.authority;
      if (!authority) {
        throw new Error(
          data?.errors?.message || data?.errors?.[0]?.message || "Zarinpal request failed",
        );
      }

      return {
        authority,
        paymentUrl: `${ZARINPAL_START}${authority}`,
      };
    },

    async verify(input: PaymentVerifyInput): Promise<PaymentVerifyResult> {
      const amountRial = Math.max(1000, input.amount * 10);
      const res = await fetch(ZARINPAL_VERIFY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          amount: amountRial,
          authority: input.authority,
        }),
      });

      const data = await res.json();
      const code = data?.data?.code;
      if (code === 100 || code === 101) {
        return {
          ok: true,
          refId: String(data.data.ref_id ?? ""),
          message: data.data.message,
        };
      }

      return {
        ok: false,
        message: data?.errors?.message || data?.data?.message || "Verification failed",
      };
    },
  };
}
