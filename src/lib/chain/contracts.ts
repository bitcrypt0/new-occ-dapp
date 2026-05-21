import { ADDRESSES } from "../constants";
import { occv2Abi } from "../abi/occv2";
import { occv1Abi } from "../abi/occv1";
import { marketAbi } from "../abi/market";
import { citizenStakerAbi } from "../abi/citizenStaker";

/** Reusable {address, abi} bundles for the three live mainnet contracts. */
export const occv2Contract = {
  address: ADDRESSES.occv2 as `0x${string}`,
  abi: occv2Abi,
} as const;

export const occv1Contract = {
  address: ADDRESSES.occv1 as `0x${string}`,
  abi: occv1Abi,
} as const;

export const marketContract = {
  address: ADDRESSES.market as `0x${string}`,
  abi: marketAbi,
} as const;

export const citizenStakerContract = {
  address: ADDRESSES.citizenStaker as `0x${string}`,
  abi: citizenStakerAbi,
} as const;
