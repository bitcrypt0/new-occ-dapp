#!/usr/bin/env node
/**
 * Trait-preview generator for the /docs atlases.
 *
 * Reads each fragment from `art/megans/traits/<folder>/<variant>.svg`,
 * substitutes the SKIN / HAIR / CLOTH placeholders for neutral preview
 * colors, composites onto a minimal neutral head + body context so the
 * trait reads on its own, wraps in a standalone <svg viewBox="0 0 400 400">,
 * and writes to `frontend-occv2/public/docs/trait-previews/<folder>/<slug>.svg`.
 *
 * Also cross-checks every rare entry's weight against the corresponding
 * `*.meta.json` on disk. If a drift is detected the script exits non-zero
 * and the supervisor must be flagged before the docs page is published
 * — per FRONTEND_OCCV2_DOCS_PAGE_TASK.md §9.
 *
 * Source of truth for the rare list: `src/lib/data/traits.ts`. The
 * RARE_WEIGHTS map below mirrors that file; the cross-check guarantees
 * neither has drifted from the per-variant meta JSON files under
 * `art/megans/traits/<folder>/<slug>.meta.json`.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(__dirname, "..");
const REPO_ROOT = path.resolve(FRONTEND_ROOT, "..");
const TRAITS_SRC = path.join(REPO_ROOT, "art", "megans", "traits");
const OUT_ROOT = path.join(FRONTEND_ROOT, "public", "docs", "trait-previews");

/* ---------- neutral preview colors ---------- */
const NEUTRAL_HAIR = "#3A2A1F";
const NEUTRAL_CLOTH = "#A6C0E0";

/**
 * Skin-tone palette — the 7 canonical OCCV2 skin colors from
 * art/megans/palettes/skin-tones.json. Picked deterministically per card so
 * the atlas reads with varied tones instead of one Ivory body for every
 * variant. Applied at the FINAL composition step via substituteSkin()
 * so body, head, ears, and any clothing cut-outs share the same tone on
 * a given card.
 */
const SKIN_TONE_POOL = [
  "#FFE0BD", // Porcelain
  "#FFDBB4", // Ivory
  "#F5D0A9", // Beige
  "#EDB98A", // Sand
  "#D08B5B", // Caramel
  "#AE5D29", // Toffee
  "#694D3A", // Espresso
];

/* ---------- base context layers (same canvas as the trait fragments) ---------- *
 * Body and head come from the canonical fragments under
 * art/megans/traits/bodies/ and art/megans/traits/head-shapes/, picked per
 * variant by gender (see resolveGender). The canonical heads already include
 * a nose so we don't draw a separate nose layer. Eyebrows stay inline as a
 * single neutral mid-roll; the mouth is loaded from a real mouth fragment
 * (mouths/smirk.svg) at startup; base eyes are picked deterministically per
 * card from a pool of common eye variants so the atlas reads with variety.
 */
const FACE = {
  brows:
    `<path d="M147,128 Q170,118 193,128" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>` +
    `<path d="M207,128 Q230,118 253,128" fill="none" stroke="#333" stroke-width="3" stroke-linecap="round"/>`,
};

/**
 * Pools of common, non-rare eye + mouth variants used as the base layers for
 * trait cards outside the Eyes / Mouth folders. Picked deterministically per
 * slug so the atlas reads with variety without distracting from the
 * showcased trait. Filled by loadFaceVariants() at startup.
 */
const BASE_EYE_POOL = [];
const BASE_EYE_SLUGS = [
  "normal",
  "happy",
  "small",
  "sleepy",
  "side-look",
  "squinting",
  "surprised",
  "wide-open",
  "wink",
];

const BASE_MOUTH_POOL = [];
/** Common, unisex mouth variants — rare mouths (cigarette, tongue-out, vape)
 *  are excluded so they only appear on their own atlas card. */
const BASE_MOUTH_SLUGS = [
  "smile",
  "smirk",
  "flat",
  "big-smile",
  "open",
  "frown",
  "surprised-o",
];

/** Filled at startup by loadGenderedBase() from the canonical SVG fragments. */
const GENDERED = { bodyMale: "", bodyFemale: "", headMale: "", headFemale: "" };

/**
 * Per-hair-variant back fragments from `art/megans/traits/hair-back/`. Most
 * variants have no back fill (empty file); the long-hair female variants —
 * Bangs, Long Straight, Long Wavy — carry the drape behind the head that
 * makes the silhouette read right. Composited between body and head in the
 * hair-folder cards (see CONTEXT_BY_FOLDER.hair). Filled by loadHairBacks().
 */
const HAIR_BACKS = {};

/**
 * Subtle inner arm lines drawn over the body fill — match the canonical
 * sleeve-seam lines used by every clothing fragment (e.g. jacket.svg,
 * sweater.svg, hoodie.svg): straight verticals from y=340 to y=398, sitting
 * in the lower half of the body so they don't run into the chest.
 */
const ARMS_MALE =
  `<line x1="110" y1="340" x2="110" y2="398" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>` +
  `<line x1="290" y1="340" x2="290" y2="398" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>`;
const ARMS_FEMALE =
  `<line x1="112" y1="340" x2="112" y2="398" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>` +
  `<line x1="288" y1="340" x2="288" y2="398" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>`;

/**
 * Inlined ear SVG strings — verbatim from art/megans/preview.html. Per the
 * contract handoff §9, ears are NOT stored as separate trait files; they're
 * a renderer-side constant injected between head-shape (layer 3) and eyes
 * (layer 4). They render on every character EXCEPT when the hair fully
 * obscures the ear position — see EARS_BLOCKED_HAIRS below.
 */
const EARS_MALE =
  `<path d="M113,155 Q101,167 113,181 Z" fill="SKIN" stroke="#333" stroke-width="2"/>` +
  `<path d="M111,162 Q109,167 111,173" fill="none" stroke="#333" stroke-width="1.5"/>` +
  `<path d="M287,155 Q299,167 287,181 Z" fill="SKIN" stroke="#333" stroke-width="2"/>` +
  `<path d="M289,162 Q291,167 289,173" fill="none" stroke="#333" stroke-width="1.5"/>`;
const EARS_FEMALE =
  `<path d="M115,153 Q103,166 115,180 Z" fill="SKIN" stroke="#333" stroke-width="2"/>` +
  `<path d="M113,160 Q111,166 113,172" fill="none" stroke="#333" stroke-width="1.5"/>` +
  `<path d="M285,153 Q297,166 285,180 Z" fill="SKIN" stroke="#333" stroke-width="2"/>` +
  `<path d="M287,160 Q289,166 287,172" fill="none" stroke="#333" stroke-width="1.5"/>`;

/** Hair slugs that fully obscure the ear position — ears skipped. Verbatim
 *  from preview.html's EARS_BLOCKED_HAIRS constant (canonical source). */
const EARS_BLOCKED_HAIRS = new Set([
  "female-bangs",
  "female-bob",
  "female-long-straight",
  "female-long-wavy",
]);

/** Which base layers to include behind each category's fragment.
 *  Layer order mirrors MEGANS_CONTRACT_HANDOFF.md §7:
 *    1 hair-back · 2 body · 3 head · 3.5 ears · 4 eyes · 5 eyebrows · …
 *  `body`, `head`, `ears`, `hair-back` are resolved per-variant at
 *  composition time. The body is ALWAYS included — even for clothing —
 *  so short-sleeve fragments (e.g. eth-tshirt) show skin/arms underneath. */
const CONTEXT_BY_FOLDER = {
  eyes: ["body", "head", "ears", "brows", "mouth"],
  eyebrows: ["body", "head", "ears", "eyes", "mouth"],
  mouths: ["body", "head", "ears", "eyes", "brows"],
  // Body included so short-sleeve cut-outs (tshirt, tank-top, eth-tshirt)
  // reveal skin + the arm seam lines underneath.
  clothing: ["body", "head", "ears", "eyes", "brows", "mouth"],
  accessories: ["body", "head", "ears", "eyes", "brows", "mouth"],
  "accessory-ii": ["body", "head", "ears", "eyes", "brows", "mouth"],
  // facial-hair surrounds the mouth — skip base mouth so they don't compete
  "facial-hair": ["body", "head", "ears", "eyes", "brows"],
  // hair-back precedes body so its drape sits behind shoulders & neck;
  // ears are conditional — see EARS_BLOCKED_HAIRS.
  hair: ["hair-back", "body", "head", "ears", "eyes", "brows", "mouth"],
  specials: ["body", "head", "ears", "eyes", "brows", "mouth"],
};

/* ----------------------------------------------------------------------- *
 * Mirrors src/lib/data/traits.ts RARE_TRAITS. Cross-checked against meta.
 * ----------------------------------------------------------------------- */
const RARE_WEIGHTS = {
  // Eyes
  "eyes/animated": 0.5,
  "eyes/cross-eyed": 15,
  "eyes/heart-eyes": 15,
  "eyes/starry": 15,
  // Eyebrows
  "eyebrows/unibrow": 15,
  // Mouth
  "mouths/cigarette": 15,
  "mouths/tongue-out": 15,
  "mouths/vape": 10,
  // Clothing (pairs share weight)
  "clothing/coat": 10,
  "clothing/coat-f": 10,
  "clothing/eth-tshirt": 1,
  "clothing/eth-tshirt-f": 1,
  "clothing/suit": 15,
  "clothing/suit-f": 15,
  // Accessory II
  "accessory-ii/bitcoin-maxi-cap": 2,
  "accessory-ii/bitcoin-maxi-cap-f": 2,
  "accessory-ii/crown": 3,
  "accessory-ii/crown-f": 3,
  "accessory-ii/eth-maxi-cap": 5,
  "accessory-ii/eth-maxi-cap-f": 5,
  "accessory-ii/eth-maxi-cap-ii": 4,
  "accessory-ii/eth-maxi-cap-ii-f": 4,
  "accessory-ii/eth-maxi-cap-iii": 3,
  "accessory-ii/eth-maxi-cap-iii-f": 3,
  "accessory-ii/halo": 5,
  "accessory-ii/halo-f": 5,
  "accessory-ii/jazzman-hat": 5,
  "accessory-ii/jazzman-hat-f": 5,
  "accessory-ii/leather-hat": 3,
  "accessory-ii/leather-hat-f": 3,
  "accessory-ii/top-hat": 3,
  "accessory-ii/top-hat-f": 3,
  // Accessory I
  "accessories/3d-glasses": 15,
  "accessories/3d-glasses-f": 15,
  "accessories/ar-goggles": 1,
  "accessories/ar-goggles-f": 1,
  "accessories/band-aid": 15,
  "accessories/clear-goggles": 1,
  "accessories/clear-goggles-f": 1,
  "accessories/dark-goggles": 1,
  "accessories/dark-goggles-f": 1,
  "accessories/eye-patch": 15,
  "accessories/laser": 5,
  "accessories/monocle": 15,
  "accessories/sunglasses": 15,
  "accessories/sunglasses-f": 15,
  // Facial Hair
  "facial-hair/mutton-chops": 15,
  "facial-hair/soul-patch": 15,
  // Hair
  "hair/female-pigtails": 15,
  "hair/male-mohawk": 15,
  // Special
  "specials/chart-down": 0.5,
  "specials/chart-up": 0.5,
  "specials/glitch": 0.5,
};

/* ----------------------- helpers ----------------------- */

/** Read the four canonical gendered base fragments once at startup.
 *  Each body is augmented with two inner arm lines for visual appeal. */
async function loadGenderedBase() {
  const read = async (rel) => {
    const raw = await fs.readFile(path.join(TRAITS_SRC, rel), "utf8");
    return substitute(extractInner(raw.trim()));
  };
  GENDERED.bodyMale = (await read("bodies/male-wide.svg")) + "\n  " + ARMS_MALE;
  GENDERED.bodyFemale =
    (await read("bodies/female-wide.svg")) + "\n  " + ARMS_FEMALE;
  GENDERED.headMale = await read("head-shapes/round.svg");
  GENDERED.headFemale = await read("head-shapes/round-female.svg");
}

/** Read every `hair-back/<slug>.svg` once so we can composite it behind
 *  the head on Hair-atlas cards. Empty back files contribute nothing. */
async function loadHairBacks() {
  const dir = path.join(TRAITS_SRC, "hair-back");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".svg"));
  for (const file of files) {
    const slug = file.replace(/\.svg$/, "");
    const raw = await fs.readFile(path.join(dir, file), "utf8");
    HAIR_BACKS[slug] = substitute(extractInner(raw.trim()));
  }
}

/** Read the pools of common base-eye and base-mouth fragments. */
async function loadFaceVariants() {
  const read = async (rel) => {
    const raw = await fs.readFile(path.join(TRAITS_SRC, rel), "utf8");
    return substitute(extractInner(raw.trim()));
  };
  for (const slug of BASE_EYE_SLUGS) {
    BASE_EYE_POOL.push({ slug, inner: await read(`eyes/${slug}.svg`) });
  }
  for (const slug of BASE_MOUTH_SLUGS) {
    BASE_MOUTH_POOL.push({ slug, inner: await read(`mouths/${slug}.svg`) });
  }
}

/** djb2-style hash → small non-negative integer. Deterministic per slug. */
function hashSlug(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Pick a base-eye fragment for a card by stable hash of its slug. */
function pickBaseEyes(slug) {
  if (BASE_EYE_POOL.length === 0) return "";
  return BASE_EYE_POOL[hashSlug(slug) % BASE_EYE_POOL.length].inner;
}

/** Pick a base-mouth fragment for a card by stable hash of its slug.
 *  Uses a different hash mix so the same slug doesn't always pair with the
 *  Nth eye and Nth mouth — adds combinatorial variety. */
function pickBaseMouth(slug) {
  if (BASE_MOUTH_POOL.length === 0) return "";
  // Add a salt so eyes and mouths don't co-rotate in lockstep.
  return BASE_MOUTH_POOL[hashSlug(slug + "::m") % BASE_MOUTH_POOL.length].inner;
}

/** Pick male or female body+head per the brief's gender-resolution rules. */
function resolveGender(slug, meta) {
  if (meta && meta.femaleOnly === true) return "female";
  if (slug.endsWith("-f")) return "female";
  if (meta && meta.maleOnly === true) return "male";
  // Hair variants encode gender in the filename prefix.
  if (slug.startsWith("female-")) return "female";
  if (slug.startsWith("male-")) return "male";
  // Unisex default — keep the atlas visually consistent.
  return "male";
}

function buildContext(folder, gender, slug) {
  const keys = CONTEXT_BY_FOLDER[folder] ?? [];
  return keys
    .map((k) => {
      if (k === "body") return gender === "female" ? GENDERED.bodyFemale : GENDERED.bodyMale;
      if (k === "head") return gender === "female" ? GENDERED.headFemale : GENDERED.headMale;
      if (k === "ears") {
        // Skip the ears layer for hair variants whose silhouette fully
        // obscures the ear position (canonical preview.html block list).
        if (folder === "hair" && EARS_BLOCKED_HAIRS.has(slug)) return "";
        return gender === "female" ? EARS_FEMALE : EARS_MALE;
      }
      if (k === "hair-back") return HAIR_BACKS[slug] ?? "";
      if (k === "eyes") return pickBaseEyes(slug);
      if (k === "mouth") return pickBaseMouth(slug);
      return FACE[k];
    })
    .join("\n  ");
}

function extractInner(svgText) {
  // Strip the outer <g …>…</g> wrapper. Assumes the fragment is a single
  // top-level <g> as all OCCV2 trait files are authored.
  const opened = svgText.indexOf(">");
  const closed = svgText.lastIndexOf("</g>");
  if (opened < 0 || closed < 0 || closed < opened) {
    throw new Error("Unrecognised SVG fragment shape");
  }
  return svgText.slice(opened + 1, closed).trim();
}

/** Substitute HAIR / CLOTH at load time. SKIN is intentionally LEFT IN PLACE
 *  so the per-card skin tone can be applied at the final composition step
 *  (see substituteSkin + buildSvg). */
function substitute(text) {
  return text
    .replace(/\bHAIR\b/g, NEUTRAL_HAIR)
    .replace(/\bCLOTH\b/g, NEUTRAL_CLOTH);
}

/** Final per-card SKIN substitution. Replaces every `SKIN` token in the
 *  composed inner SVG with the chosen tone — so body, head, ears, and any
 *  clothing cut-outs all share the same skin color on a given card. */
function substituteSkin(text, tone) {
  return text.replace(/\bSKIN\b/g, tone);
}

/** Pick a skin tone for a card by stable hash of (folder + slug + salt). */
function pickSkinTone(folder, slug) {
  return SKIN_TONE_POOL[hashSlug(`${folder}/${slug}::skin`) % SKIN_TONE_POOL.length];
}

function buildSvg(folder, gender, slug, inner) {
  const tone = pickSkinTone(folder, slug);
  const composed = `${buildContext(folder, gender, slug)}\n  ${inner}`;
  // Final SKIN substitution — applies to body, head, ears, and any clothing
  // cut-outs (coat, polo) that reveal skin, so they all share one tone.
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
  ${substituteSkin(composed, tone)}
</svg>
`;
}

/* ----------------------- main ----------------------- */
let warnings = 0;
async function processFile(folder, file) {
  const slug = file.replace(/\.svg$/, "");
  const srcPath = path.join(TRAITS_SRC, folder, file);
  const metaPath = path.join(TRAITS_SRC, folder, slug + ".meta.json");

  let meta = null;
  try {
    meta = JSON.parse(await fs.readFile(metaPath, "utf8"));
  } catch {
    // not every variant ships a meta — that's fine
  }
  const gender = resolveGender(slug, meta);

  const raw = await fs.readFile(srcPath, "utf8");
  const inner = substitute(extractInner(raw.trim()));
  const outDir = path.join(OUT_ROOT, folder);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(
    path.join(outDir, slug + ".svg"),
    buildSvg(folder, gender, slug, inner),
  );

  const key = `${folder}/${slug}`;
  if (key in RARE_WEIGHTS && meta && typeof meta.weight === "number") {
    if (meta.weight !== RARE_WEIGHTS[key]) {
      console.warn(
        `[drift] ${key}: meta weight=${meta.weight} but the curated rare list expects ${RARE_WEIGHTS[key]}. ` +
          `Stop and flag the supervisor before publishing.`,
      );
      warnings++;
    }
  }
}

/** Copy developer preview sheets (already valid standalone SVGs) for use as
 *  chapter-opening illustrations on /docs. */
const SHEETS_OUT = path.join(FRONTEND_ROOT, "public", "docs", "category-sheets");
const SHEET_FILES = [
  "preview-eyes.svg",
  "preview-eyebrows.svg",
  "preview-mouths.svg",
  "preview-hair-male.svg",
  "preview-hair-female.svg",
  "preview-facial-hair.svg",
  "preview-accessories.svg",
  "preview-clothing-1-casual.svg",
  "preview-clothing-2-formal.svg",
  "preview-clothing-3-specialty.svg",
  "preview-specials.svg",
];

/**
 * Build a "no-heads" eyes overview sheet for the Docs §3 chapter opener.
 * Shows every eye variant on its own, without the head silhouette
 * (re-cropping each fragment's native viewBox to just the eye region).
 */
async function generateEyesOverview() {
  const eyesDir = path.join(TRAITS_SRC, "eyes");
  const files = (await fs.readdir(eyesDir))
    .filter((f) => f.endsWith(".svg"))
    .sort();

  const COLS = 5;
  const CELL_W = 240;
  const CELL_H = 230;
  const rows = Math.ceil(files.length / COLS);
  const canvasW = COLS * CELL_W;
  const canvasH = rows * CELL_H;

  const display = (slug) =>
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const cells = [];
  for (let i = 0; i < files.length; i++) {
    const slug = files[i].replace(/\.svg$/, "");
    const raw = await fs.readFile(path.join(eyesDir, files[i]), "utf8");
    const inner = substitute(extractInner(raw.trim()));
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CELL_W;
    const y = row * CELL_H;
    cells.push(
      `<g transform="translate(${x},${y})">
    <rect x="6" y="6" width="${CELL_W - 12}" height="${CELL_H - 12}" rx="14" fill="#FFF2CC" stroke="#1A1A1A" stroke-width="3"/>
    <svg x="20" y="20" width="${CELL_W - 40}" height="${CELL_H - 80}" viewBox="120 100 160 100" preserveAspectRatio="xMidYMid meet">
      ${inner}
    </svg>
    <text x="${CELL_W / 2}" y="${CELL_H - 22}" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" font-weight="700" fill="#1A1A1A">${display(slug)}</text>
  </g>`,
    );
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvasW} ${canvasH}" preserveAspectRatio="xMidYMid meet">
  <rect width="${canvasW}" height="${canvasH}" fill="#F7F1E1"/>
  ${cells.join("\n  ")}
</svg>
`;

  const outPath = path.join(SHEETS_OUT, "preview-eyes-no-heads.svg");
  await fs.mkdir(SHEETS_OUT, { recursive: true });
  await fs.writeFile(outPath, svg);
  console.log(
    `[trait-previews] wrote eyes-only overview → ${path.relative(FRONTEND_ROOT, outPath)}`,
  );
}

async function copySheets() {
  await fs.mkdir(SHEETS_OUT, { recursive: true });
  let copied = 0;
  for (const f of SHEET_FILES) {
    const src = path.join(REPO_ROOT, "art", "megans", f);
    try {
      const buf = await fs.readFile(src);
      await fs.writeFile(path.join(SHEETS_OUT, f), buf);
      copied++;
    } catch {
      console.warn(`[trait-previews] missing sheet: ${f} (skipping)`);
    }
  }
  console.log(
    `[trait-previews] copied ${copied} chapter sheets → ${path.relative(FRONTEND_ROOT, SHEETS_OUT)}`,
  );
}

async function main() {
  console.log("[trait-previews] generating from", path.relative(REPO_ROOT, TRAITS_SRC));
  await loadGenderedBase();
  await loadHairBacks();
  await loadFaceVariants();
  await fs.rm(OUT_ROOT, { recursive: true, force: true });
  let total = 0;
  for (const folder of Object.keys(CONTEXT_BY_FOLDER)) {
    const dir = path.join(TRAITS_SRC, folder);
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".svg"));
    for (const f of files) {
      await processFile(folder, f);
      total++;
    }
  }
  console.log(
    `[trait-previews] wrote ${total} preview SVGs → ${path.relative(FRONTEND_ROOT, OUT_ROOT)}`,
  );
  await copySheets();
  await generateEyesOverview();
  if (warnings > 0) {
    console.error(
      `[trait-previews] ⚠ ${warnings} drift warning(s). DO NOT publish — investigate first.`,
    );
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
