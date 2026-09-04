import { createZarinpalProvider } from "./zarinpal";
import type { PaymentProvider } from "./types";

export type { PaymentProvider } from "./types";

export function getPaymentProvider(
  provider: string | undefined,
  merchantId: string,
): PaymentProvider {
  switch (provider) {
    case "zarinpal":
    default:
      return createZarinpalProvider(merchantId);
  }
}
