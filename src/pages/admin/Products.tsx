import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 🧩 Interface
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  stock: number;
  categoryName?: string; // ✅ thêm dòng này
}


export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);


  // ✳️ State cho form thêm sản phẩm
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryName: "", // ✅ thêm dòng này thay vì "category"
    price: "",
    stock: "",
    description: "",
    image: "",
  });

  // 💡 State cho form thêm danh mục
  const [newCategory, setNewCategory] = useState("");

  // 🧩 State và hàm quản lý công thức pha chế
  const [recipe, setRecipe] = useState([
    { ingredientId: "", quantity: "", unit: "" },
  ]);

  const addIngredientRow = () => {
    setRecipe([...recipe, { ingredientId: "", quantity: "", unit: "" }]);
  };

  const removeIngredientRow = (index: number) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, key: string, value: any) => {
    const updated = [...recipe];
    updated[index][key] = value;
    setRecipe(updated);
  };

  const [ingredients, setIngredients] = useState<any[]>([]);

  // ✅ Lấy danh sách nguyên liệu từ API Inventory
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const res = await fetch("http://localhost:3000/api/admin/inventory", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.ok) setIngredients(data.data);
      } catch (err) {
        console.error("❌ Lỗi tải danh sách nguyên liệu:", err);
      }
    };
    fetchIngredients();
  }, []);

  // ✅ Hàm thêm danh mục mới
  const handleAddCategory = async () => {
    if (!newCategory.trim()) return toast.error("Vui lòng nhập tên danh mục");

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch("http://localhost:3000/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Name: newCategory }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Đã thêm danh mục thành công");
        setNewCategory("");
        fetchCategories(); // 🔄 reload danh mục
      } else {
        toast.error(data.error || "Không thể thêm danh mục");
      }
    } catch (err) {
      console.error("❌ Lỗi thêm danh mục:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa danh mục "${name}" không?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch(`http://localhost:3000/api/admin/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Đã xóa danh mục "${name}"`);
        fetchCategories(); // 🔄 tải lại danh sách
      } else {
        toast.error(data.error || "Không thể xóa danh mục");
      }
    } catch (err) {
      console.error("🔥 Lỗi khi xóa danh mục:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };


  // ✅ Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Chưa đăng nhập hoặc token không tồn tại");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Phiên đăng nhập hết hạn hoặc không có quyền truy cập");
        setLoading(false);
        return;
      }

      const json = await res.json();
      setProducts(json.data || json.recordset || []);
    } catch (err) {
      console.error("❌ fetchProducts error:", err);
      toast.error("Lỗi khi kết nối server");
    } finally {
      setLoading(false);
    }
  };
  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch(`http://localhost:3000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Đã xóa sản phẩm "${name}"`);
        fetchProducts(); // 🔄 tải lại danh sách
      } else {
        toast.error(data.error || "Không thể xóa sản phẩm");
      }
    } catch (err) {
      console.error("🔥 Lỗi khi xóa sản phẩm:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };

  // ✅ Lấy danh sách danh mục từ BE
  // ✅ Lấy danh mục từ backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Chưa đăng nhập hoặc token không tồn tại");
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Không thể tải danh mục");
        return;
      }

      const json = await res.json();
      console.log("📦 Categories:", json);

      // ✅ Backend trả về mảng thuần, không bọc trong { data: ... }
      setCategories(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      console.error("❌ fetchCategories error:", err);
      toast.error("Lỗi khi tải danh mục");
    }
  };


  // Gọi cả 2 API song song khi mở trang
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  // ✅ Thêm sản phẩm
  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      if (!newProduct.name || !newProduct.price) {
        toast.error("Vui lòng nhập tên và giá sản phẩm");
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: newProduct.name,
          Description: newProduct.description,
          Price: parseFloat(newProduct.price),
          ImageUrl: newProduct.image || "",
          Stock: parseInt(newProduct.stock || "0"),
          CategoryName: newProduct.categoryName || "Chưa phân loại",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Đã thêm sản phẩm thành công");
        setNewProduct({
          name: "",
          categoryName: "", // ✅ đổi từ category → categoryName
          price: "",
          stock: "",
          description: "",
          image: "",
        });

        fetchProducts();

      } else {
        toast.error(data.error || "Không thể thêm sản phẩm");
      }
    } catch (err) {
      console.error("❌ Lỗi thêm sản phẩm:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };
  // 🧩 Mở dialog chỉnh sửa
  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  // 🧩 Hàm cập nhật sản phẩm
  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch(`http://localhost:3000/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: editingProduct.name,
          Description: editingProduct.description,
          Price: editingProduct.price,
          Stock: editingProduct.stock,
          ImageUrl: editingProduct.image,
          CategoryName: editingProduct.categoryName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Đã cập nhật sản phẩm");
        setIsEditDialogOpen(false);
        fetchProducts();
      } else {
        toast.error(data.error || "Không thể cập nhật sản phẩm");
      }
    } catch (err) {
      console.error("🔥 Lỗi khi cập nhật sản phẩm:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10 text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground">Thêm, sửa, xóa sản phẩm trong menu</p>
        </div>

        <div className="flex gap-3">
          {/* 🔹 Nút thêm danh mục */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Plus className="w-4 h-4 mr-2" />
                Thêm danh mục
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Thêm danh mục mới</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Tên danh mục</Label>
                  <Input
                    id="categoryName"
                    placeholder="Nhập tên danh mục..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary-glow"
                  onClick={handleAddCategory}
                >
                  Thêm danh mục
                </Button>
                <div className="pt-4 border-t">
                  <Label className="text-sm text-muted-foreground">Danh mục hiện có:</Label>
                  <ul className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                    {categories.map((cat) => (
                      <li key={cat.id} className="flex justify-between items-center">
                        <span>{cat.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        >
                          Xóa
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* 🔹 Nút thêm sản phẩm */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-glow text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Thêm sản phẩm
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm sản phẩm mới</DialogTitle>
                <DialogDescription>Nhập thông tin sản phẩm và công thức pha chế</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {/* --- Thông tin cơ bản --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm</Label>
                    <Input
                      id="name"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      placeholder="Trà sữa matcha..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <select
                      id="category"
                      value={newProduct.categoryName}
                      onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-2 text-sm"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Giá (₫)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="75000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Tồn kho</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      placeholder="100"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Mô tả sản phẩm..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Hình ảnh URL</Label>
                  <Input
                    id="image"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                {/* --- CÔNG THỨC PHA CHẾ --- */}
                <div className="space-y-4 border-t pt-4">
                  <Label className="text-base font-semibold">Công thức pha chế</Label>

                  {/* Danh mục áp dụng */}
                  <div className="space-y-2">
                    <Label>Danh mục áp dụng</Label>
                    <select
                      value={newProduct.categoryName}
                      onChange={(e) => setNewProduct({ ...newProduct, categoryName: e.target.value })}
                      className="w-full rounded-md border border-input bg-background p-3 text-sm"
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Header */}
                  <div className="grid grid-cols-4 gap-4 font-semibold text-sm text-muted-foreground px-1">
                    <span>Nguyên liệu</span>
                    <span>Số lượng</span>
                    <span>Đơn vị</span>
                    <span></span>
                  </div>

                  {/* Danh sách nguyên liệu */}
                  {recipe.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[2fr_1fr_1fr_50px] gap-4 items-center"
                    >
                      {/* Nguyên liệu */}
                      <select
                        className="w-full border border-input rounded-md p-3 text-sm"
                        value={row.ingredientId}
                        onChange={(e) => updateIngredient(index, "ingredientId", e.target.value)}
                      >
                        <option value="">-- Chọn nguyên liệu --</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name}
                          </option>
                        ))}
                      </select>

                      {/* Số lượng */}
                      <Input
                        type="number"
                        value={row.quantity}
                        onChange={(e) => updateIngredient(index, "quantity", e.target.value)}
                        placeholder="50"
                        className="p-3 w-full"
                      />

                      {/* Đơn vị */}
                      <select
                        className="w-full border border-input rounded-md p-3 text-sm"
                        value={row.unit}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                      >
                        <option value="">Chọn</option>
                        <option value="g">gram</option>
                        <option value="ml">ml</option>
                        <option value="kg">kg</option>
                        <option value="lít">lít</option>
                      </select>

                      {/* Nút xóa */}
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeIngredientRow(index)}
                          className="hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {/* Thêm dòng mới */}
                  <Button
                    variant="outline"
                    className="mt-3 w-full text-sm py-3"
                    onClick={addIngredientRow}
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm nguyên liệu
                  </Button>
                </div>
                {/* --- Nút thêm sản phẩm --- */}
                <div className="pt-4">
                  <Button onClick={handleAddProduct} className="w-full bg-primary hover:bg-primary-glow">
                    Thêm sản phẩm
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <img
                src={product.image || "https://via.placeholder.com/80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Danh mục: {product.categoryName || "Chưa phân loại"}
                </p>

              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {product.price.toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-muted-foreground">Kho: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openEditDialog(product)}
                >
                  <Edit className="w-4 h-4 mr-1" /> Sửa
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(product.id, product.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>
            </div>
          </Card>
        ))}
      </div>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tên sản phẩm</Label>
                  <Input
                    value={editingProduct.name}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Danh mục</Label>
                  <select
                    value={editingProduct.categoryName || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryName: e.target.value,
                      })
                    }
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giá (₫)</Label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tồn kho</Label>
                  <Input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value, 10),
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mô tả</Label>
                <Textarea
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Hình ảnh URL</Label>
                <Input
                  value={editingProduct.image}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, image: e.target.value })
                  }
                />
              </div>

              <Button
                onClick={handleUpdateProduct}
                className="w-full bg-primary hover:bg-primary-glow"
              >
                Lưu thay đổi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div >
  );
}
