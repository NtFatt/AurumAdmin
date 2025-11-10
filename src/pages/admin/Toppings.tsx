import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type Topping = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  supplier: string;
  minStock: number;
  lastUpdated: string;
};

export default function Toppings() {
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTopping, setNewTopping] = useState({
    name: "",
    category: "",
    price: 0,
    quantity: 0,
    unit: "kg",
    supplier: "",
    minStock: 0,
  });

  // ✅ Danh mục topping (giống Inventory)
  const categories = ["Trân châu", "Bánh", "Thạch", "Kem", "Sữa", "Khác", "Topping"];
  const units = ["kg", "g", "hộp", "chai", "gói",];

  // =====================
  // 🔹 Lấy danh sách topping
  // =====================
  const fetchToppings = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch("http://localhost:3000/api/admin/toppings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const normalized = (data.data || []).map((t: any) => ({
        id: t.Id,
        name: t.Name,
        category: t.Category ?? "Khác",
        price: Number(t.Price ?? 0),
        quantity: Number(t.Quantity ?? 0),
        unit: t.Unit ?? "kg",
        supplier: t.Supplier ?? "Không rõ",
        minStock: Number(t.MinStock ?? 0),
        lastUpdated: t.LastUpdated ?? new Date().toISOString().split("T")[0],
      }));

      setToppings(normalized);
    } catch (err) {
      toast.error("Không thể tải danh sách topping");
    }
  };

  useEffect(() => {
    fetchToppings();
  }, []);

  // =====================
  // 🔹 Thêm topping
  // =====================
  const handleAddTopping = async () => {
    const { name, category, price, quantity, unit, supplier, minStock } = newTopping;
    if (!name || !price || !category || !supplier)
      return toast.error("Vui lòng nhập đầy đủ thông tin");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch("http://localhost:3000/api/admin/toppings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          price,
          quantity,
          unit,
          supplier,
          minStock,
        }),
      });

      if (!res.ok) throw new Error("Không thể thêm topping");
      toast.success("✅ Đã thêm topping mới");
      fetchToppings();
      setIsDialogOpen(false);
      setNewTopping({
        name: "",
        category: "",
        price: 0,
        quantity: 0,
        unit: "kg",
        supplier: "",
        minStock: 0,
      });
    } catch {
      toast.error("Không thể thêm topping");
    }
  };

  // =====================
  // 🔹 Xóa topping
  // =====================
  const handleDeleteTopping = async (id: number) => {
    if (!window.confirm("Xóa topping này?")) return;
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch(`http://localhost:3000/api/admin/toppings/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error();
      toast.success("Đã xóa topping");
      fetchToppings();
    } catch {
      toast.error("Không thể xóa topping");
    }
  };

  // =====================
  // 🔹 Thống kê
  // =====================
  const getLowStockCount = () =>
    toppings.filter((t) => t.quantity <= t.minStock).length;

  const getTotalValue = () =>
    toppings.reduce((sum, t) => sum + t.quantity * t.price, 0);

  const filteredToppings = toppings.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // =====================
  // 🔹 JSX
  // =====================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Topping</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý danh sách topping và tồn kho (giống cấu trúc kho nguyên liệu)
        </p>
      </div>

      {/* 🔸 Thống kê giống Inventory */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng topping</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{toppings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo hết hàng</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {getLowStockCount()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị topping</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalValue().toLocaleString("vi-VN")}₫
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔸 Danh sách + Nút thêm */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Topping</CardTitle>
          <CardDescription>Quản lý tất cả topping trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm topping..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-4 w-4" /> Thêm topping
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm topping mới</DialogTitle>
                  <DialogDescription>Nhập thông tin topping</DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên topping *</Label>
                      <Input
                        value={newTopping.name}
                        onChange={(e) =>
                          setNewTopping({ ...newTopping, name: e.target.value })
                        }
                        placeholder="VD: Trân châu đen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Danh mục *</Label>
                      <Select
                        value={newTopping.category}
                        onValueChange={(value) =>
                          setNewTopping({ ...newTopping, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={newTopping.quantity}
                        onChange={(e) =>
                          setNewTopping({
                            ...newTopping,
                            quantity: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Đơn vị</Label>
                      <Select
                        value={newTopping.unit}
                        onValueChange={(v) =>
                          setNewTopping({ ...newTopping, unit: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn đơn vị" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tồn kho tối thiểu</Label>
                      <Input
                        type="number"
                        value={newTopping.minStock}
                        onChange={(e) =>
                          setNewTopping({
                            ...newTopping,
                            minStock: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Giá (₫ / đơn vị)</Label>
                      <Input
                        type="number"
                        value={newTopping.price}
                        onChange={(e) =>
                          setNewTopping({
                            ...newTopping,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhà cung cấp *</Label>
                      <Input
                        value={newTopping.supplier}
                        onChange={(e) =>
                          setNewTopping({ ...newTopping, supplier: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddTopping}>Thêm topping</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* 🔸 Bảng hiển thị */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên topping</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Giá (₫)</TableHead>
                  <TableHead>Số lượng</TableHead>
                  <TableHead>Đơn vị</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredToppings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không có topping nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredToppings.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.category}</Badge>
                      </TableCell>
                      <TableCell>{t.price.toLocaleString("vi-VN")}₫</TableCell>
                      <TableCell>{t.quantity}</TableCell>
                      <TableCell>{t.unit}</TableCell>
                      <TableCell>{t.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {t.lastUpdated}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTopping(t.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
