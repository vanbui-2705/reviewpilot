import type { Metadata } from "next";

export function pageMetadata(
  title: string,
  description: string,
  path: string
): Metadata {
  const url = `https://reviewpilot.vn${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "ReviewPilot",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
