import { BellRing, BarChart3, TrendingUp, Package, Bot, CreditCard, Plus, ArrowUpRight, CheckCircle2, Bell, User, ChevronDown, Star, Ticket, TrendingUp as TrendingUpIcon } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { getShopDashboardMetrics, getShopReviews, getShopChartData, getDefaultShop } from "@/lib/db-services";

export const metadata = pageMetadata(
  "Dashboard Shop - Quản lý đánh giá, đơn hàng và đối thủ",
  "Dashboard dành cho chủ shop: theo dõi đánh giá, quản lý đơn hàng, theo dõi đối thủ cạnh tranh, quản lý kho và công cụ AI.",
  "/dashboard"
);

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= rating
              ? "fill-shopee text-shopee"
              : "fill-transparent text-muted/30"
          }`}
        />
      ))}
    </div>
  );
}

export default async function DashboardPage() {
  const shop = await getDefaultShop();
  if (!shop) return <div>Vui lòng seed dữ liệu Shop.</div>;

  const metrics = await getShopDashboardMetrics(shop.id);
  const reviews = await getShopReviews(shop.id);
  const chartData = await getShopChartData(shop.id);

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-line/40">
        <h2 className="font-extrabold uppercase tracking-wide text-shopee text-sm">SHOP DASHBOARD</h2>
        <div className="flex items-center gap-4">
          <button className="focus-ring rounded-lg bg-[#cc4e14] px-5 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#cc4e14]/90 transition-all">
            Kết nối kênh bán hàng
          </button>
          <button className="p-2.5 text-muted hover:bg-soft rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-soft transition-colors pl-2">
            <div className="w-8 h-8 rounded-full bg-line/50 grid place-items-center">
              <User className="w-4 h-4 text-muted" />
            </div>
            <ChevronDown className="w-4 h-4 text-muted mr-1" />
          </div>
        </div>
      </div>

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-ink/90">Quản trị cửa hàng tập trung</h1>
        <p className="mt-1.5 text-sm text-muted">Theo dõi mọi hoạt động kinh doanh của shop trên một giao diện duy nhất</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-line/60 flex flex-col justify-between h-[120px]">
          <div className="text-[13px] font-semibold text-muted uppercase tracking-wider">REVIEWS CÁ NHÂN</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-ink/80">{metrics.reviewsTotal}</span>
            <span className="flex items-center text-sm font-semibold text-[#cc4e14]">
              <TrendingUpIcon className="w-4 h-4 mr-1 stroke-[3]" />
              {metrics.reviewsNew} hôm nay
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-line/60 flex flex-col justify-between h-[120px]">
          <div className="text-[13px] font-semibold text-muted uppercase tracking-wider">RATING TRUNG BÌNH</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-ink/80">{metrics.ratingAvg}</span>
            <span className="flex items-center text-sm font-semibold text-[#cc4e14]">
              <Star className="w-3.5 h-3.5 mr-1 stroke-[3] fill-transparent" />
              {metrics.ratingChange} tháng này
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-line/60 flex flex-col justify-between h-[120px]">
          <div className="text-[13px] font-semibold text-muted uppercase tracking-wider">ƯU ĐÃI ĐÃ GIẢM</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-ink/80">{metrics.competitorEvents}</span>
            <span className="flex items-center text-sm font-semibold text-[#cc4e14]">
              <Ticket className="w-4 h-4 mr-1 stroke-[2]" />
              {metrics.competitorNew} mới
            </span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-line/60 flex flex-col justify-between h-[120px]">
          <div className="text-[13px] font-semibold text-muted uppercase tracking-wider">DOANH THU THEO DÕI</div>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-light text-ink/80">{(metrics.revenue / 1000000).toLocaleString('vi-VN')}tr</span>
            <span className="flex items-center text-sm font-semibold text-[#cc4e14]">
              <TrendingUpIcon className="w-4 h-4 mr-1 stroke-[3]" />
              {metrics.revenueChange} tháng này
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Reviews & Chart */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        
        {/* Review Alerts */}
        <div className="rounded-2xl border border-line/60 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 pb-4 flex items-center justify-between border-b border-line/40">
            <div className="flex items-center gap-2.5">
              <BellRing className="h-5 w-5 text-[#cc4e14] fill-[#cc4e14]/20" />
              <h2 className="text-[15px] font-semibold text-ink/90">Giám sát Đánh giá (Live)</h2>
            </div>
            <button className="text-[13px] font-semibold text-blue-600 hover:underline">Xem tất cả</button>
          </div>
          
          <div className="p-6 flex-1 flex flex-col gap-4">
            {reviews.map((alert, idx) => {
              // Extract initials for avatar
              const initials = alert.reviewerName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
              
              return (
                <div key={alert.id} className="rounded-xl border border-line/60 p-5 flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-bold text-sm shrink-0">
                        {initials}
                      </div>
                      <div>
                        <div className="font-bold text-ink/90 text-[15px]">{alert.reviewerName}</div>
                        <StarRating rating={alert.rating} />
                      </div>
                    </div>
                    <span className="rounded-full bg-red-100 px-3 py-0.5 text-[13px] font-bold text-red-700 whitespace-nowrap">
                      {alert.rating} sao
                    </span>
                  </div>
                  
                  <p className="text-[15px] italic text-muted/90 leading-relaxed">
                    "{alert.content}"
                  </p>
                  
                  <div className="flex items-center gap-3 pt-1">
                    <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f05123] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#d8481e]">
                      <Bot className="w-4 h-4" />
                      Trả lời bằng AI
                    </button>
                    <button className="inline-flex items-center justify-center rounded-lg border border-line/80 bg-white px-4 py-2 text-xs font-bold text-ink/80 transition-colors hover:bg-soft">
                      Đánh dấu đã xử lý
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart Area */}
        <div className="rounded-2xl border border-line/60 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <BarChart3 className="h-5 w-5 text-blue-800" />
            <h2 className="text-[15px] font-semibold text-ink/90">Biểu đồ doanh thu 12 ngày qua</h2>
          </div>
          
          {/* Bar Chart Real Data */}
          <div className="flex items-end justify-between h-[160px] mb-6">
            {chartData.map((value, idx, arr) => {
              const maxVal = Math.max(...arr) || 128;
              const isLastTwo = idx >= arr.length - 2;
              return (
                <div 
                  key={idx} 
                  className={`w-3.5 rounded-t-full ${isLastTwo ? 'bg-[#f05123]' : 'bg-[#c5d5e6]'}`}
                  style={{ height: `${(value / maxVal) * 100}%` }}
                />
              );
            })}
          </div>
          
          <div className="rounded-xl bg-[#f5faeb] p-4 flex items-center justify-between mb-8">
            <div>
              <div className="text-[13px] text-muted/80 font-medium mb-1">Tổng thu nhập</div>
              <div className="text-xl font-extrabold text-ink">{metrics.revenue.toLocaleString('vi-VN')}đ</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <TrendingUpIcon className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-[13px] font-bold text-muted uppercase tracking-wider mb-4">PHÂN TÍCH NHANH</h3>
            <div className="space-y-3 text-[14px]">
              <div className="flex items-center justify-between">
                <span className="text-muted/90">Tăng trưởng so tháng trước</span>
                <span className="font-bold text-[#cc4e14]">{metrics.revenueChange}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted/90">Giao dịch thành công</span>
                <span className="font-bold text-ink">{metrics.transactions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted/90">Trung bình đơn</span>
                <span className="font-bold text-ink">{(Math.round(metrics.revenue / (metrics.transactions || 1) / 1000))}k</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
