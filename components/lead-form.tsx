"use client";

import { useState } from "react";

export function LeadForm() {
  const [done, setDone] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData.entries()))
    });
    event.currentTarget.reset();
    setDone(true);
  }

  return (
    <form onSubmit={submit} className="grid gap-3 rounded-ui bg-white p-4 text-ink">
      <input name="name" required placeholder="Tên của bạn" className="focus-ring rounded-ui border-line" />
      <input name="contact" required placeholder="Email hoặc Zalo" className="focus-ring rounded-ui border-line" />
      <input name="shopUrl" placeholder="Link shop Shopee nếu có" className="focus-ring rounded-ui border-line" />
      <select name="need" required className="focus-ring rounded-ui border-line">
        <option value="">Bạn muốn làm trước phần nào?</option>
        <option>Public downloader + ads</option>
        <option>Shopee affiliate</option>
        <option>Dashboard chủ shop</option>
        <option>SEO blog automation</option>
      </select>
      <button className="focus-ring rounded-ui bg-shopee px-5 py-3 font-extrabold text-white">Gửi lead</button>
      {done ? <p className="text-sm font-bold text-leaf">Đã nhận thông tin demo. API /api/leads đã xử lý request.</p> : null}
    </form>
  );
}
