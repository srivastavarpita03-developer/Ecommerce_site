import { Link, useNavigate } from "react-router-dom";
import { FaSearch, FaUserCircle, FaUserShield } from "react-icons/fa";
import "./Header.css";
import { useUser } from "../context/UserContext";

function Header() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  async function handleLogout() {
    const isSuccess = await logout();
    if (isSuccess) {
      alert("Logout Successfully");
      navigate("/login")
    }
  }
  return (
    <header>
      {/* Left Side */}
      <div className="header-left">
        <h1 className="header-logo">Elite Attire</h1>

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

      {/* Right Side */}
      <div className="header-right">
        <div className="search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search elite collections..." />
        </div>

        {!user ? (
          <button className="login-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        ) : (
          <>
            {user.role === "admin" ? (
              <button className="admin-btn" onClick={() => navigate("/admin")}>
                <FaUserShield />
                <span>Admin Panel</span>
              </button>
            ) : (
              <div className="profile-box" onClick={() => navigate("/profile")}>
                {user.profilePic ? (
                  <img
                    src={user.profilePic}
                    alt="profile"
                    className="profile-img"
                  />
                ) : (
                  <FaUserCircle className="profile-icon" />
                )}
              </div>
            )}

            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
