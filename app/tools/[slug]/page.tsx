import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/slots";
import { DownloaderForm } from "@/components/downloader-form";
import { tools } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

type Props = {
  params: { slug: string };
};

export function generateStaticParams() {
  return tools.map((tool) => ({ slug: tool.slug }));
}

export function generateMetadata({ params }: Props) {
  const tool = tools.find((item) => item.slug === params.slug);
  if (!tool) return {};
  return pageMetadata(`${tool.title} miễn phí`, `${tool.description} Tối ưu SEO cho từ khóa ${tool.keyword}.`, `/tools/${tool.slug}`);
}

export default function ToolPage({ params }: Props) {
  const tool = tools.find((item) => item.slug === params.slug);
  if (!tool) notFound();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `${tool.title} có miễn phí không?`,
        acceptedAnswer: { "@type": "Answer", text: "Có. Public tool có thể dùng miễn phí và website kiếm tiền bằng quảng cáo, ad gate và affiliate." }
      },
      {
        "@type": "Question",
        name: "Có thể gắn quảng cáo trước khi tải không?",
        acceptedAnswer: { "@type": "Answer", text: "Có. Luồng hiện có ad gate mock và các vị trí banner/native để gắn mạng quảng cáo khi production." }
      }
    ]
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <section className="page-band py-16">
        <div className="container-page">
          <div className="max-w-3xl">
            <p className="font-extrabold uppercase tracking-wide text-shopee">{tool.keyword}</p>
            <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">{tool.title}</h1>
            <p className="mt-5 text-lg text-muted">{tool.description}</p>
          </div>
          <div className="mt-8">
            <DownloaderForm />
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_320px]">
          <article className="prose prose-slate max-w-none">
            <h2>Cách dùng {tool.title}</h2>
            <ol>
              <li>Dán link video vào ô nhập liệu bên trên.</li>
              <li>Bấm "Phân tích link" — hệ thống tự nhận diện nền tảng và hiển thị thumbnail, thời lượng và các định dạng tải về.</li>
              <li>Chọn định dạng mong muốn (1080p, 720p, MP3...) và bấm để tải về máy.</li>
              <li>File được xử lý trực tiếp, an toàn và không bị lưu lại trên máy chủ.</li>
            </ol>
            <AdSlot label="Quảng cáo tự nhiên" />
            <h2>Định dạng hỗ trợ</h2>
            <ul>
              {tool.formats.map((format: string) => <li key={format}>{format}</li>)}
            </ul>
            <h2>Mẹo tải video hiệu quả</h2>
            <p>
              Để tải video từ khóa <b>{tool.keyword}</b> với chất lượng tốt nhất, hãy chọn định dạng MP4 1080p. Nếu chỉ cần âm thanh, chọn MP3 để tiết kiệm dung lượng. Tool hỗ trợ miễn phí và không giới hạn lượt dùng.
            </p>
          </article>
          <aside className="space-y-4">
            <AdSlot label="Sidebar ad 300x250" compact />
            <div className="card p-5">
              <h2 className="text-lg font-extrabold">Bạn đang kinh doanh online?</h2>
              <p className="mt-2 text-sm text-muted">Quản lý đánh giá, theo dõi đối thủ và kiểm soát tồn kho Shopee ngay trên một bảng điều khiển duy nhất.</p>
              <Link href="/dashboard" className="mt-4 inline-flex rounded-xl bg-shopee px-4 py-3 text-sm font-extrabold text-white hover:bg-shopee/90 transition-colors">Vào Dashboard Shop</Link>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
