import { Mail, MessageSquare } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "Liên hệ ReviewPilot - Hỗ trợ và hợp tác",
  "Liên hệ team ReviewPilot qua email hoặc Zalo để hỗ trợ, hợp tác affiliate, báo giá dashboard hoặc tích hợp API.",
  "/contact"
);

export default function ContactPage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page max-w-3xl">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Liên hệ</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Hợp tác và hỗ trợ</h1>
          <p className="mt-5 text-lg text-muted">
            Có câu hỏi, muốn hợp tác affiliate hoặc cần báo giá custom? Gửi thông tin, hệ thống sẽ nhận lead qua API.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_420px]">
          <div className="grid gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-ui bg-orange-50 text-shopee">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold">Email</div>
                  <a href="mailto:support@reviewpilot.vn" className="text-shopee font-bold hover:underline">
  support@reviewpilot.vn
</a>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">Dành cho hợp tác, báo giá hoặc báo lỗi hệ thống.</p>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-ui bg-green-50 text-leaf">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-extrabold">Zalo OA</div>
                  <div className="text-sm text-muted">ReviewPilot Support</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted">Kênh hỗ trợ nhanh cho chủ shop đang dùng dashboard.</p>
            </div>

            <div className="card p-6">
              <h2 className="font-extrabold">Chủ đề hỗ trợ</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Downloader không hoạt động",
                  "Lắp đặt hệ thống tự host",
                  "Hợp tác affiliate và revenue share",
                  "Báo giá dashboard custom cho doanh nghiệp",
                  "Tích hợp API với nền tảng khác",
                  "Báo cáo lỗi và đề xuất tính năng"
                ].map((topic) => (
                  <li key={topic} className="flex items-start gap-2 text-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-shopee" />
                    {topic}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-extrabold">Gửi tin nhắn</h2>
            <p className="mt-2 text-sm text-muted">Form này gọi API `/api/leads`, sẵn sàng nối CRM hoặc email.</p>
            <div className="mt-5">
              <LeadForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
