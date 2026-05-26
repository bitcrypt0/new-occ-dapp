import { permanentRedirect } from "next/navigation";

/**
 * /how-it-works was the original docs page. It is now consolidated into the
 * comprehensive /docs page, so this route returns a permanent (308) redirect
 * so old external links keep working.
 */
export default function HowItWorksRedirect(): never {
  permanentRedirect("/docs");
}
