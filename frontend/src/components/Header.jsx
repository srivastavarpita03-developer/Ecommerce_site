import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import "./Header.css";
function Header() {
  return (
    <header>
      {/* Code for left side of header */}
      <div className="header-left">
        <h1 className="header-logo">Elite Attire</h1>
        <nav>
          <ul>
            <li>
              <Link to="#">Home</Link>
            </li>
            <li>
              <Link to="#">Products</Link>
            </li>
            <li>
              <Link to="#">About US</Link>
            </li>
            <li>
              <Link to="#">Contact US</Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Code for right side of header */}
      <div className="header-right">
        <div className="search">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Search elite collections..." />
        </div>

        <button className="login-btn">Login</button>
      </div>
    </header>
  );
}

export default Header;
