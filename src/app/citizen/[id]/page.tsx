import type { Metadata } from "next";
import { CitizenDetail } from "./CitizenDetail";

export const metadata: Metadata = {
  title: "Citizen",
  description: "The full on-chain story of one OnChain Citizen.",
};

export default async function CitizenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CitizenDetail id={Number(id)} />;
}
