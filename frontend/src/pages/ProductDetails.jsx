import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById } from "../services/api";

const API_URL = "http://cozy-noor-backend.onrender.com/api";

function ProductDetails() {
  const { id } = useParams();
  console.log("PRODUCT ID FROM URL:", id);

  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customisation, setCustomisation] = useState("");
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  // REVIEWS
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    customerName: "",
    email: "",
    rating: 5,
    reviewText: "",
  });

  // PRODUCT OFFERS
  const [offers, setOffers] = useState([]);

  /* ================= FETCH PRODUCT ================= */

  useEffect(() => {
    setLoading(true);

    getProductById(id)
      .then((data) => {
        console.log("Product from MongoDB:", data);

        setProduct(data);
        setSelectedImage(0);
        setSelectedColour(data.colours?.[0] || "");
        setSelectedSize(data.sizes?.[0] || "");
        setQuantity(1);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product:", error);
        setProduct(null);
        setLoading(false);
      });
  }, [id]);

  /* ================= FETCH REVIEWS ================= */

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${API_URL}/reviews`);

        if (!response.ok) {
          throw new Error("Failed to fetch reviews");
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          const productReviews = data.filter(
            (review) =>
              String(review.productId?._id || review.productId) ===
              String(id)
          );

          setReviews(productReviews);
        }
      } catch (error) {
        console.error("Reviews fetch error:", error);
        setReviews([]);
      }
    };

    fetchReviews();
  }, [id]);

  /* ================= FETCH OFFERS ================= */

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch(`${API_URL}/offers`);

        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }

        const data = await response.json();

        setOffers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Product offer fetch error:", error);
        setOffers([]);
      }
    };

    fetchOffers();
  }, []);

  /* ================= REVIEW FORM ================= */

  const handleReviewChange = (event) => {
    const { name, value } = event.target;

    setReviewForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ================= SUBMIT REVIEW ================= */

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!reviewForm.customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!reviewForm.reviewText.trim()) {
      alert("Please write your review.");
      return;
    }

    try {
      setReviewLoading(true);

      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: reviewForm.customerName.trim(),
          email: reviewForm.email.trim(),
          rating: Number(reviewForm.rating),
          reviewText: reviewForm.reviewText.trim(),
          productName: product.name,
          productId: product._id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to submit review"
        );
      }

      alert(
        "Thank you for your review! ❤️ It will appear after approval."
      );

      setReviewForm({
        customerName: "",
        email: "",
        rating: 5,
        reviewText: "",
      });
    } catch (error) {
      console.error("Review submit error:", error);
      alert(error.message);
    } finally {
      setReviewLoading(false);
    }
  };

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <main className="product-details-final">
        <p>Loading product...</p>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="product-details-final">
        <h2>Product not found</h2>
        <Link to="/shop">← Back to Shop</Link>
      </main>
    );
  }

  const images = product.images?.filter(Boolean) || [];
  const colours = product.colours || [];
  const sizes = product.sizes || [];

  /* ================= PRODUCT OFFER ================= */

  const isOfferCurrentlyActive = (offer) => {
    if (!offer || offer.active === false) {
      return false;
    }

    const now = new Date();

    if (
      offer.startDate &&
      now < new Date(offer.startDate)
    ) {
      return false;
    }

    if (
      offer.endDate &&
      now > new Date(offer.endDate)
    ) {
      return false;
    }

    return true;
  };

  /* ================= GET BEST OFFER ================= */

  const getProductOffer = () => {
    const activeOffers = offers.filter(
      (offer) =>
        isOfferCurrentlyActive(offer) &&
        Number(offer.minimumOrderAmount || 0) === 0
    );

    const applicableOffers = activeOffers.filter((offer) => {
      if (offer.applicability === "all") {
        return true;
      }

      if (offer.applicability === "product") {
        return offer.productIds?.some(
          (productId) =>
            String(
              typeof productId === "object"
                ? productId._id
                : productId
            ) === String(product._id)
        );
      }

      if (offer.applicability === "category") {
        return offer.categories?.some(
          (category) =>
            String(category).toLowerCase() ===
            String(product.category || "").toLowerCase()
        );
      }

      return false;
    });

    if (applicableOffers.length === 0) {
      return null;
    }

    const originalPrice = Number(product.price || 0);

    let bestOffer = null;
    let highestDiscount = 0;

    applicableOffers.forEach((offer) => {
      let discount = 0;

      if (offer.discountType === "percentage") {
        discount =
          (originalPrice *
            Number(offer.discountValue || 0)) /
          100;
      } else {
        discount = Number(
          offer.discountValue || 0
        );
      }

      if (
        offer.maximumDiscount !== null &&
        offer.maximumDiscount !== undefined &&
        Number(offer.maximumDiscount) > 0
      ) {
        discount = Math.min(
          discount,
          Number(offer.maximumDiscount)
        );
      }

      discount = Math.min(
        Math.max(discount, 0),
        originalPrice
      );

      if (discount > highestDiscount) {
        highestDiscount = discount;

        bestOffer = {
          ...offer,
          calculatedDiscount: discount,
          discountedPrice:
            originalPrice - discount,
        };
      }
    });

    return bestOffer;
  };

  const productOffer = getProductOffer();

  const originalPrice = Number(
    product.price || 0
  );

  const discountedPrice = productOffer
    ? Number(productOffer.discountedPrice)
    : originalPrice;

  const discountAmount = productOffer
    ? Number(productOffer.calculatedDiscount)
    : 0;

  const discountPercentage =
    productOffer && originalPrice > 0
      ? Math.round(
          (discountAmount / originalPrice) * 100
        )
      : 0;

  const currentImage = images[selectedImage];

  /* ================= REVIEW CALCULATION ================= */

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) =>
              total + Number(review.rating || 0),
            0
          ) / reviews.length
        ).toFixed(1)
      : "5.0";

  /* ================= ADD TO CART ================= */

  const addToCart = () => {
    const cartItem = {
      id: product._id,
      name: product.name,

      /*
        Keep original product price here.
        Checkout/offer system handles the final discount.
        This prevents the same offer from being applied twice.
      */
      price: originalPrice,

      image: currentImage || "",
      colour: selectedColour,
      size: selectedSize,
      quantity,
      customisation,
    };

    const existingCart =
      JSON.parse(
        localStorage.getItem("cozyNoorCart")
      ) || [];

    const updatedCart = [
      ...existingCart,
      cartItem,
    ];

    localStorage.setItem(
      "cozyNoorCart",
      JSON.stringify(updatedCart)
    );

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 2500);
  };

  /* ================= BUY NOW ================= */

  const buyNow = () => {
    const buyNowProduct = {
      id: product._id,
      name: product.name,

      /*
        Keep original product price.
        Checkout applies the eligible offer.
      */
      price: originalPrice,

      image: currentImage || "",
      colour: selectedColour,
      size: selectedSize,
      quantity,
      customisation,
    };

    navigate("/checkout", {
      state: {
        buyNowProduct,
      },
    });
  };

  return (
    <main className="product-details-final">

      {/* BREADCRUMB */}

      <div className="product-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/shop">Shop</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      {/* MAIN PRODUCT */}

      <section className="product-details-main">

        {/* GALLERY */}

        <div className="product-gallery">

          <div className="product-main-image">

            {product.badge && (
              <span className="product-image-badge">
                {product.badge}
              </span>
            )}

            <button
              className="product-gallery-heart"
              onClick={() =>
                setWishlisted(!wishlisted)
              }
              aria-label="Wishlist"
            >
              {wishlisted ? "♥" : "♡"}
            </button>

            <div className="product-big-emoji">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                />
              ) : (
                <span>🧶</span>
              )}

            </div>

          </div>

          {/* THUMBNAILS */}

          {images.length > 0 && (
            <div className="product-thumbnails">

              {images.map((image, index) => (
                <button
                  key={index}
                  className={
                    selectedImage === index
                      ? "product-thumbnail active"
                      : "product-thumbnail"
                  }
                  onClick={() =>
                    setSelectedImage(index)
                  }
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "8px",
                    }}
                  />
                </button>
              ))}

            </div>
          )}

        </div>

        {/* INFORMATION */}

        <div className="product-information">

          <p className="product-category">
            {product.category}
          </p>

          <h1>{product.name}</h1>

          <div className="product-rating">

            <span>★★★★★</span>

            <strong>
              {averageRating}
            </strong>

            <a href="#reviews">
              {reviews.length} Reviews
            </a>

          </div>

          {/* PRICE + OFFER */}

          <div className="product-price">

            {productOffer ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >

                <strong
                  style={{
                    color:
                      "var(--rose-dark, #8c5d65)",
                    fontSize: "24px",
                  }}
                >
                  ₹
                  {discountedPrice.toLocaleString(
                    "en-IN"
                  )}
                </strong>

                <span
                  style={{
                    textDecoration:
                      "line-through",
                    color:
                      "var(--muted, #776b68)",
                    fontSize: "14px",
                  }}
                >
                  ₹
                  {originalPrice.toLocaleString(
                    "en-IN"
                  )}
                </span>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color:
                      "var(--rose-dark, #8c5d65)",
                    background:
                      "var(--rose-soft, #f2dfe0)",
                    padding: "4px 8px",
                    borderRadius: "20px",
                  }}
                >
                  {discountPercentage}% OFF
                </span>

              </div>
            ) : (
              <strong>
                ₹
                {originalPrice.toLocaleString(
                  "en-IN"
                )}
              </strong>
            )}

          </div>

          {productOffer && (
            <p
              style={{
                marginTop: "6px",
                marginBottom: "12px",
                fontSize: "13px",
                color:
                  "var(--rose-dark, #8c5d65)",
              }}
            >
              {productOffer.name
                ? `${productOffer.name} applied`
                : "Special offer available"}
            </p>
          )}

          <p className="product-description">
            {product.description}
          </p>

          {/* COLOUR */}

          {colours.length > 0 && (
            <div className="product-option">

              <div className="product-option-heading">
                <strong>Colour</strong>
                <span>{selectedColour}</span>
              </div>

              <div className="product-colours">

                {colours.map((colour) => (
                  <button
                    key={colour}
                    className={
                      selectedColour === colour
                        ? "colour-button selected"
                        : "colour-button"
                    }
                    onClick={() =>
                      setSelectedColour(colour)
                    }
                  >
                    {colour}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* SIZE */}

          {sizes.length > 0 && (
            <div className="product-option">

              <div className="product-option-heading">
                <strong>Size</strong>
                <span>{selectedSize}</span>
              </div>

              <div className="product-sizes">

                {sizes.map((size) => (
                  <button
                    key={size}
                    className={
                      selectedSize === size
                        ? "size-button selected"
                        : "size-button"
                    }
                    onClick={() =>
                      setSelectedSize(size)
                    }
                  >
                    {size}
                  </button>
                ))}

              </div>

            </div>
          )}

          {/* CUSTOMISATION */}

          <div className="product-customisation">

            <label htmlFor="customisation">
              Customisation
            </label>

            <textarea
              id="customisation"
              value={customisation}
              onChange={(event) =>
                setCustomisation(event.target.value)
              }
              placeholder="Name, initials, colour combination, design idea or any special request..."
              rows="4"
            />

            <small>
              Want something completely different?
              Use our Custom Order page.
            </small>

          </div>

          {/* STOCK */}

          <div className="product-stock">

            <span className="stock-dot"></span>

            {product.stock > 0
              ? `${product.stock} pieces available`
              : "Currently out of stock"}

          </div>

          {/* BUY ROW */}

          <div className="product-buy-row">

            <div className="product-quantity">

              <button
                onClick={() =>
                  setQuantity(
                    Math.max(1, quantity - 1)
                  )
                }
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={() =>
                  setQuantity(
                    Math.min(
                      product.stock,
                      quantity + 1
                    )
                  )
                }
                disabled={
                  product.stock === 0 ||
                  quantity >= product.stock
                }
              >
                +
              </button>

            </div>

            <button
              className="product-add-cart"
              onClick={addToCart}
              disabled={product.stock === 0}
            >
              {added
                ? "✓ Added to Cart"
                : "Add to Cart"}
            </button>

          </div>

          {/* BUY NOW */}

          <button
            className="product-buy-now"
            onClick={buyNow}
            disabled={product.stock === 0}
          >
            Buy Now
            <span>→</span>
          </button>

          {/* NOTICES */}

          <div className="product-notices">

            <div>
              <span>✿</span>

              <div>
                <strong>
                  Handmade to Order
                </strong>

                <p>
                  Every piece is carefully handmade
                  and takes approximately 10–15 days
                  to make before dispatch.
                </p>
              </div>
            </div>

            <div>
              <span>♡</span>

              <div>
                <strong>
                  Made specially for you
                </strong>

                <p>
                  Colours, sizes and selected products
                  can be customised.
                </p>
              </div>
            </div>

            <div>
              <span>⌁</span>

              <div>
                <strong>Delivery</strong>

                <p>
                  Delivery charges are calculated
                  according to your location and order.
                </p>
              </div>
            </div>

          </div>

          {/* CUSTOM ORDER */}

          <div className="product-custom-link">

            Can't find exactly what you want?

            <Link to="/custom-order">
              Request a Custom Order →
            </Link>

          </div>

        </div>

      </section>

      {/* DESCRIPTION */}

      <section className="product-description-section">

        <div className="product-description-box">

          <p className="product-section-eyebrow">
            DETAILS
          </p>

          <h2>
            Made slowly.
            <br />
            Made with love.
          </h2>

          <p>
            Each Cozy Noor creation is handmade with
            care, from selecting the yarn to finishing
            every little detail. Because handmade takes
            time, your order is made especially for you.
          </p>

        </div>

        <div className="product-features-box">

          <div>
            <span>01</span>
            <h3>Handmade</h3>
            <p>
              Carefully handcrafted, piece by piece.
            </p>
          </div>

          <div>
            <span>02</span>
            <h3>Customisable</h3>
            <p>
              Choose colours, sizes and special details.
            </p>
          </div>

          <div>
            <span>03</span>
            <h3>Made to Order</h3>
            <p>
              Please allow 10–15 days for making.
            </p>
          </div>

          <div>
            <span>04</span>
            <h3>Thoughtfully Packed</h3>
            <p>
              Every order is prepared with care.
            </p>
          </div>

        </div>

      </section>

      {/* REVIEWS */}

      <section
        className="product-reviews-section"
        id="reviews"
      >

        <p className="product-section-eyebrow">
          CUSTOMER LOVE
        </p>

        <h2>
          What customers say
        </h2>

        {/* APPROVED REVIEWS */}

        {reviews.length > 0 ? (
          <div className="product-review-grid">

            {reviews.map((review) => (
              <div
                className="product-review-card"
                key={review._id}
              >

                <div>
                  {"★".repeat(
                    Number(review.rating || 0)
                  )}

                  {"☆".repeat(
                    5 -
                      Number(
                        review.rating || 0
                      )
                  )}
                </div>

                <p>
                  "{review.reviewText}"
                </p>

                <span>
                  — {review.customerName}
                </span>

              </div>
            ))}

          </div>
        ) : (
          <div className="product-review-card">

            <div>★★★★★</div>

            <p>
              Be the first customer to review
              this product. ❤️
            </p>

            <span>
              Your review will appear here after approval.
            </span>

          </div>
        )}

        {/* WRITE REVIEW */}

        <div className="product-review-form">

          <div className="product-section-eyebrow">
            SHARE YOUR EXPERIENCE
          </div>

          <h3>
            Leave a review
          </h3>

          <p>
            Loved your Cozy Noor creation?
            Tell us what you think.
          </p>

          <form onSubmit={handleReviewSubmit}>

            <div className="review-form-row">

              <div className="review-form-group">

                <label>
                  Your Name
                </label>

                <input
                  type="text"
                  name="customerName"
                  value={
                    reviewForm.customerName
                  }
                  onChange={
                    handleReviewChange
                  }
                  placeholder="Enter your name"
                  required
                />

              </div>

              <div className="review-form-group">

                <label>
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    reviewForm.email
                  }
                  onChange={
                    handleReviewChange
                  }
                  placeholder="Optional"
                />

              </div>

            </div>

            <div className="review-form-group">

              <label>
                Rating
              </label>

              <select
                name="rating"
                value={
                  reviewForm.rating
                }
                onChange={
                  handleReviewChange
                }
              >
                <option value="5">
                  5 — Excellent
                </option>

                <option value="4">
                  4 — Very Good
                </option>

                <option value="3">
                  3 — Good
                </option>

                <option value="2">
                  2 — Okay
                </option>

                <option value="1">
                  1 — Needs Improvement
                </option>
              </select>

            </div>

            <div className="review-form-group">

              <label>
                Your Review
              </label>

              <textarea
                name="reviewText"
                value={
                  reviewForm.reviewText
                }
                onChange={
                  handleReviewChange
                }
                placeholder="Tell us about your Cozy Noor experience..."
                rows="5"
                required
              />

            </div>

            <button
              type="submit"
              className="product-buy-now"
              disabled={reviewLoading}
            >
              {reviewLoading
                ? "Submitting..."
                : "Submit Review"}

              {!reviewLoading && (
                <span>→</span>
              )}

            </button>

            <small className="review-form-note">
              Reviews are checked and approved by
              Cozy Noor before appearing publicly.
            </small>

          </form>

        </div>

      </section>

    </main>
  );
}

export default ProductDetails;