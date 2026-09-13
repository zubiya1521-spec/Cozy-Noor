import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Cart() {
  const [cart, setCart] = useState([]);

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cozyNoorCart")) || [];

    setCart(savedCart);
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = (id, change) => {
    const updatedCart = cart.map((item) => {
      if (item.id !== id) {
        return item;
      }

      const newQuantity = Math.max(
        1,
        item.quantity + change
      );

      // Don't allow quantity above available stock
      if (
        change > 0 &&
        item.stock &&
        newQuantity > item.stock
      ) {
        return item;
      }

      return {
        ...item,
        quantity: newQuantity,
      };
    });

    setCart(updatedCart);

    localStorage.setItem(
      "cozyNoorCart",
      JSON.stringify(updatedCart)
    );
  };

  // REMOVE ITEM
  const removeItem = (id) => {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    setCart(updatedCart);

    localStorage.setItem(
      "cozyNoorCart",
      JSON.stringify(updatedCart)
    );
  };

  // SUBTOTAL
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  // DELIVERY
  const deliveryCharge = subtotal > 0 ? 50 : 0;

  // TOTAL
  const total = subtotal + deliveryCharge;

  return (
    <main className="cart-page">

      {/* HERO */}

      <section className="cart-hero">

        <p className="cart-eyebrow">
          YOUR LITTLE COLLECTION
        </p>

        <h1>Your Cart</h1>

        <p>
          Review your handmade crochet pieces before
          placing your order.
        </p>

      </section>

      {/* EMPTY CART */}

      {cart.length === 0 ? (

        <section className="cart-empty">

          <div className="cart-empty-icon">
            🧶
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Looks like you haven't added anything yet.
            Explore our handmade collection and find
            something you love.
          </p>

          <Link
            to="/shop"
            className="cart-shop-button"
          >
            Continue Shopping
          </Link>

        </section>

      ) : (

        /* CART */

        <section className="cart-main">

          {/* ITEMS */}

          <div className="cart-items">

            <div className="cart-items-heading">

              <h2>Your Items</h2>

              <span>
                {cart.length}{" "}
                {cart.length === 1
                  ? "item"
                  : "items"}
              </span>

            </div>

            {cart.map((item) => (

              <article
                className="cart-item"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="cart-item-image">

                  {item.image ? (

                    <img
                      src={item.image}
                      alt={item.name}
                    />

                  ) : (

                    <span>🌷</span>

                  )}

                </div>

                {/* INFO */}

                <div className="cart-item-info">

                  <h3>
                    {item.name}
                  </h3>

                  {item.colour && (
                    <p>
                      <strong>Colour:</strong>{" "}
                      {item.colour}
                    </p>
                  )}

                  {item.size && (
                    <p>
                      <strong>Size:</strong>{" "}
                      {item.size}
                    </p>
                  )}

                  {item.customisation && (
                    <p>
                      <strong>
                        Customisation:
                      </strong>{" "}
                      {item.customisation}
                    </p>
                  )}

                  <p className="cart-item-price">
                    ₹
                    {Number(
                      item.price || 0
                    ).toLocaleString("en-IN")}
                  </p>

                </div>

                {/* ACTIONS */}

                <div className="cart-item-actions">

                  <div className="quantity-control">

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                      disabled={
                        item.stock &&
                        item.quantity >=
                          item.stock
                      }
                      aria-label="Increase quantity"
                    >
                      +
                    </button>

                  </div>

                  <button
                    className="remove-item"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    Remove
                  </button>

                </div>

                {/* ITEM TOTAL */}

                <div className="cart-item-total">

                  ₹
                  {(
                    Number(item.price || 0) *
                    Number(item.quantity || 1)
                  ).toLocaleString("en-IN")}

                </div>

              </article>

            ))}

            <Link
              to="/shop"
              className="continue-shopping"
            >
              ← Continue Shopping
            </Link>

          </div>

          {/* SUMMARY */}

          <aside className="cart-summary">

            <h2>
              Order Summary
            </h2>

            <div className="summary-row">

              <span>Subtotal</span>

              <span>
                ₹
                {subtotal.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            <div className="summary-row">

              <span>Delivery</span>

              <span>
                ₹
                {deliveryCharge.toLocaleString(
                  "en-IN"
                )}
              </span>

            </div>

            <div className="summary-note">

              Handmade orders usually take{" "}
              <strong>
                10–15 days
              </strong>{" "}
              to prepare before dispatch.

            </div>

            <div className="summary-total">

              <span>Total</span>

              <strong>
                ₹
                {total.toLocaleString(
                  "en-IN"
                )}
              </strong>

            </div>

            <Link
              to="/checkout"
              className="checkout-button"
            >
              Proceed to Checkout
            </Link>

          </aside>

        </section>

      )}

    </main>
  );
}

export default Cart;