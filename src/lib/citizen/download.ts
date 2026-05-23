"use client";

import { BG_HEX } from "@/lib/constants";
import type { Citizen } from "@/lib/types";

/**
 * Rasterize a Citizen's on-chain SVG to PNG and trigger a download.
 *
 * The contract serves art as a `data:image/svg+xml;base64,…` URI which the
 * browser can load directly into an Image element. Drawing that onto a canvas
 * lets us export a PNG without any server round-trip. The Citizen's background
 * color is painted first so the saved file looks identical to what's on screen
 * (the SVG's outer canvas is transparent).
 */
export async function downloadCitizenPng(
  citizen: Citizen,
  size = 1024,
): Promise<void> {
  if (typeof window === "undefined") return;
  if (!citizen.imageUri) {
    throw new Error("No on-chain art available for this Citizen.");
  }

  // Load the SVG into an Image element.
  const img = new Image();
  img.crossOrigin = "anonymous";
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Couldn't load the Citizen art."));
    img.src = citizen.imageUri as string;
  });

  // Paint background + art onto a square canvas.
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");
  ctx.fillStyle = BG_HEX[citizen.background];
  ctx.fillRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  // Export to PNG and trigger the download.
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  if (!blob) throw new Error("Couldn't generate the PNG.");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OnChainCitizen-${citizen.id}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Release the blob URL after the click handler has had a chance to fire.
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}
