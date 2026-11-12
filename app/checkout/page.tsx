import { redirect } from "next/navigation";

/* Reserva do rewrite de /checkout (ver next.config.ts). */
export default function Checkout() {
  redirect("/checkout/index.html");
}
