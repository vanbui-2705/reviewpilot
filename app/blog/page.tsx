"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

type Article = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  keyword: string;
  intent: string;
  publishedAt: string | null;
};

export default function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) setArticles(data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="py-16">
      <div className="container-page">
        <p className="font-extrabold uppercase tracking-wide text-shopee">SEO content engine</p>
        <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Blog kéo traffic và chuyển đổi</h1>
        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-3 w-20 rounded bg-line" />
                <div className="mt-4 h-5 w-3/4 rounded bg-line" />
                <div className="mt-3 h-4 w-full rounded bg-line" />
              </div>
            ))}
          </div>
        ) : articles.length === 0 ? (
          <p className="mt-8 text-muted">Chưa có bài viết nào. Hãy quay lại sau!</p>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="card p-6 hover:border-shopee"
              >
                <div className="text-xs font-extrabold uppercase tracking-wide text-ocean">{article.intent}</div>
                <h2 className="mt-3 text-xl font-extrabold">{article.title}</h2>
                <p className="mt-3 text-muted">{article.summary}</p>
                <div className="mt-4 font-extrabold text-shopee">{article.keyword}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
