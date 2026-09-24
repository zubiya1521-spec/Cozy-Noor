import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const user = JSON.parse(
    localStorage.getItem("cozyNoorUser")
  );

  const token = user?.token;

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id || !token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://cozy-noor-1.onrender.com/api/orders/user/${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch orders"
          );
        }

        setOrders(data);
      } catch (error) {
        console.error("My Orders error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id, token]);

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
      return;
    }

    if (!token) {
      alert("Please login again.");
      return;
    }

    setCancelling(orderId);

    try {
      const response = await fetch(
        `https://cozy-noor-1.onrender.com/api/orders/${orderId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel order"
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                orderStatus: "Cancelled",
              }
            : order
        )
      );

      alert("Order cancelled successfully.");
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      alert(
        error.message ||
          "Order cancellation failed."
      );
    } finally {
      setCancelling(null);
    }
  };

  if (!user) {
    return (
      <main className="my-orders-page">
        <section className="my-orders-empty">
          <p className="my-orders-eyebrow">
            MY ORDERS
          </p>

          <h1>Please Login</h1>

          <p>
            Login to view your orders and track your
            handmade purchases.
          </p>

          <Link
            to="/login"
            className="my-orders-button"
          >
            Login
          </Link>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="my-orders-page">
        <section className="my-orders-empty">
          <p className="my-orders-eyebrow">
            MY ORDERS
          </p>

          <h1>Please Login Again</h1>

          <p>
            Your login session has expired. Please
            login again to securely access your orders.
          </p>

          <Link
            to="/login"
            className="my-orders-button"
          >
            Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="my-orders-page">
      <section className="my-orders-header">
        <p className="my-orders-eyebrow">
          MY ORDERS
        </p>

        <h1>
          Hello {user.name} ❤️
        </h1>

        <p>
          Here you can view your orders and track
          their delivery status.
        </p>
      </section>

      <section className="my-orders-container">
        {loading ? (
          <div className="my-orders-message">
            Loading your orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="my-orders-message">
            <h2>No orders yet</h2>

            <p>
              You haven't placed any orders yet.
              Start shopping for something handmade
              and special.
            </p>

            <Link
              to="/shop"
              className="my-orders-button"
            >
              Explore Shop
            </Link>
          </div>
        ) : (
          <div className="my-orders-list">
            {orders.map((order) => {
              const calculatedSubtotal =
                order.items?.reduce(
                  (total, item) => {
                    return (
                      total +
                      Number(item.price || 0) *
                        Number(item.quantity || 1)
                    );
                  },
                  0
                ) || 0;

              const subtotal =
                Number(order.subtotal || 0) > 0
                  ? Number(order.subtotal)
                  : calculatedSubtotal;

              const discountAmount = Math.max(
                0,
                Number(order.discountAmount || 0)
              );

              const discountedSubtotal =
                discountAmount > 0
                  ? Math.max(
                      subtotal - discountAmount,
                      0
                    )
                  : subtotal;

              const deliveryCharge = Math.max(
                0,
                Number(order.deliveryCharge || 0)
              );

              const finalTotal =
                discountedSubtotal +
                deliveryCharge;

              return (
                <article
                  className="my-order-card"
                  key={order._id}
                >
                  <div className="my-order-top">
                    <div>
                      <span>Order ID</span>

                      <strong>
                        #
                        {order._id
                          .slice(-8)
                          .toUpperCase()}
                      </strong>
                    </div>

                    <div className="my-order-status">
                      {order.orderStatus}
                    </div>
                  </div>

                  <div className="my-order-date">
                    Ordered on{" "}
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </div>

                  <div className="my-order-products">
                    {order.items.map(
                      (item, index) => (
                        <div
                          className="my-order-product"
                          key={`${order._id}-${index}`}
                        >
                          <div className="my-order-product-image">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={
                                  item.productName
                                }
                              />
                            ) : (
                              <span>🧶</span>
                            )}
                          </div>

                          <div className="my-order-product-info">
                            <h3>
                              {item.productName}
                            </h3>

                            <p>
                              Quantity:{" "}
                              {item.quantity}
                            </p>

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
                        </div>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: "18px",
                      paddingTop: "16px",
                      borderTop:
                        "1px solid var(--line, #e7dcd6)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "7px",
                      }}
                    >
                      <span>
                        Product Amount
                      </span>

                      <strong>
                        ₹
                        {subtotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    {discountAmount > 0 && (
                      <>
                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "7px",
                            color:
                              "var(--rose-dark, #8c5d65)",
                          }}
                        >
                          <span>
                            Discount
                            {order.offerCode
                              ? ` (${order.offerCode})`
                              : ""}
                          </span>

                          <strong>
                            − ₹
                            {discountAmount.toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            justifyContent:
                              "space-between",
                            marginBottom: "7px",
                          }}
                        >
                          <span>
                            Amount After Discount
                          </span>

                          <strong>
                            ₹
                            {discountedSubtotal.toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </div>
                      </>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        marginBottom: "7px",
                      }}
                    >
                      <span>
                        Delivery Charges
                      </span>

                      <strong>
                        {deliveryCharge > 0
                          ? `₹${deliveryCharge.toLocaleString(
                              "en-IN"
                            )}`
                          : "To be decided"}
                      </strong>
                    </div>
                  </div>

                  <div className="my-order-bottom">
                    <div>
                      <span>
                        Final Total
                      </span>

                      <strong>
                        ₹
                        {finalTotal.toLocaleString(
                          "en-IN"
                        )}
                      </strong>
                    </div>

                    <div className="my-order-actions">
                      <Link
                        to={`/order/${order._id}`}
                        className="my-order-view-button"
                      >
                        View Order & Track →
                      </Link>

                      {[
                        "Pending",
                        "Confirmed",
                        "Processing",
                      ].includes(
                        order.orderStatus
                      ) && (
                        <button
                          type="button"
                          className="my-order-cancel-button"
                          onClick={() =>
                            handleCancelOrder(
                              order._id
                            )
                          }
                          disabled={
                            cancelling ===
                            order._id
                          }
                        >
                          {cancelling ===
                          order._id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default MyOrders;
