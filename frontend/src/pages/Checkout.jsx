import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const API_URL = "https://cozy-noor-1.onrender.com/api";

function getUserData() {
  const stored = localStorage.getItem("cozyNoorUser");

  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

function getUserToken() {
  const user = getUserData();

  if (!user) return "";

  return user?.token || "";
}

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [offerCode, setOfferCode] = useState("");
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [applyingOffer, setApplyingOffer] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "Pune",
    pincode: "",
  });

  useEffect(() => {
    const buyNowProduct = location.state?.buyNowProduct;

    if (buyNowProduct) {
      setCart([buyNowProduct]);
    } else {
      const savedCart =
        JSON.parse(localStorage.getItem("cozyNoorCart")) || [];

      setCart(savedCart);
    }
  }, [location.state]);

  useEffect(() => {
    const user = getUserData();

    if (user) {
      setForm((previous) => ({
        ...previous,
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const discountedSubtotal = subtotal - discount;

  // Delivery is decided by admin after order placement.
  const deliveryCharge = 0;

  const total = discountedSubtotal + deliveryCharge;

  // =====================================================
  // APPLY OFFER
  // =====================================================

  const handleApplyOffer = async () => {
    if (!offerCode.trim()) {
      alert("Please enter an offer code.");
      return;
    }

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    setApplyingOffer(true);

    try {
      const response = await fetch(
        `${API_URL}/offers/calculate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: offerCode.trim(),
            subtotal,
            items: cart.map((item) => ({
              productId: item._id || item.id,
              productName: item.name,
              category: item.category || "",
              quantity: Number(item.quantity || 1),
              price: Number(item.price || 0),
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Invalid offer code"
        );
      }

      setAppliedOffer(data.offer);
      setDiscount(Number(data.discount || 0));

      alert(
        `${data.offer.name} applied successfully! 🎉`
      );
    } catch (error) {
      console.error("Apply offer error:", error);

      setAppliedOffer(null);
      setDiscount(0);

      alert(
        error.message ||
          "Failed to apply offer."
      );
    } finally {
      setApplyingOffer(false);
    }
  };

  // =====================================================
  // REMOVE OFFER
  // =====================================================

  const handleRemoveOffer = () => {
    setOfferCode("");
    setAppliedOffer(null);
    setDiscount(0);
  };

  // =====================================================
  // PLACE ORDER
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const loggedInUser = getUserData();
    const token = getUserToken();

    if (!loggedInUser?.id || !token) {
      alert(
        "Your login session has expired. Please login again."
      );

      localStorage.removeItem("cozyNoorUser");
      navigate("/login");
      return;
    }

    setPlacingOrder(true);

    try {
      const orderData = {
        userId: loggedInUser.id,

        customerName: form.fullName.trim(),

        email:
          form.email.trim() ||
          loggedInUser.email,

        phone: form.phone.trim(),

        address: `${form.address.trim()}, ${form.city.trim()} - ${form.pincode.trim()}`,

        items: cart.map((item) => ({
          productId:
            item._id || item.id,

          productName: item.name,

          quantity: Number(
            item.quantity || 1
          ),

          price: Number(
            item.price || 0
          ),

          image:
            item.image ||
            item.images?.[0] ||
            "",

          category:
            item.category || "",
        })),

        offerCode:
          appliedOffer?.code ||
          offerCode.trim() ||
          "",

        offerName:
          appliedOffer?.name || "",

        discountAmount:
          Number(discount || 0),

        discountedSubtotal:
          Number(discountedSubtotal || 0),

        deliveryCharge: 0,

        paymentMethod:
          paymentMethod === "cod"
            ? "COD"
            : "Online",

        paymentStatus: "Pending",

        orderStatus: "Pending",
      };

      console.log(
        "ORDER DATA 🚀",
        orderData
      );

      const response = await fetch(
        `${API_URL}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",

            // ⭐ CUSTOMER JWT
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(
            orderData
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            "Order failed"
        );
      }

      // Normal cart checkout clears cart.
      // Buy Now does NOT clear existing cart.
      if (
        !location.state?.buyNowProduct
      ) {
        localStorage.removeItem(
          "cozyNoorCart"
        );
      }

      alert(
        "Order placed successfully! 🎉"
      );

      navigate(
        `/order/${data._id}`
      );
    } catch (error) {
      console.error(
        "ORDER ERROR ❌:",
        error
      );

      alert(
        "Order place nahi hua.\n\n" +
          (error.message ||
            "Please check backend server.")
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // =====================================================
  // EMPTY CHECKOUT
  // =====================================================

  if (cart.length === 0) {
    return (
      <main className="checkout-page">
        <section className="checkout-empty">
          <div className="checkout-empty-icon">
            🛍️
          </div>

          <h1>Your cart is empty</h1>

          <p>
            Add some beautiful handmade
            crochet products before
            checkout.
          </p>

          <Link
            to="/shop"
            className="checkout-shop-button"
          >
            Continue Shopping
          </Link>
        </section>
      </main>
    );
  }

  // =====================================================
  // CHECKOUT UI
  // =====================================================

  return (
    <main className="checkout-page">
      <section className="checkout-hero">
        <p>ALMOST YOURS</p>

        <h1>Checkout</h1>

        <span>
          Complete your details to place
          your order.
        </span>
      </section>

      <section className="checkout-main">

        {/* ================= FORM ================= */}

        <form
          className="checkout-form"
          onSubmit={handleSubmit}
        >
          <div className="checkout-section">
            <h2>
              01. Delivery Details
            </h2>

            <div className="checkout-grid">

              <div className="checkout-field">
                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>
                  Mobile / WhatsApp Number *
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div className="checkout-field full-width">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="checkout-field full-width">
                <label>
                  Full Address *
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="House/Flat No., Building, Street, Area"
                  rows="4"
                  required
                />
              </div>

              <div className="checkout-field">
                <label>
                  City *
                </label>

                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="checkout-field">
                <label>
                  Pincode *
                </label>

                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="Enter pincode"
                  required
                />
              </div>

            </div>
          </div>

          {/* ================= PAYMENT ================= */}

          <div className="checkout-section">
            <h2>
              02. Payment Method
            </h2>

            <div className="payment-options">

              <label
                className={`payment-option ${
                  paymentMethod === "cod"
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod === "cod"
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                />

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <span>
                    Delivery charges
                    applicable
                  </span>
                </div>
              </label>

            </div>
          </div>

          {/* ================= HANDMADE NOTICE ================= */}

          <div className="checkout-notice">
            <strong>
              🧶 Handmade with care
            </strong>

            <p>
              Every Cozy Noor order is
              handmade especially for
              you. Please allow{" "}
              <strong>
                10–15 days
              </strong>{" "}
              for making before dispatch.
            </p>
          </div>

          <button
            type="submit"
            className="place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Order..."
              : `Place Order · ₹${total.toLocaleString(
                  "en-IN"
                )}`}
          </button>
        </form>

        {/* ================= ORDER SUMMARY ================= */}

        <aside className="checkout-summary">
          <h2>
            Your Order
          </h2>

          <div className="checkout-products">

            {cart.map((item) => (
              <div
                className="checkout-product"
                key={
                  item._id ||
                  item.id
                }
              >
                <div className="checkout-product-image">

                  {item.image ||
                  item.images?.[0] ? (
                    <img
                      src={
                        item.image ||
                        item.images?.[0]
                      }
                      alt={item.name}
                    />
                  ) : (
                    <span>
                      🌷
                    </span>
                  )}

                </div>

                <div className="checkout-product-info">
                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Qty:{" "}
                    {item.quantity}

                    {item.colour &&
                      ` · ${item.colour}`}
                  </p>
                </div>

                <strong>
                  ₹
                  {(
                    Number(
                      item.price || 0
                    ) *
                    Number(
                      item.quantity ||
                        1
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            ))}

          </div>

          {/* ================= OFFER ================= */}

          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop:
                "1px solid var(--line, #e7dcd6)",
            }}
          >
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "12px",
                fontWeight: "700",
                color:
                  "var(--ink, #403635)",
              }}
            >
              HAVE AN OFFER CODE?
            </label>

            {!appliedOffer ? (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <input
                  type="text"
                  value={offerCode}
                  onChange={(e) =>
                    setOfferCode(
                      e.target.value
                    )
                  }
                  placeholder="Enter code"
                  style={{
                    flex: 1,
                    minWidth: 0,
                    padding:
                      "10px 12px",
                    border:
                      "1px solid var(--line, #e7dcd6)",
                    borderRadius:
                      "8px",
                    outline: "none",
                  }}
                />

                <button
                  type="button"
                  onClick={
                    handleApplyOffer
                  }
                  disabled={
                    applyingOffer
                  }
                  style={{
                    padding:
                      "10px 14px",
                    border: "none",
                    borderRadius:
                      "8px",
                    background:
                      "var(--rose, #c98d94)",
                    color: "#fff",
                    fontWeight: "700",
                    cursor:
                      applyingOffer
                        ? "default"
                        : "pointer",
                  }}
                >
                  {applyingOffer
                    ? "Applying..."
                    : "Apply"}
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "space-between",
                  gap: "10px",
                  padding:
                    "10px 12px",
                  background:
                    "var(--rose-soft, #f2dfe0)",
                  borderRadius:
                    "8px",
                }}
              >
                <div>
                  <strong
                    style={{
                      display:
                        "block",
                      color:
                        "var(--rose-dark, #8c5d65)",
                    }}
                  >
                    {appliedOffer.name}
                  </strong>

                  <span
                    style={{
                      fontSize:
                        "12px",
                      color:
                        "var(--muted, #776b68)",
                    }}
                  >
                    Code:{" "}
                    {appliedOffer.code}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={
                    handleRemoveOffer
                  }
                  style={{
                    border: "none",
                    background:
                      "transparent",
                    color:
                      "var(--rose-dark, #8c5d65)",
                    fontWeight: "700",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* ================= PRICE BREAKUP ================= */}

          <div className="checkout-price-row">
            <span>
              Product Amount
            </span>

            <span>
              ₹
              {subtotal.toLocaleString(
                "en-IN"
              )}
            </span>
          </div>

          {discount > 0 && (
            <div
              className="checkout-price-row"
              style={{
                color:
                  "var(--rose-dark, #8c5d65)",
              }}
            >
              <span>
                Discount
              </span>

              <span>
                − ₹
                {discount.toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          )}

          <div className="checkout-price-row">
            <span>
              Delivery Charges
            </span>

            <span>
              To be decided
            </span>
          </div>

          <div className="checkout-total">
            <span>
              Product Total
            </span>

            <strong>
              ₹
              {total.toLocaleString(
                "en-IN"
              )}
            </strong>
          </div>

          <Link
            to="/cart"
            className="back-to-cart"
          >
            ← Edit Cart
          </Link>

        </aside>
      </section>
    </main>
  );
}

export default Checkout;
