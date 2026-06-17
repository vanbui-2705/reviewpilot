import Link from "next/link";
import { HelpCircle, MessageSquare, Shield, Zap } from "lucide-react";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata(
  "FAQ - Câu hỏi thường gặp về ReviewPilot",
  "Giải đáp các thắc mắc về downloader, dashboard, affiliate và thanh toán.",
  "/faq"
);

const faqs = [
  {
    q: "Downloader có thực sự miễn phí không?",
    a: "Có. Công cụ downloader công cộng hoàn toàn miễn phí. Website kiếm tiền qua quảng cáo hiển thị trước khi tải (ad gate). Bạn không cần đăng ký để dùng tool.",
  },
  {
    q: "Hỗ trợ những nền tảng nào?",
    a: "Hiện tại hỗ trợ YouTube, TikTok, Facebook và Instagram. Chúng tôi đang phát triển thêm Twitter/X và Pinterest.",
  },
  {
    q: "Dashboard cho chủ shop có gì khác với downloader?",
    a: "Dashboard là sản phẩm trả phí dành cho chủ shop bán hàng online. Gồm theo dõi review xấu, cảnh báo đối thủ giảm giá, quản lý tồn kho và AI trả lời review tự động.",
  },
  {
    q: "Shopee affiliate hoạt động như thế nào?",
    a: "Chúng tôi gợi ý sản phẩm phù hợp với chủ shop. Khi bạn bấm mua, link được tracking qua Shopee Affiliate API. Bạn nhận hoa hồng từ 4% đến 10% tùy sản phẩm.",
  },
  {
    q: "Các gói giá dashboard khác nhau thế nào?",
    a: "Free: test 1 shop, 50 reviews/tháng. Starter (200k/tháng): 500 reviews, Zalo + email alert, 5 đối thủ. Pro (400k/tháng): 10 shop, không giới hạn review, 20 đối thủ, quản lý kho, team 5 người.",
  },
  {
    q: "Làm sao để bắt đầu kiếm tiền?",
    a: "Bước 1: Dùng tool downloader miễn phí. Bước 2: Đăng ký dashboard để theo dõi shop (nếu bạn bán hàng). Bước 3: Mua sản phẩm qua link affiliate. Bước 4: Liên hệ chúng tôi để setup kênh kiếm tiền của riêng bạn.",
  },
  {
    q: "Có thể tự cài đặt hệ thống cho riêng mình không?",
    a: "Có. Bạn có thể clone source code, cấu hình domain và API key riêng, rồi deploy trên Railway, Render hoặc VPS. Xem phần deployment trong tài liệu.",
  },
  {
    q: "Dữ liệu shop của tôi có an toàn không?",
    a: "Chúng tôi không lưu mật khẩu shop. Kết nối qua API chính thức của Shopee/Lazada. Dữ liệu được mã hóa và không chia sẻ cho bên thứ ba.",
  },
];

const categories = [
  { icon: Zap, title: "Downloader", desc: "Công cụ tải video miễn phí", href: "/tools/youtube" },
  { icon: Shield, title: "Dashboard", desc: "Quản trị shop trả phí", href: "/pricing" },
  { icon: MessageSquare, title: "Affiliate", desc: "Sản phẩm gắn link kiếm hoa hồng", href: "/affiliate" },
  { icon: HelpCircle, title: "Hỗ trợ", desc: "Liên hệ team hỗ trợ", href: "/contact" },
];

export default function FAQPage() {
  return (
    <main>
      <section className="page-band py-16">
        <div className="container-page max-w-3xl">
          <p className="font-extrabold uppercase tracking-wide text-shopee">Hỗ trợ</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-5xl">Câu hỏi thường gặp</h1>
          <p className="mt-5 text-lg text-muted">
            Mọi thứ bạn cần biết trước khi bắt đầu sử dụng ReviewPilot.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page grid gap-4 md:grid-cols-4">
          {categories.map((cat) => (
            <Link
              key={cat.title}
              href={cat.href}
              className="card p-5 text-center hover:border-shopee"
            >
              <cat.icon className="mx-auto h-8 w-8 text-shopee" />
              <div className="mt-3 font-extrabold">{cat.title}</div>
              <div className="mt-1 text-sm text-muted">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-band py-16">
        <div className="container-page max-w-3xl">
          <div className="grid gap-6">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="card group"
              >
                <summary className="flex cursor-pointer items-center justify-between p-5 font-extrabold">
                  {item.q}
                  <span className="text-shopee group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="border-t border-line px-5 py-4 text-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container-page max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold">Vẫn còn thắc mắc?</h2>
          <p className="mt-3 text-muted">
            Liên hệ trực tiếp qua Zalo hoặc email, chúng tôi phản hồi trong 2 giờ làm việc.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="focus-ring rounded-ui bg-shopee px-6 py-3 font-extrabold text-white">
              Liên hệ hỗ trợ
            </Link>
            <Link href="/tools/youtube" className="focus-ring rounded-ui border border-line px-6 py-3 font-extrabold hover:border-shopee">
              Dùng thử miễn phí
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
