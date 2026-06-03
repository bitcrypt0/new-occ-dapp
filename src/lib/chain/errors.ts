import { BaseError, ContractFunctionRevertedError, UserRejectedRequestError } from "viem";

/**
 * Human-readable copy for every revert the dapp can surface. Keyed by the
 * contract's custom-error name (OCCV2_* / Market_* / ERC721*).
 */
const ERROR_MESSAGES: Record<string, string> = {
  // ── Owner actions ──
  OCCV2_NotTokenOwner: "Only the current owner of this Citizen can do that.",
  OCCV2_IncorrectFee: "The fee sent didn't match the contract's trait-lock fee.",
  OCCV2_AlreadyFrozen: "This Citizen's traits are already locked.",
  OCCV2_NotFrozen: "This Citizen's traits aren't locked.",
  OCCV2_ReshufflesAlreadyActive: "Reshuffles are already active.",
  // ── Wardrobe rerolls ──
  WardrobeManager_NotTokenOwner: "Only the current owner can reroll.",
  WardrobeManager_TokenLocked:
    "This Citizen's traits are locked. Unlock to reroll.",
  WardrobeManager_ClothingIsRareFrozen:
    "This Citizen has a rare clothing piece. You can still reroll its color with the Color button.",
  // ── Market ──
  Market_ListingNotActive: "This listing is no longer available.",
  Market_ListingExpired: "This listing has expired.",
  Market_NotSeller: "Only the seller can cancel this listing.",
  Market_NotTokenOwner: "You don't own the Citizen for this action.",
  Market_TokenOwnerLocked: "A Citizen involved in this trade has locked traits — unlock first.",
  Market_DestinationSlotOccupied:
    "The receiving Citizen already has a trait in that slot. Trades need an empty matching slot.",
  Market_SourceSlotEmpty: "The selling Citizen has no trait in that slot.",
  Market_IncorrectPayment: "The ETH sent didn't match the listing price.",
  Market_NotReshufflableCategory:
    "Only Eyes, Eyebrows, Mouth, Clothing and Accessory II can be traded.",
  // ── ERC-721 ──
  ERC721InsufficientApproval: "The V2 contract isn't approved to move that token yet.",
  ERC721NonexistentToken: "That token doesn't exist.",
  ERC721IncorrectOwner: "That token isn't owned by the expected address.",
  EnforcedPause: "The contract is paused right now. Please try again later.",
};

/** A gender-mismatch in a trait trade. */
ERROR_MESSAGES.OCCV2_GenderMismatch =
  "Traits trade only between Citizens of the same gender.";

/**
 * Decode any thrown transaction/read error into a single friendly sentence.
 * Never returns a raw hex string or stack trace.
 */
export function decodeTxError(err: unknown): string {
  if (err == null) return "Something went wrong. Please try again.";

  if (err instanceof BaseError) {
    // User rejected the signature in their wallet.
    const rejected = err.walk((e) => e instanceof UserRejectedRequestError);
    if (rejected) return "You rejected the request in your wallet.";

    // A contract revert with a named custom error.
    const reverted = err.walk((e) => e instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      const name = reverted.data?.errorName ?? reverted.reason ?? "";
      if (name && ERROR_MESSAGES[name]) return ERROR_MESSAGES[name];
      if (reverted.reason) return reverted.reason;
    }

    const msg = err.shortMessage || err.message;
    if (/insufficient funds/i.test(msg))
      return "Not enough ETH to cover gas. Top up your wallet and try again.";
    if (/user rejected|denied/i.test(msg))
      return "You rejected the request in your wallet.";
    if (/chain mismatch|wrong network|does not match/i.test(msg))
      return "Your wallet is on the wrong network. Switch to Ethereum Mainnet.";
  }

  const raw = err instanceof Error ? err.message : String(err);
  // Match a custom-error name if it leaked into a plain message.
  for (const name of Object.keys(ERROR_MESSAGES)) {
    if (raw.includes(name)) return ERROR_MESSAGES[name];
  }
  if (/user rejected|denied/i.test(raw))
    return "You rejected the request in your wallet.";
  if (/insufficient funds/i.test(raw))
    return "Not enough ETH to cover gas. Top up your wallet and try again.";
  return "The transaction didn't go through. Please try again.";
}
