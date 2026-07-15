import { Link, Outlet } from "react-router-dom";
import style from "./AdminLayout.module.css";
function AdminLayout() {
  return (
    <section className={style.adminLayout}>
      <div className={style.adminSidebar}>
        <h1>Admin Sidebar</h1>
        <div className={style.adminLinks}>
          <Link to="#">Products</Link>
          <Link to="#">Orders</Link>
          <Link to="#">Category</Link>
        </div>
      </div>
      <Outlet />
    </section>
  );
}

export default AdminLayout;
