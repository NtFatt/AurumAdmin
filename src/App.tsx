import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🌐 Trang chính và layout
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdminLayout } from "./components/AdminLayout";

// 🧩 Trang admin
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Inventory from "./pages/admin/Inventory";
import Orders from "./pages/admin/Orders";
import Vouchers from "./pages/admin/Vouchers";
import Settings from "./pages/admin/Settings";
import Login from "./pages/admin/Login";
import Toppings from "./pages/admin/Toppings";
import Customers from "./pages/admin/customers/Customers";

// ⭐ THÊM IMPORT NHÂN VIÊN
import Employees from "./pages/admin/employees/Employees";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* 🌿 Trang người dùng */}
          <Route path="/" element={<Index />} />

          {/* 🔐 Đăng nhập admin */}
          <Route path="/admin/login" element={<Login />} />

          {/* 🧭 Khu vực quản trị */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="toppings" element={<Toppings />} />
            <Route path="orders" element={<Orders />} />
            <Route path="vouchers" element={<Vouchers />} />

            {/* ⭐ ROUTE NHÂN VIÊN */}
            <Route path="employees" element={<Employees />} />
            {/* ⭐ ROUTE KHÁCH HÀNG */}
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* ❌ Trang không tồn tại */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
//hahaha