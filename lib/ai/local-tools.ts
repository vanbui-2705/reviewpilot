export type CompetitorPrice = {
  shopName: string;
  price: number;
  sold?: number;
  rating?: number;
};

export type SentimentResult = {
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  score: number;
  highlights: Array<{
    text: string;
    sentiment: "positive" | "neutral" | "negative";
    reason: string;
  }>;
  suggestions: string[];
};

const positiveWords = ["tot", "dep", "nhanh", "ung y", "dang tien", "hai long", "chat luong", "se mua", "ok"];
const negativeWords = ["kem", "cham", "loi", "hong", "be", "khong nhu", "that vong", "doi tra", "xau"];

function normalize(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function formatVnd(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

export function createReviewReply(input: { review: string; rating?: number; shopName?: string }) {
  const rating = input.rating ?? 3;
  const shop = input.shopName?.trim() || "shop";
  const tone =
    rating <= 2
      ? "Shop xin lỗi anh/chị vì trải nghiệm chưa tốt lần này."
      : rating === 3
        ? "Shop cảm ơn anh/chị đã góp ý để bên em cải thiện dịch vụ."
        : "Shop cảm ơn anh/chị đã tin tưởng và đánh giá sản phẩm.";

  if (rating <= 3) {
    return `${tone} ${shop} mong anh/chị nhắn tin kèm mã đơn hàng để bên em kiểm tra ngay và đưa ra hướng hỗ trợ phù hợp như đổi trả, bổ sung hoặc hoàn tiền nếu có lỗi từ shop. Bên em sẽ xử lý sớm và cập nhật lại cho anh/chị trong thời gian ngắn nhất.`;
  }

  return `${tone} Phản hồi của anh/chị là động lực rất lớn để ${shop} tiếp tục giữ chất lượng sản phẩm và dịch vụ. Nếu cần hỗ trợ thêm, anh/chị cứ nhắn tin cho shop bất cứ lúc nào.`;
}

export function createProductDescription(input: { name: string; features?: string; category?: string }) {
  const features = input.features
    ?.split(/\n|,/)
    .map((item) => item.trim().replace(/^[-*]\s*/, ""))
    .filter(Boolean)
    .slice(0, 5);

  const bullets = features?.length
    ? features.map((item) => `- ${item}`).join("\n")
    : "- Thiết kế tiện dụng, dễ sử dụng\n- Phù hợp nhu cầu hằng ngày\n- Đóng gói cẩn thận trước khi giao";

  return `${input.name} là lựa chọn phù hợp cho khách hàng cần sản phẩm ${input.category || "chất lượng"} với mức giá hợp lý.\n\nĐiểm nổi bật:\n${bullets}\n\nShop kiểm tra hàng trước khi đóng gói, hỗ trợ tư vấn nhanh và xử lý đổi trả theo chính sách nếu phát sinh lỗi. Đặt hàng ngay để giữ giá tốt trong hôm nay.`;
}

export function createSeoTitles(input: { name: string; keywords?: string }) {
  const keywords = input.keywords
    ?.split(/,|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
  const suffix = keywords?.length ? keywords.join(", ") : "hàng chính hãng, giá tốt";

  return [
    `${input.name} | ${suffix} - Sản phẩm bán chạy cho shop`,
    `${input.name} chất lượng cao, dễ sử dụng, bảo hành theo shop`,
    `${input.name} giá tốt hôm nay - Đóng gói cẩn thận, giao nhanh`,
    `${input.name} phù hợp sử dụng hằng ngày, mẫu mới, hàng sẵn có`,
    `${input.name} [Ưu đãi] ${suffix} - Tư vấn nhanh trước khi mua`,
  ];
}

export function analyzePrice(input: {
  productName: string;
  myPrice: number;
  competitorPrices: CompetitorPrice[];
}) {
  const prices = input.competitorPrices.map((item) => item.price);
  const minCompetitor = Math.min(...prices);
  const maxCompetitor = Math.max(...prices);
  const avgCompetitor = Math.round(prices.reduce((sum, price) => sum + price, 0) / prices.length);
  const delta = input.myPrice - avgCompetitor;
  const percent = Math.round((Math.abs(delta) / avgCompetitor) * 100);
  const cheaperThanAvg = delta < 0;
  const suggestedPrice = cheaperThanAvg
    ? Math.round(Math.min(avgCompetitor * 0.98, input.myPrice * 1.03) / 1000) * 1000
    : Math.round((avgCompetitor * 0.97) / 1000) * 1000;
  const riskLevel = input.myPrice > avgCompetitor * 1.08 ? "Cao" : input.myPrice < minCompetitor * 0.92 ? "Trung bình" : "Thấp";

  return {
    text:
      `TÓM TẮT: Giá hiện tại của bạn là ${formatVnd(input.myPrice)}, ${cheaperThanAvg ? "thấp hơn" : "cao hơn"} giá trung bình đối thủ khoảng ${percent}%.\n` +
      `ĐỀ XUẤT: Nên thử mức ${formatVnd(suggestedPrice)} cho ${input.productName}; mức này vẫn cạnh tranh nhưng không phá biên lợi nhuận quá mạnh.\n` +
      `RỦI RO: ${riskLevel}. Giá đối thủ dao động từ ${formatVnd(minCompetitor)} đến ${formatVnd(maxCompetitor)}, trung bình ${formatVnd(avgCompetitor)}.\n` +
      "MẸO: Thêm voucher nhỏ theo giờ cao điểm; đẩy combo/phụ kiện để tăng AOV; nếu giá cao hơn, cần làm rõ bảo hành và quà tặng.",
    stats: { myPrice: input.myPrice, minCompetitor, maxCompetitor, avgCompetitor, suggestedPrice, riskLevel },
  };
}

function classify(text: string): "positive" | "neutral" | "negative" {
  const normalized = normalize(text);
  const pos = positiveWords.filter((word) => normalized.includes(word)).length;
  const neg = negativeWords.filter((word) => normalized.includes(word)).length;
  if (neg > pos) return "negative";
  if (pos > neg) return "positive";
  return "neutral";
}

export function analyzeSentiment(input: { reviews: string[]; productName?: string }): SentimentResult {
  const highlights = input.reviews.slice(0, 5).map((text) => {
    const sentiment = classify(text);
    return {
      text,
      sentiment,
      reason:
        sentiment === "positive"
          ? "Có tín hiệu hài lòng về sản phẩm hoặc dịch vụ."
          : sentiment === "negative"
            ? "Có từ khóa phản ánh vấn đề cần shop xử lý."
            : "Phản hồi chưa nghiêng rõ về tích cực hay tiêu cực.",
    };
  });
  const positive = highlights.filter((item) => item.sentiment === "positive").length;
  const negative = highlights.filter((item) => item.sentiment === "negative").length;
  const score = Math.max(0, Math.min(100, 50 + positive * 15 - negative * 18));
  const sentiment = score >= 65 ? "positive" : score <= 40 ? "negative" : "neutral";

  return {
    summary: `${input.productName || "Sản phẩm"} đang có ${sentiment === "positive" ? "tín hiệu tốt" : sentiment === "negative" ? "vấn đề cần xử lý sớm" : "phản hồi trung tính"} từ ${input.reviews.length} review.`,
    sentiment,
    score,
    highlights,
    suggestions: [
      "Ưu tiên phản hồi review 1-3 sao trong ngày.",
      "Gom các lỗi lặp lại để sửa mô tả sản phẩm và quy trình đóng gói.",
      "Dùng review tốt làm bằng chứng trong mô tả và banner sản phẩm.",
    ],
  };
}

export function isWeakGeneratedText(text: string) {
  const normalized = normalize(text);
  if (normalized.length < 30) return true;
  return [
    "khong hieu cau hoi",
    "khong the giup",
    "toi la mot mo hinh",
    "as an ai",
    "i cannot",
    "i'm sorry",
    "xin loi, toi khong hieu",
  ].some((pattern) => normalized.includes(pattern));
}
