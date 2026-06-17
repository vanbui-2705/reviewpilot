import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Server,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import { reviewAlerts, seoArticles } from "@/lib/data";
import { getProducts } from "@/lib/product-service";

const stats = [
  { icon: Eye, label: "Lượt truy cập hôm nay", value: "12,847", change: "+18%", tone: "text-ocean" },
  { icon: Users, label: "Khách hàng tiềm năng mới", value: "234", change: "+12%", tone: "text-leaf" },
  { icon: DollarSign, label: "Doanh thu định kỳ (MRR)", value: "8.4tr", change: "+24%", tone: "text-shopee" },
  { icon: TrendingUp, label: "Tỷ lệ chuyển đổi", value: "3.2%", change: "+0.5%", tone: "text-ink" },
];

const jobs = [
  { name: "Crawl giá Shopee", status: "Cần thử lại", time: "2 phút trước", tone: "bg-red-50 text-red-700" },
  { name: "Tạo sitemap", status: "Hoàn tất", time: "18 phút trước", tone: "bg-green-50 text-leaf" },
  { name: "Đồng bộ click affiliate", status: "Đang chờ DB", time: "42 phút trước", tone: "bg-yellow-50 text-yellow-700" },
  { name: "Dọn dẹp file tải xuống", status: "Hoàn tất", time: "1 giờ trước", tone: "bg-green-50 text-leaf" },
];

const recentUsers = [
  { name: "Nguyễn Văn A", email: "nguyenvana@gmail.com", plan: "Cơ bản", status: "Dùng thử", value: "200k" },
  { name: "Trần Thị B", email: "tranthib@shopee.vn", plan: "Chuyên nghiệp", status: "Đã trả phí", value: "400k" },
  { name: "Lê Văn C", email: "levanc@gmail.com", plan: "Miễn phí", status: "Chưa chuyển đổi", value: "0đ" },
  { name: "Phạm Thị D", email: "phamthid@gmail.com", plan: "Cơ bản", status: "Quá hạn", value: "200k" },
];

const topPages = [
  { path: "/tools/youtube", views: "4,521", title: "Tải video YouTube" },
  { path: "/search", views: "3,088", title: "Crawl và so sánh giá" },
  { path: "/products/iphone-13-128gb-cu", views: "2,744", title: "iPhone 13 cũ" },
  { path: "/dich-vu", views: "1,876", title: "Dịch vụ cho shop" },
];

export default async function AdminDashboardPage() {
  const products = await getProducts();
  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
        <div className="grid gap-6 p-6 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="font-extrabold uppercase tracking-wide text-shopee">Bảng điều khiển Admin</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-normal md:text-4xl">Quản trị toàn bộ ReviewPilot</h1>
            <p className="mt-3 max-w-2xl text-muted text-base">
              Theo dõi lượt truy cập downloader, khách hàng tiềm năng, click affiliate, tiến trình crawl và bài viết SEO.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/admin/products" className="btn-primary">
                Quản lý sản phẩm
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/admin/settings" className="btn-outline">
                Cấu hình hệ thống
              </Link>
            </div>
          </div>
          <div className="rounded-xl border border-line bg-soft p-5 shadow-inner">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-sm font-extrabold text-ink">Tình trạng hệ thống</span>
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-extrabold text-leaf ring-1 ring-green-200">Hoạt động tốt</span>
            </div>
            <div className="mt-4 grid gap-3">
              {["Máy chủ Next.js", "Trình tải yt-dlp", "Tuyến đường API", "Sơ đồ trang web (Sitemap)"].map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg bg-white px-4 py-2 text-sm border border-line shadow-sm">
                  <span className="font-bold text-ink">{item}</span>
                  <CheckCircle2 className="h-4 w-4 text-leaf" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-6 border border-line bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-muted uppercase tracking-wider">{stat.label}</div>
              <div className={`p-2 rounded-lg bg-soft ${stat.tone}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-ink">{stat.value}</div>
            <div className="mt-1 text-sm font-bold text-leaf">{stat.change} so với tháng trước</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <div className="card p-6 border border-line bg-white shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Người dùng và Gói đăng ký</h2>
              <p className="text-sm text-muted mt-1">Danh sách người dùng trả phí và dùng thử mới nhất</p>
            </div>
            <Link href="/admin/users" className="text-sm font-extrabold text-shopee bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-shopee hover:text-white transition-colors">Xem tất cả</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[660px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-muted bg-soft">
                  <th className="p-3 font-bold rounded-tl-lg">Người dùng</th>
                  <th className="p-3 font-bold">Gói dịch vụ</th>
                  <th className="p-3 font-bold">Trạng thái</th>
                  <th className="p-3 text-right font-bold rounded-tr-lg">Giá trị</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentUsers.map((user) => (
                  <tr key={user.email} className="hover:bg-soft/50 transition-colors">
                    <td className="p-3">
                      <div className="font-extrabold text-ink">{user.name}</div>
                      <div className="text-xs text-muted mt-0.5">{user.email}</div>
                    </td>
                    <td className="p-3"><span className="px-2 py-1 bg-soft rounded text-xs font-bold border border-line">{user.plan}</span></td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs font-extrabold ${user.status === 'Đã trả phí' ? 'bg-green-50 text-leaf' : 'bg-orange-50 text-shopee'}`}>{user.status}</span></td>
                    <td className="p-3 text-right font-extrabold text-ink">{user.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6 border border-line bg-white shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Hàng đợi vận hành (Tiến trình ngầm)</h2>
              <p className="text-sm text-muted mt-1">Trạng thái của các tiến trình crawl tự động</p>
            </div>
            <Server className="h-6 w-6 text-muted" />
          </div>
          <div className="grid gap-3">
            {jobs.map((job) => (
              <div key={job.name} className="flex items-center justify-between gap-3 rounded-xl border border-line p-4 hover:border-shopee/30 transition-colors bg-white">
                <div>
                  <div className="font-bold text-ink">{job.name}</div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted"><Clock className="h-3.5 w-3.5" />{job.time}</div>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${job.tone}`}>{job.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <div className="card p-6 border border-line bg-white shadow-sm">
          <div className="mb-5 border-b border-line pb-4">
            <h2 className="text-xl font-extrabold text-ink">Trang có lượt truy cập cao nhất</h2>
            <p className="text-sm text-muted mt-1">Các trang thu hút nhiều khách truy cập nhất</p>
          </div>
          <div className="grid gap-3">
            {topPages.map((page, i) => (
              <div key={page.path} className="grid grid-cols-[34px_1fr_auto] items-center gap-4 rounded-xl border border-line p-4 hover:bg-soft transition-colors">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-orange-50 text-shopee text-sm font-extrabold">#{i + 1}</span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-extrabold text-ink">{page.title}</div>
                  <div className="truncate text-xs text-muted mt-0.5">{page.path}</div>
                </div>
                <div className="font-extrabold text-shopee bg-orange-50 px-2 py-1 rounded-md text-sm">{page.views}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6 border border-line bg-white shadow-sm">
          <div className="mb-5 flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Dữ liệu cần xử lý (Cảnh báo)</h2>
              <p className="text-sm text-muted mt-1">Các hạng mục yêu cầu sự can thiệp của admin</p>
            </div>
            <AlertTriangle className="h-6 w-6 text-shopee" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-line p-5 bg-white hover:border-shopee/40 transition-colors shadow-sm">
              <ShoppingCart className="mb-4 h-6 w-6 text-shopee" />
              <div className="text-sm font-bold text-muted">Sản phẩm mồi</div>
              <div className="mt-1 text-3xl font-extrabold text-ink">{products.length}</div>
              <div className="mt-2 text-xs font-medium text-shopee bg-orange-50 px-2 py-1 inline-block rounded">Cần thêm 50-100 SP</div>
            </div>
            <div className="rounded-xl border border-line p-5 bg-white hover:border-ocean/40 transition-colors shadow-sm">
              <FileText className="mb-4 h-6 w-6 text-ocean" />
              <div className="text-sm font-bold text-muted">Bài viết SEO</div>
              <div className="mt-1 text-3xl font-extrabold text-ink">{seoArticles.length}</div>
              <div className="mt-2 text-xs font-medium text-ocean bg-blue-50 px-2 py-1 inline-block rounded">Cần lên lịch đăng</div>
            </div>
            <div className="rounded-xl border border-line p-5 bg-white hover:border-red-600/40 transition-colors shadow-sm">
              <AlertTriangle className="mb-4 h-6 w-6 text-red-600" />
              <div className="text-sm font-bold text-muted">Đánh giá tiêu cực</div>
              <div className="mt-1 text-3xl font-extrabold text-ink">{reviewAlerts.length}</div>
              <div className="mt-2 text-xs font-medium text-red-600 bg-red-50 px-2 py-1 inline-block rounded">Cần xử lý ngay</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
