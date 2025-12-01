// src/lib/mapAdminStatus.ts

// rawStatus: giá trị lấy từ BE / DB (pending, waiting, preparing, done, completed, cancelled, confirmed,...)
// Trả về status dùng cho UI Admin
export function mapAdminStatus(rawStatus: string): "pending" | "processing" | "shipping" | "completed" | "cancelled" {
  const normalized = (rawStatus || "").toLowerCase();

  switch (normalized) {
    case "waiting":
    case "preparing":
      return "processing"; // chờ barista / đang pha → Đang xử lý

    case "done":
      return "shipping"; // barista xong → coi như đang giao / sẵn sàng giao

    case "completed":
      return "completed";

    case "cancelled":
      return "cancelled";

    // confirmed (thanh toán online xong nhưng chưa chuyển sang workflow khác) → tạm coi như pending
    case "confirmed":
      return "pending";

    case "pending":
    default:
      return "pending";
  }
}
