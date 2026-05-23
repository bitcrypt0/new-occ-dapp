/**
 * Live Feed domain types — the five activities the OCCV2 contract emits
 * alongside ERC-4906 `MetadataUpdate`, mapped to UI categories.
 */
export type FeedEventType =
  | "reshuffled"
  | "background"
  | "locked"
  | "unlocked"
  | "traded";

export const ALL_FEED_TYPES: FeedEventType[] = [
  "background",
  "locked",
  "unlocked",
  "traded",
  "reshuffled",
];

/** Visual styling and copy for each feed type — used by the badge + chip. */
export const EVENT_META: Record<
  FeedEventType,
  { label: string; badge: string; glyph: string; hint: string }
> = {
  reshuffled: {
    label: "Reshuffled",
    badge: "bg-rose text-ink",
    glyph: "⟳",
    hint: "Traits re-rolled on transfer.",
  },
  background: {
    label: "Background re-rolled",
    badge: "bg-sky text-ink",
    glyph: "◑",
    hint: "Owner rolled a new background.",
  },
  locked: {
    label: "Traits locked",
    badge: "bg-red text-paper",
    glyph: "▣",
    hint: "This look is now frozen.",
  },
  unlocked: {
    label: "Traits unlocked",
    badge: "bg-sage text-ink",
    glyph: "▢",
    hint: "Reshuffles allowed again.",
  },
  traded: {
    label: "Rare trait traded",
    badge: "bg-orange text-ink",
    glyph: "⇄",
    hint: "A frozen trait moved between Citizens.",
  },
};

export interface FeedEvent {
  /** Unique key for React lists — `${txHash}-${logIndex}`. */
  id: string;
  type: FeedEventType;
  citizenId: number;
  /** Millisecond timestamp when the dapp received the event. */
  timestamp: number;
  txHash: `0x${string}`;
}

/** "5s ago", "2m ago", "3h ago" — formatted for the timestamp column. */
export function relativeTime(ts: number, now: number): string {
  const diff = Math.max(0, now - ts);
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}
