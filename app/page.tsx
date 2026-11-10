import { redirect } from "next/navigation";

/*
 * A home é o arquivo estático public/index.html, servido em "/" pela regra de
 * rewrite do next.config.ts. Esta página só existe como reserva: se a regra
 * não for aplicada, a pessoa é levada ao mesmo arquivo.
 */
export default function Home() {
  redirect("/index.html");
}
