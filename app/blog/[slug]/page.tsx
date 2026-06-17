import { notFound } from "next/navigation";
import Link from "next/link";
import { AffiliateGrid } from "@/components/affiliate-grid";
import { AdSlot } from "@/components/slots";
import { pageMetadata } from "@/lib/seo";

type Props = {
params: { slug: string };
};

// Article model removed — return empty static params
export function generateStaticParams() {
return [];
}

export function generateMetadata({ params }: Props) {
return pageMetadata("Bài viết không tồn tại", "Trang bạn tìm kiếm không tồn tại.", `/blog/${params.slug}`);
}

export default async function BlogArticlePage({ params }: Props) {
// Article model removed from schema
notFound();
}
