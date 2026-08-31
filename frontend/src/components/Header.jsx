
import { Link, useNavigate } from "react-router-dom";

import {
  FaSearch,
  FaUserCircle,
  FaUserShield,
  FaShoppingCart,
  FaBoxOpen,
} from "react-icons/fa";

import "./Header.css";
import { useUser } from "../context/UserContext";
import { useState } from "react";
import api from "../utils/api";

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [userQuery, setUserQuery] = useState("");
  // ======================================
  // LOGOUT
  // ======================================

  async function handleLogout() {
    try {
      const isSuccess = await logout();

      if (isSuccess) {
        alert("Logout Successfully");

        navigate("/login", {
          replace: true,
        });
      } else {
        alert("Logout Failed");
      }
    } catch (error) {
      console.log("Header Logout Error:", error);
      alert("Logout Failed");
    }
  }

  async function handleSearch() {
    const respose = await api.post("/ai/search-ai", {
      userQuery: userQuery
    });

    console.log(respose.data)
  }

  return (
    <header>
      {/* ======================================
          LEFT SIDE
      ====================================== */}

      <div className="header-left">
        {/* LOGO */}

        <h1
          className="header-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
        VestiQ Nexus
        </h1>

        {/* NAVIGATION */}

        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/products">Products</Link>
            </li>

            <li>
              <Link to="/about">About US</Link>
            </li>

            <li>
              <Link to="/contact">Contact US</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* ======================================
          RIGHT SIDE
      ====================================== */}

      <div className="header-right">
        {/* SEARCH */}

        <div className="search">
          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search elite collections..."
            value={userQuery}
            onChange={(e) => { setUserQuery(e.target.value) }}
          />

          <button onClick={handleSearch}>Search</button>
        </div>

        {/* CART */}

       {/* CART - ONLY LOGGED IN USERS */}

{user && (
  <button
    type="button"
    className="cart-btn"
    onClick={() => navigate("/cart")}
  >
    <FaShoppingCart />
    <span>Cart</span>
  </button>
)}

        {/* USER NOT LOGGED IN */}

        {!user ? (
          <button
            type="button"
            className="login-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        ) : (
          <>
            {/* ADMIN OR USER PROFILE */}

            {user.role === "admin" ? (
              <button
                type="button"
                className="admin-btn"
                onClick={() => navigate("/admin")}
              >
                <FaUserShield />

                <span>Admin Panel</span>
              </button>
            ) : (
              <button
                type="button"
                className="profile-btn"
                onClick={() => navigate("/profile")}
              >
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="Profile"
                    className="profile-img"
                  />
                ) : (
                  <FaUserCircle className="profile-icon" />
                )}

                <span>Profile</span>
              </button>
            )}

            {/* MY ORDERS */}

            {user.role !== "admin" && (
              <button
                type="button"
                className="orders-btn"
                onClick={() => navigate("/orders")}
              >
                <FaBoxOpen />

                <span>Orders</span>
              </button>
            )}

            {/* LOGOUT */}

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

