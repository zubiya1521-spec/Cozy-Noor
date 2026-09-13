import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OrderDetails() {
  const { id } = useParams();
const user = JSON.parse(
  localStorage.getItem("cozyNoorUser")
);
const token = user?.token;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const statuses = [
    "Pending",
    "Confirmed",
    "Processing",
    "Ready",
    "Shipped",
    "Delivered",
  ];

  const statusDescriptions = {
    Pending: "Order received",
    Confirmed: "Your order has been confirmed",
    Processing:
      "Your handmade creation is being prepared",
    Ready: "Your order is ready for dispatch",
    Shipped: "Your order is on the way",
    Delivered: "Your order has been delivered",
  };

  useEffect(() => {
   fetch(`http://localhost:5000/api/orders/${id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
      .then((response) => {
        if (!response.ok) {
          throw new Error("Order not found");
        }

        return response.json();
      })
      .then((data) => {
        setOrder(data);
      })
      .catch((error) => {
        console.error("Order fetch error:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, token]);

  const handleCancelOrder = async () => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${id}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to cancel order"
        );
      }

      setOrder((previousOrder) => ({
        ...previousOrder,
        orderStatus: "Cancelled",
      }));

      alert("Order cancelled successfully.");
    } catch (error) {
      console.error("Cancel order error:", error);

      alert(
        error.message || "Order cancellation failed."
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-loading">
          <h2>Loading your order...</h2>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="order-details-page">
        <div className="order-not-found">
          <h1>Order not found</h1>
          <p>We couldn't find this order.</p>

          <Link to="/shop">
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  const currentIndex = statuses.indexOf(
    order.orderStatus
  );

  const historyMap = {};

  if (
    order.statusHistory &&
    order.statusHistory.length > 0
  ) {
    order.statusHistory.forEach(
      (historyItem) => {
        historyMap[historyItem.status] =
          historyItem;
      }
    );
  }

  // =====================================================
// PRICE CALCULATION
// =====================================================

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

const discountAmount = Number(
  order.discountAmount || 0
);

// Always calculate amount after discount
const calculatedDiscountedSubtotal = Math.max(
  subtotal - discountAmount,
  0
);

const discountedSubtotal =
  discountAmount > 0
    ? calculatedDiscountedSubtotal
    : subtotal;

const deliveryCharge = Number(
  order.deliveryCharge || 0
);

// Always calculate final total from actual amounts
const calculatedFinalTotal =
  discountedSubtotal + deliveryCharge;

const finalTotal = calculatedFinalTotal;

  // =====================================================
  // DELIVERY ESTIMATE
  // =====================================================

  const estimatedDeliveryText =
    order.orderStatus === "Delivered"
      ? "Delivered successfully"
      : order.orderStatus === "Shipped"
      ? "Expected within 2–5 days"
      : "Expected within 10–15 days";

  const formatStatusDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  return (
    <main className="order-details-page">

      {/* ================= HERO ================= */}

      <section className="order-details-hero">
        <p>COZY NOOR ORDERS</p>

        <h1>
          Your Order
          <br />
          <em>is on its way.</em>
        </h1>

        <span>
          Thank you for choosing handmade.
        </span>
      </section>

      <section className="order-details-main">

        {/* ================= ORDER INFORMATION ================= */}

        <div className="order-info-card">

          <div className="order-info-top">

            <div>
              <span>ORDER ID</span>

              <strong>
                #
                {order._id
                  .slice(-8)
                  .toUpperCase()}
              </strong>
            </div>

            <div>
              <span>ORDER DATE</span>

              <strong>
                {new Date(
                  order.createdAt
                ).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </strong>
            </div>

          </div>

          <div className="order-delivery-estimate">
            <span>
              ESTIMATED DELIVERY
            </span>

            <strong>
              {estimatedDeliveryText}
            </strong>
          </div>

        </div>

        {/* ================= TRACKING ================= */}

        <section className="tracking-card">

          <div className="tracking-heading">

            <div>
              <p>
                ORDER TRACKING
              </p>

              <h2>
                Where is my{" "}
                <em>order?</em>
              </h2>
            </div>

            <span className="tracking-status">
              {order.orderStatus}
            </span>

          </div>

          <div className="tracking-timeline">

            {statuses.map(
              (status, index) => {

                const completed =
                  index <=
                  currentIndex;

                const active =
                  index ===
                  currentIndex;

                const historyItem =
                  historyMap[
                    status
                  ];

                return (
                  <div
                    className={`tracking-step ${
                      completed
                        ? "completed"
                        : ""
                    } ${
                      active
                        ? "active"
                        : ""
                    }`}
                    key={status}
                  >

                    <div className="tracking-dot">
                      {completed
                        ? "✓"
                        : ""}
                    </div>

                    <div className="tracking-step-content">

                      <strong>
                        {status}
                      </strong>

                      <span>
                        {
                          statusDescriptions[
                            status
                          ]
                        }
                      </span>

                      {historyItem && (
                        <small>
                          {formatStatusDate(
                            historyItem.updatedAt
                          )}
                        </small>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

          {/* ================= CANCEL ORDER ================= */}

          {["Pending", "Confirmed"].includes(
            order.orderStatus
          ) && (
            <div
              style={{
                marginTop: "25px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                className="my-order-cancel-button"
                onClick={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling
                  ? "Cancelling..."
                  : "Cancel Order"}
              </button>
            </div>
          )}

          {/* ================= CANCELLED ================= */}

          {order.orderStatus ===
            "Cancelled" && (
            <div className="order-cancelled-message">

              <strong>
                Order Cancelled
              </strong>

              <span>
                This order has been
                cancelled.
              </span>

            </div>
          )}

        </section>

        {/* ================= PRODUCTS ================= */}

        <section className="order-products-card">

          <div className="order-card-heading">

            <p>
              YOUR PURCHASE
            </p>

            <h2>
              Order <em>items</em>
            </h2>

          </div>

          {order.items.map(
            (item, index) => (
              <div
                className="order-item"
                key={
                  item.productId ||
                  index
                }
              >

                <div className="order-item-image">

                  {item.image ? (
                    <img
                      src={item.image}
                      alt={
                        item.productName
                      }
                    />
                  ) : (
                    <span>
                      🌷
                    </span>
                  )}

                </div>

                <div className="order-item-info">

                  <h3>
                    {item.productName}
                  </h3>

                  <p>
                    Quantity:{" "}
                    {item.quantity}
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
            )
          )}

          {/* ================= PRICE BREAKUP ================= */}

          <div className="order-price-breakup">

            <div className="order-price-row">

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
              <div
                className="order-price-row"
                style={{
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
            )}

            {discountAmount > 0 && (
              <div className="order-price-row">

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
            )}

            <div className="order-price-row">

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

          {/* ================= FINAL TOTAL ================= */}

          <div className="order-total">

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

          {/* PAYMENT STATUS */}

          <div
            style={{
              marginTop: "14px",
              paddingTop: "14px",
              borderTop:
                "1px solid var(--line, #e7dcd6)",
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
              gap: "10px",
            }}
          >

            <span
              style={{
                color:
                  "var(--muted, #776b68)",
                fontSize: "13px",
              }}
            >
              Payment
            </span>

            <strong
              style={{
                color:
                  order.paymentStatus ===
                  "Paid"
                    ? "#64745f"
                    : order.paymentStatus ===
                      "Failed"
                    ? "#a85c5c"
                    : "var(--ink, #403635)",
              }}
            >
              {order.paymentStatus}
            </strong>

          </div>

        </section>

        {/* ================= DELIVERY ADDRESS ================= */}

        <section className="order-address-card">

          <div>

            <p>
              DELIVERY ADDRESS
            </p>

            <h2>
              Delivering{" "}
              <em>to you</em>
            </h2>

          </div>

          <div className="order-address">

            <strong>
              {order.customerName}
            </strong>

            <span>
              {order.address}
            </span>

            <span>
              📞 {order.phone}
            </span>

            {order.email && (
              <span>
                ✉️ {order.email}
              </span>
            )}

          </div>

        </section>

        {/* ================= BACK ================= */}

        <div className="order-back">

          <Link to="/shop">
            ← Continue Shopping
          </Link>

        </div>

      </section>
    </main>
  );
}

export default OrderDetails;