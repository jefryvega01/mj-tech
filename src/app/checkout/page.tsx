import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";
import { isMpConfigured } from "@/lib/mercadopago";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutForm mpConfigured={isMpConfigured()} />
    </Suspense>
  );
}
