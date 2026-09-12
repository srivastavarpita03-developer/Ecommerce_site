import { Link, Outlet, useLocation } from "react-router-dom";
import { HiOutlineSquares2X2, HiOutlineShoppingBag, HiOutlineClipboardDocumentList, HiOutlineTag, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { BiSolidStore } from "react-icons/bi";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useState } from "react";
import style from "./AdminLayout.module.css";

const navLinks = [
  { to: "/admin/dashboard", label: "Dashboard", icon: HiOutlineSquares2X2 },
  { to: "/admin/products", label: "Products", icon: HiOutlineShoppingBag },
  { to: "/admin/orders", label: "Orders", icon: HiOutlineClipboardDocumentList },
  { to: "/admin/tickets", label: "Support Tickets", icon: HiOutlineChatBubbleLeftRight },
  { to: "/admin/category", label: "Category", icon: HiOutlineTag },
];

function AdminLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className={`${style.adminLayout} ${collapsed ? style.layoutCollapsed : ""}`}>

      {/* ADMIN SIDEBAR */}
      <aside className={`${style.sidebar} ${collapsed ? style.sidebarCollapsed : ""}`}>

        {/* BRAND */}
        <div className={style.brand}>
          <BiSolidStore className={style.brandIcon} />
          {!collapsed && (
            <div className={style.brandText}>
              <span className={style.brandName}>VestiQ</span>
              <span className={style.brandSub}>Admin Panel</span>
            </div>
          )}
        </div>

        <hr className={style.divider} />

        {/* NAV LINKS */}
        <nav className={style.nav}>
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                data-tooltip={label}
                className={`${style.navLink} ${isActive ? style.navLinkActive : ""}`}
              >
                <Icon className={style.navIcon} />
                {!collapsed && <span>{label}</span>}
                {isActive && <span className={style.activeIndicator} />}
              </Link>
            );
          })}
        </nav>

        {/* SIDEBAR FOOTER */}
        <div className={style.sidebarFooter}>
          <hr className={style.divider} />
          {!collapsed && (
            <Link to="/" className={style.backLink}>
              ← Back to Store
            </Link>
          )}

          {/* COLLAPSE TOGGLE */}
          <button
            className={style.collapseToggle}
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

      </aside>

      {/* PAGE CONTENT */}
      <main className={`${style.adminContent} ${collapsed ? style.adminContentExpanded : ""}`}>
        <Outlet />
      </main>

    </section>
  );
}

export default AdminLayout;
