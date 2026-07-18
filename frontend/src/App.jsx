import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Header from "./components/Header";
import Login from "./pages/Login";
import Products from "./pages/Products";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminLayout from "./layouts/AdminLayout";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetails from "./pages/admin/AdminOrderDetails";
import AdminCategory from "./pages/admin/AdminCategory";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
function App() {
  const loc = window.location.pathname;
  const isAdminRoute = loc.includes("admin");
  return (
    <BrowserRouter>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products" element={<Products />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/admin" element={<AdminLayout />}>
        <Route path="" element={<Navigate to="/admin/products"/>}/>
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="/admin/orders/:id" element={<AdminOrderDetails />}/>
          <Route path="category" element={<AdminCategory />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
