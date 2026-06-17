import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://reviewpilot.vn";
const siteName = "ReviewPilot";

/** Build base page metadata with OpenGraph + robots defaults */
export function pageMetadata(
  title: string,
  description: string,
  path = "/"
): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale: "vi_VN",
      type: "website",
      images: [
        {
          url: "/og-default.png",
          width: 1200,
          height: 630,
          alt: "ReviewPilot - Công cụ tải video & Quản lý Shop",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-default.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

/** Build metadata for an article / blog post */
export function articleMetadata(params: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
}): Metadata {
  const { title, description, slug, publishedAt, updatedAt, tags } = params;
  const path = `/blog/${slug}`;
  const url = `${siteUrl}${path}`;

  return {
    ...pageMetadata(title, description, path),
    openGraph: {
      ...pageMetadata(title, description, path).openGraph,
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: updatedAt || publishedAt,
      tags,
    },
    alternates: { canonical: path },
  };
}

/** Build metadata for a tool / product page */
export function toolMetadata(params: {
  title: string;
  description: string;
  path: string;
  platform?: "youtube" | "tiktok" | "facebook" | "instagram" | "shopee";
}): Metadata {
  const { title, description, path } = params;

  return {
    ...pageMetadata(title, description, path),
    openGraph: {
      ...pageMetadata(title, description, path).openGraph,
      type: "website",
    },
  };
}

// ── JSON-LD Structured Data ─────────────────────────────────────────

export type JsonLd = Record<string, unknown>;

/** Article JSON-LD (BlogPosting schema) */
export function articleSchema(params: {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  author?: string;
  image?: string;
  tags?: string[];
}): JsonLd {
  const url = `${siteUrl}/blog/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: params.title,
    description: params.description,
    url,
    datePublished: params.publishedAt,
    dateModified: params.updatedAt || params.publishedAt,
    author: {
      "@type": "Organization",
      name: params.author || siteName,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    image: params.image || `${siteUrl}/og-default.png`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    keywords: params.tags?.join(", "),
    inLanguage: "vi-VN",
  };
}

/** BreadcrumbList JSON-LD */
export function breadcrumbListSchema(items: { name: string; href: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.href}`,
    })),
  };
}

/** WebSite JSON-LD for homepage */
export function websiteSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    description: "Công cụ tải video YouTube, TikTok, Facebook miễn phí. So sánh giá điện thoại cũ Shopee, Lazada, Tiki.",
    inLanguage: "vi-VN",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/** FAQPage JSON-LD */
export function faqSchema(questions: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}
