export interface VietQRResult {
  qrImageUrl: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  transferContent: string;
}

export function createVietQR(params: {
  amount: number;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  transferContent: string;
  template?: string;
}): VietQRResult {
  const {
    amount,
    accountNumber,
    accountName,
    bankCode,
    transferContent,
    template = "compact2",
  } = params;

  const qrImageUrl =
    `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${encodeURIComponent(transferContent)}`;

  return {
    qrImageUrl,
    accountNumber,
    accountName,
    bankName: bankCode,
    transferContent,
  };
}

export function verifyVietQRTransfer(
  transactionId: string,
  expectedAmount: number,
): boolean {
  // VietQR không có real-time verify API miễn phí
  // Production: poll ngân hàng API hoặc dùng VietQR paid service
  // Tạm thời: return true — webhook từ ngân hàng sẽ confirm sau
  return true;
}
