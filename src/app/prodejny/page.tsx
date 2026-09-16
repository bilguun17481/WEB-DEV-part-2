import type { Metadata } from "next";
import { StoresView } from "@/components/views/InfoViews";

export const metadata: Metadata = {
  title: "Prodejny · Elektro Dvořák",
  description: "Šest prodejen Elektro Dvořák: Golčův Jeníkov, Čáslav, Chotěboř, Světlá nad Sázavou, Třemošnice a Heřmanův Městec. Otevírací doby, telefony a výdej objednávek zdarma.",
};

export default function Page() { return <StoresView />; }
