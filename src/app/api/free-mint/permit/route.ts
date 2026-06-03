import { NextResponse } from "next/server";
import {
  createPublicClient,
  http,
  isAddress,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet } from "viem/chains";
import { ADDRESSES } from "@/lib/constants";

/**
 * Production EIP-712 signer for the OCCV2PublicFreeMint permit.
 *
 * Runs server-side inside the Next.js / Vercel function. There is no external
 * backend — the configured private key IS the contract's `trustedSigner`, and
 * the contract enforces every meaningful guard (per-wallet cap, holder check,
 * total cap, `recipient == msg.sender`).
 *
 * Required env (server-only — set as ENCRYPTED variables on Vercel; never
 * prefix with `NEXT_PUBLIC_`):
 *
 *   OCCV2_PERMIT_SIGNER_PRIVATE_KEY = 0x...   (the trustedSigner key)
 *
 * Optional env:
 *
 *   OCCV2_PERMIT_DEADLINE_SECONDS = 1800      (defaults to 30 min)
 *   OCCV2_PERMIT_ALLOW_WALLET = 0x...         (lock to one wallet — staging only)
 *
 * Diagnostics:
 *   - `GET /api/free-mint/permit` → returns the address the configured key
 *     derives. Compare with `publicFreeMint.trustedSigner()` on Etherscan to
 *     confirm the key on file matches the contract.
 *   - `POST` — if the configured signer's address doesn't match the contract's
 *     on-chain `trustedSigner`, the route returns a clear 500 explaining
 *     exactly which address is configured vs. expected. Cached per warm
 *     function instance so it doesn't add per-request RPC cost.
 */

const DEFAULT_DEADLINE_SECONDS = 30 * 60;
const VERIFY_TTL_MS = 5 * 60 * 1000; // 5 minutes
const PRIVATE_KEY_RX = /^0x[0-9a-fA-F]{64}$/;

const TRUSTED_SIGNER_ABI = [
  {
    inputs: [],
    name: "trustedSigner",
    outputs: [{ type: "address" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

let cachedVerifiedSigner: string | null = null;
let cachedVerifiedAt = 0;

/** Look up the signer key from env, trimmed and validated. */
function loadSignerKey(): { key: Hex } | { error: string; status: number } {
  const raw = process.env.OCCV2_PERMIT_SIGNER_PRIVATE_KEY?.trim();
  if (!raw) {
    return {
      error:
        "Permit signer isn't configured on the server. Set OCCV2_PERMIT_SIGNER_PRIVATE_KEY in .env.local (dev) or Vercel project env (prod), then restart the dev server / redeploy.",
      status: 503,
    };
  }
  const key = raw.startsWith("0x") ? raw : `0x${raw}`;
  if (!PRIVATE_KEY_RX.test(key)) {
    return {
      error:
        "OCCV2_PERMIT_SIGNER_PRIVATE_KEY is malformed. Expected a 32-byte hex value (0x… 64 hex chars). Check for stray quotes or whitespace.",
      status: 500,
    };
  }
  return { key: key as Hex };
}

/**
 * Verify the configured signer's address matches the contract's
 * `trustedSigner()`. Cached per warm function instance for VERIFY_TTL_MS so a
 * happy path costs nothing per request. Returns an error string on mismatch.
 */
async function verifySignerOnChain(signerAddress: string): Promise<string | null> {
  if (
    cachedVerifiedSigner === signerAddress.toLowerCase() &&
    Date.now() - cachedVerifiedAt < VERIFY_TTL_MS
  ) {
    return null;
  }

  try {
    const rpcUrl =
      process.env.NEXT_PUBLIC_RPC_URL ?? "https://ethereum-rpc.publicnode.com";
    const client = createPublicClient({ chain: mainnet, transport: http(rpcUrl) });
    const onChain = (await client.readContract({
      address: ADDRESSES.publicFreeMint as `0x${string}`,
      abi: TRUSTED_SIGNER_ABI,
      functionName: "trustedSigner",
    })) as string;

    if (onChain.toLowerCase() !== signerAddress.toLowerCase()) {
      return [
        "Configured permit signer doesn't match the contract.",
        `Configured: ${signerAddress}`,
        `On-chain trustedSigner: ${onChain}`,
        "Update OCCV2_PERMIT_SIGNER_PRIVATE_KEY to the private key whose address matches the on-chain trustedSigner (or update the contract's trustedSigner if intentional).",
      ].join(" ");
    }

    cachedVerifiedSigner = signerAddress.toLowerCase();
    cachedVerifiedAt = Date.now();
    return null;
  } catch {
    // If the RPC fails we don't block — let the contract revert if there's a
    // real mismatch. (Verification is a developer aid, not a security gate.)
    return null;
  }
}

/* ───────────────────────── GET (diagnostics) ───────────────────────── */

export async function GET() {
  const loaded = loadSignerKey();
  if ("error" in loaded) {
    return NextResponse.json(
      { configured: false, error: loaded.error },
      { status: loaded.status },
    );
  }
  try {
    const account = privateKeyToAccount(loaded.key);
    return NextResponse.json({
      configured: true,
      signer: account.address,
      contract: ADDRESSES.publicFreeMint,
      hint: "Open the contract on Etherscan and call trustedSigner(). The address it returns must match `signer` above. If they differ, the configured key is wrong.",
    });
  } catch {
    return NextResponse.json(
      { configured: false, error: "Failed to derive an address from the configured key." },
      { status: 500 },
    );
  }
}

/* ───────────────────────────── POST (sign) ──────────────────────────── */

export async function POST(req: Request) {
  const loaded = loadSignerKey();
  if ("error" in loaded) {
    return NextResponse.json({ error: loaded.error }, { status: loaded.status });
  }

  const body = (await req.json().catch(() => null)) as
    | { wallet?: string; quantity?: number }
    | null;
  const wallet = (body?.wallet ?? "").toString();
  const quantity = Number(body?.quantity);
  if (!isAddress(wallet) || (quantity !== 1 && quantity !== 2)) {
    return NextResponse.json(
      { error: "Invalid request body — expected { wallet: 0x…, quantity: 1|2 }." },
      { status: 400 },
    );
  }

  const allowed = process.env.OCCV2_PERMIT_ALLOW_WALLET?.toLowerCase();
  if (allowed && allowed !== wallet.toLowerCase()) {
    return NextResponse.json(
      { error: "This wallet isn't allow-listed for permits on this deployment." },
      { status: 403 },
    );
  }

  let account;
  try {
    account = privateKeyToAccount(loaded.key);
  } catch {
    return NextResponse.json(
      { error: "Permit signer key is malformed." },
      { status: 500 },
    );
  }

  // One-time-per-warm-instance verification: catches the most common cause of
  // "tx didn't go through" — env var holds a valid key, but the wrong key.
  const mismatch = await verifySignerOnChain(account.address);
  if (mismatch) {
    return NextResponse.json({ error: mismatch }, { status: 500 });
  }

  const lifetime =
    Number(process.env.OCCV2_PERMIT_DEADLINE_SECONDS) ||
    DEFAULT_DEADLINE_SECONDS;
  const deadline = Math.floor(Date.now() / 1000) + lifetime;

  const signature = await account.signTypedData({
    domain: {
      name: "OCCV2PublicFreeMint",
      version: "1",
      chainId: 1,
      verifyingContract: ADDRESSES.publicFreeMint as `0x${string}`,
    },
    types: {
      MintPermit: [
        { name: "recipient", type: "address" },
        { name: "quantity", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "MintPermit",
    message: {
      recipient: wallet as `0x${string}`,
      quantity: BigInt(quantity),
      deadline: BigInt(deadline),
    },
  });

  return NextResponse.json({
    recipient: wallet,
    quantity,
    deadline,
    signature,
  });
}
