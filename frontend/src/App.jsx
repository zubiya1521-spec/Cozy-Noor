import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import CustomOrder from "./pages/CustomOrder";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OrderDetails from "./pages/OrderDetails";
import MyOrders from "./pages/MyOrders";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./Admin";

import "./App.css";


/* ================= ADMIN PROTECTION ================= */

function ProtectedAdmin() {
  const admin = localStorage.getItem("cozyNoorAdmin");

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Admin />;
}


/* ================= APP CONTENT ================= */

function AppContent() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <>
      {!isAdminPage && <Navbar />}

      <Routes>

        {/* ================= WEBSITE ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/shop"
          element={<Shop />}
        />

        <Route
          path="/categories"
          element={<Categories />}
        />

        <Route
          path="/category/:category"
          element={<CategoryProducts />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        <Route
          path="/custom-order"
          element={<CustomOrder />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/contact"
          element={<Contact />}
        />

        <Route
          path="/cart"
          element={<Cart />}
        />

        <Route
          path="/checkout"
          element={<Checkout />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ================= MY ORDERS ================= */}

        <Route
          path="/my-order"
          element={<MyOrders />}
        />

        <Route
          path="/my-orders"
          element={<MyOrders />}
        />

        {/* Compatibility with existing Navbar link */}
        <Route
          path="/order/my-order"
          element={<MyOrders />}
        />


        {/* ================= ORDER DETAILS ================= */}

        <Route
          path="/order/:id"
          element={<OrderDetails />}
        />


        {/* ================= ADMIN ================= */}

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route
          path="/admin"
          element={<ProtectedAdmin />}
        />


        {/* ================= FALLBACK ================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </>
  );
}


/* ================= MAIN APP ================= */

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;