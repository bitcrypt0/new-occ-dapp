"use client";

import { BG_HEX } from "@/lib/constants";
import type { Citizen } from "@/lib/types";

export type ImageFormat = "png" | "jpeg";

/**
 * Rasterize a Citizen's on-chain SVG and trigger a download.
 *
 * Both PNG and JPEG are produced from the same canvas. The Citizen's
 * background color is painted first so the saved file matches what's on
 * screen — and so JPEG (which doesn't support transparency) doesn't fall
 * back to black.
 *
 * JPEG is rendered at quality 0.95. Twitter, Farcaster, and most other
 * social platforms re-encode uploaded images as JPEG; supplying a JPEG that
 * already targets their encoder typically preserves more detail than
 * uploading a PNG and letting them re-compress it.
 */
export async function downloadCitizenImage(
  citizen: Citizen,
  format: ImageFormat = "png",
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

  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
  const extension = format === "jpeg" ? "jpg" : "png";
  const quality = format === "jpeg" ? 0.95 : undefined;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, mimeType, quality);
  });
  if (!blob) throw new Error("Couldn't generate the image.");

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `OnChainCitizen-${citizen.id}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** Legacy alias — kept so existing callers needn't change all at once. */
export const downloadCitizenPng = (citizen: Citizen, size = 1024) =>
  downloadCitizenImage(citizen, "png", size);
