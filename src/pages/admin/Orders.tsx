import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { mapAdminStatus } from "@/lib/mapAdminStatus";

type AdminUiStatus = "pending" | "processing" | "shipping" | "completed" | "cancelled";

interface Order {
  id: string;
  customer: string;
  phone: string;
  products: string;
  total: number;
  // rawStatus: đọc từ BE (pending, waiting, preparing, done, completed, cancelled, confirmed...)
  rawStatus: string;
  // status: status đã map cho UI Admin
  status: AdminUiStatus;
  date: string;
}


const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-accent/10 text-accent", icon: Clock },
  processing: { label: "Đang xử lý", color: "bg-secondary/10 text-secondary", icon: Truck },
  shipping: { label: "Đang giao", color: "bg-primary/10 text-primary", icon: Truck },
  completed: { label: "Hoàn thành", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
  cancelled: { label: "Đã hủy", color: "bg-destructive/10 text-destructive", icon: XCircle },
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchOrders = async () => {

    try {
      const res = await apiCall("/admin/orders", {
        method: "GET",
        headers: {},
      });

      console.log("📦 Dữ liệu trả về:", res);
      console.log("🔬 Mẫu dữ liệu đơn hàng:", res.data[0]);

      // 🛠 Nếu không có data, tránh crash
      if (!res || !Array.isArray(res.data)) {
        toast.error("Không thể tải đơn hàng");
        console.error("❌ Dữ liệu đơn hàng không hợp lệ:", res);
        return;
      }

      const mapped: Order[] = res.data.map((o: any) => {
        console.log(`🔍 Dòng đơn hàng: ${o.Id} →`, o.ProductList || o.productList || o.productlist);

        const rawStatus = ((o.Status || o.status || "pending") as string).toLowerCase();
        const uiStatus = mapAdminStatus(rawStatus);

        return {
          id: o.Id || o.id,
          customer: o.CustomerName || o.user?.name || "Ẩn danh",
          phone: o.Phone || o.user?.phone || "",
          products:
            o.ProductList && typeof o.ProductList === "string" && o.ProductList.trim()
              ? o.ProductList
              : "(không có dữ liệu)",
          total: o.Total || o.total || 0,
          rawStatus,      // lưu status gốc để sau này muốn dùng cũng có
          status: uiStatus,
          date: o.CreatedAt
            ? new Date(o.CreatedAt).toLocaleString("vi-VN")
            : new Date().toLocaleString("vi-VN"),
        };
      });


      setOrders(mapped);
      console.log("📦 setOrders gọi xong, orders mới:", mapped);
    } catch (err) {
      toast.error("Lỗi khi tải đơn hàng");
      console.error("❌ fetchOrders error:", err);
    }
  };



  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      console.log("🔄 Đang cập nhật đơn:", orderId, "→", newStatus);

      const res = await apiCall(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {},
        body: JSON.stringify({ status: newStatus }),
      });

      console.log("📬 Phản hồi từ server:", res);

      if (res && res.message?.includes("Đơn hàng")) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        console.log("✅ Đã cập nhật trạng thái trong FE");
        toast.success("✅ Trạng thái đã được cập nhật");
      } else {
        toast.error("Cập nhật trạng thái thất bại");
      }
    } catch (err) {
      toast.error("Lỗi khi cập nhật trạng thái");
      console.error("❌ updateOrderStatus error:", err);
    }
  };


  const cancelOrder = async (orderId: string) => {
    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này không?")) return;
    try {
      const res = await apiCall(`/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {},
        body: JSON.stringify({ status: "cancelled" }),
      });

      if (res && res.message?.includes("Đơn hàng")) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: "cancelled" } : order
          )
        );
        toast.error("🛑 Đơn hàng đã được hủy");
      } else {
        toast.error("Không thể hủy đơn hàng");
      }
    } catch (err) {
      toast.error("Lỗi khi hủy đơn hàng");
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý đơn hàng</h2>
        <p className="text-muted-foreground">Theo dõi, cập nhật và hủy đơn hàng</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách hàng..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn hàng</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipping">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold">Mã đơn</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Khách hàng</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Sản phẩm</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Tổng tiền</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Thời gian</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Trạng thái</th>
                <th className="text-left py-4 px-6 text-sm font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const statusObj = statusConfig[order.status] || {
                  label: "Không rõ",
                  color: "bg-muted text-muted-foreground",
                  icon: XCircle,
                };
                const StatusIcon = statusObj.icon;

                return (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-4 px-6 font-medium">{order.id}</td>
                    <td className="py-4 px-6">
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.phone}</p>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground max-w-xs truncate">
                      {order.products}
                    </td>
                    <td className="py-4 px-6 font-semibold text-primary">
                      {order.total.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-4 px-6">
                      <Badge className={statusObj.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusObj.label}
                      </Badge>

                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value as Order["status"])
                          }
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="processing">Đang xử lý</SelectItem>
                            <SelectItem value="shipping">Đang giao</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                            <SelectItem value="cancelled">Đã hủy</SelectItem>
                          </SelectContent>
                        </Select>

                        {order.status !== "cancelled" && order.status !== "completed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                            onClick={() => cancelOrder(order.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Hủy
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
