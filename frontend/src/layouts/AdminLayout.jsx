import { Link, Outlet } from "react-router-dom";
import style from "./AdminLayout.module.css";
function AdminLayout() {
  return (
    <section className={style.adminLayout}>
      <div className={style.adminSidebar}>
        <h1>Admin Sidebar</h1>
        <div className={style.adminLinks}>
          <Link to="/admin/products">Products</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/category">Category</Link>
        </div>
      </div>
      <Outlet />
    </section>
  );
}

export default AdminLayout;
