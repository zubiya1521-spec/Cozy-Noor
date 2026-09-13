import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(
      localStorage.getItem("cozyNoorUser")
    );
  });

  const handleSearch = (e) => {
    e.preventDefault();

    const query = search.trim();

    if (!query) {
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(query)}`
    );

    setSearch("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("cozyNoorUser");

    setUser(null);

    navigate("/");
  };

  return (
    <header className="navbar">

      {/* LOGO */}
      <Link to="/" className="navbar-logo">
        <span>Cozy Noor</span>
        <small>Handmade Crochet</small>
      </Link>

      {/* NAVIGATION */}
      <nav className="navbar-links">
        <Link to="/">Home</Link>

        <Link to="/shop">Shop</Link>

        <Link to="/categories">
          Categories
        </Link>

        <Link to="/custom-order">
          Custom Order
        </Link>

        <Link to="/about">
          About
        </Link>

        <Link to="/contact">
          Contact
        </Link>

        <Link to="/my-order">
          My Orders
        </Link>
      </nav>

      {/* RIGHT SIDE */}
      <div className="navbar-actions">

        {/* SEARCH */}
        <button
          type="button"
          className="nav-icon search-button"
          aria-label="Search"
          onClick={() =>
            setSearchOpen((prev) => !prev)
          }
        >
          ⌕
        </button>

        {/* CART */}
        <Link
          to="/cart"
          className="nav-icon"
          aria-label="Cart"
        >
          ♡
        </Link>

        {/* USER / LOGIN */}
        {user ? (
          <>
            <span className="nav-user">
              Hi, {user.name}
            </span>

            <button
              type="button"
              className="nav-logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="nav-login"
          >
            Login
          </Link>
        )}

      </div>

      {/* SEARCH BOX */}
      {searchOpen && (
        <form
          className="navbar-search"
          onSubmit={handleSearch}
        >
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search crochet products..."
            autoFocus
          />

          <button type="submit">
            Search
          </button>
        </form>
      )}

    </header>
  );
}

export default Navbar;