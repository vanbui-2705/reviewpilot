"use client";

import { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

type LeadStatus = "idle" | "loading" | "success" | "error";

export function LeadForm() {
  const [status, setStatus] = useState<LeadStatus>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    topic: "",
  });

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Lỗi gửi form");
      setStatus("success");
      setForm({ name: "", email: "", company: "", message: "", topic: "" });
    } catch {
      setStatus("error");
    }
  };

  const topics = [
    "Hỗ trợ kỹ thuật",
    "Hợp tác affiliate",
    "Báo giá dashboard",
    "Tích hợp API",
    "Báo lỗi hệ thống",
    "Khác",
  ];

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Họ và tên <span className="text-shopee">*</span>
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={update("name")}
          placeholder="Nguyễn Văn A"
          className="input"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Email <span className="text-shopee">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          placeholder="email@example.com"
          className="input"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Công ty / Shop
        </label>
        <input
          type="text"
          value={form.company}
          onChange={update("company")}
          placeholder="Tên shop hoặc công ty (tuỳ chọn)"
          className="input"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Chủ đề <span className="text-shopee">*</span>
        </label>
        <select
          required
          value={form.topic}
          onChange={update("topic")}
          className="input"
        >
          <option value="">-- Chọn chủ đề --</option>
          {topics.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-bold text-ink">
          Nội dung <span className="text-shopee">*</span>
        </label>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={update("message")}
          placeholder="Mô tả chi tiết yêu cầu của bạn..."
          className="input"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-primary w-full disabled:opacity-50"
      >
        {status === "loading" ? "Đang gửi..." : "Gửi tin nhắn"}
      </button>

      {status === "success" && (
        <div className="flex items-center gap-2 rounded-ui border border-leaf/20 bg-leaf/5 p-3 text-sm text-leaf">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Tin nhắn đã được gửi thành công! Team sẽ phản hồi trong 24h.
        </div>
      )}

      {status === "error" && (
        <div className="flex items-center gap-2 rounded-ui border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          Có lỗi xảy ra. Vui lòng thử lại hoặc gửi email trực tiếp.
        </div>
      )}
    </form>
  );
}
