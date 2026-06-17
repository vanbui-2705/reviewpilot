import Link from "next/link";
import { FilePlus2, SearchCheck } from "lucide-react";
import { seoArticles } from "@/lib/data";

export default function AdminArticlesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-extrabold uppercase tracking-wide text-shopee">Content</p>
          <h1 className="mt-2 text-3xl font-extrabold">Quan ly bai SEO</h1>
          <p className="mt-1 text-sm text-muted">Lập lịch bài viết, gắn intent, keyword và CTA affiliate/dashboard.</p>
        </div>
        <button className="btn-primary"><FilePlus2 className="h-4 w-4" />Tạo bài viết</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {seoArticles.map((article, index) => (
          <article key={article.slug} className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="badge-shopee">{article.intent}</span>
              <span className="text-xs font-extrabold text-muted">Score {index === 0 ? 86 : 72 + index}</span>
            </div>
            <h2 className="text-lg font-extrabold leading-snug">{article.title}</h2>
            <p className="mt-2 text-sm text-muted">{article.summary}</p>
            <div className="mt-4 flex items-center gap-2 text-sm font-bold text-muted">
              <SearchCheck className="h-4 w-4 text-leaf" />
              {article.keyword}
            </div>
            <div className="mt-5 flex items-center justify-between">
              <span className="badge">{index < 2 ? "Published" : "Draft"}</span>
              <Link href={`/blog/${article.slug}`} className="text-sm font-extrabold text-shopee">Xem bai</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
