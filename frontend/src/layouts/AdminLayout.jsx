import { Link, Outlet } from "react-router-dom";
import style from "./AdminLayout.module.css";

function AdminLayout() {
  return (
    <section className={style.adminLayout}>

      {/* ==============================
          ADMIN SIDEBAR
      ============================== */}

      <div className={style.adminSidebar}>

        <h1>Admin Sidebar</h1>

        <div className={style.adminLinks}>

          {/* DASHBOARD */}
          <Link
            to="/admin/dashboard"
            className={style.dashboardLink}
          >
            📊 Dashboard
          </Link>

          {/* PRODUCTS */}
          <Link to="/admin/products">
            🛍️ Products
          </Link>

          {/* ORDERS */}
          <Link to="/admin/orders">
            📦 Orders
          </Link>

          {/* CATEGORY */}
          <Link to="/admin/category">
            🏷️ Category
          </Link>

        </div>

      </div>

      {/* ==============================
          PAGE CONTENT
      ============================== */}

      <Outlet />

    </section>
  );
}

export default AdminLayout;