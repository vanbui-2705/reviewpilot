"use client";

export default function SettingsPage() {
  return (
    <main className="bg-soft py-8">
      <div className="container-page max-w-3xl">
        <div>
          <p className="font-extrabold uppercase tracking-wide text-shopee">Cài đặt</p>
          <h1 className="mt-2 text-3xl font-extrabold">Cài đặt tài khoản</h1>
          <p className="mt-1 text-sm text-muted">Quản lý thông báo và tùy chọn dashboard</p>
        </div>
        <section className="card mt-6 p-6">
          <h2 className="text-lg font-extrabold">Thông báo</h2>
          <p className="mt-1 text-sm text-muted">Chọn loại thông báo bạn muốn nhận</p>
          <div className="mt-5 space-y-3">
            {["Review xấu", "Đối thư giảm giá", "Tồn kho sắp hết", "Báo cáo tuần"].map((label) => (
              <label key={label} className="flex cursor-pointer items-center justify-between rounded-ui border border-line p-4 hover:bg-soft transition-colors">
                <span className="text-sm font-bold">{label}</span>
                <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line text-shopee focus:ring-shopee" />
              </label>
            ))}
          </div>
          <button className="mt-6 rounded-ui bg-shopee px-5 py-3 font-extrabold text-white hover:bg-shopee/90 transition-colors">
            Lưu thay đổi
          </button>
        </section>

        <section className="card mt-6 p-6">
          <h2 className="text-lg font-extrabold">Kết nối shop</h2>
          <p className="mt-1 text-sm text-muted">Liên kết tài khoản Shopee, Lazada, Tiki để đồng bộ dữ liệu</p>
          <div className="mt-5 space-y-3">
            {["Shopee", "Lazada", "Tiki"].map((platform) => (
              <div key={platform} className="flex items-center justify-between rounded-ui border border-line p-4">
                <span className="text-sm font-bold">{platform}</span>
                <button className="rounded-ui border border-line px-4 py-2 text-sm font-bold hover:bg-soft transition-colors">
                  Kết nối
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
