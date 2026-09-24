import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getProducts } from "../services/api";

const API_URL = "https://cozy-noor-1.onrender.com/api";

function Shop() {
  const [searchParams] = useSearchParams();

  const searchQuery =
    searchParams.get("search")?.trim().toLowerCase() || "";

  const [products, setProducts] = useState([]);
  const [offers, setOffers] = useState([]);

  // SEARCH FILTER
  const filteredProducts = products.filter((product) => {
    return (
      product.name?.toLowerCase().includes(searchQuery) ||
      product.category?.toLowerCase().includes(searchQuery) ||
      product.tag?.toLowerCase().includes(searchQuery)
    );
  });

  // GET PRODUCTS FROM MONGODB
  useEffect(() => {
    getProducts()
      .then((data) => {
        console.log("Products from MongoDB:", data);

        setProducts(
          data.map((product) => ({
            ...product,
            id: product._id,
            tag: "Bestseller",
            emoji: "🌹",
          }))
        );
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }, []);

  // GET OFFERS FROM MONGODB
  useEffect(() => {
    fetch(`${API_URL}/offers`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch offers");
        }

        return response.json();
      })
      .then((data) => {
        console.log("Offers from MongoDB:", data);
        setOffers(data);
      })
      .catch((error) => {
        console.error("Error fetching offers:", error);
      });
  }, []);

  // CHECK WHETHER OFFER IS CURRENTLY ACTIVE
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

  // GET BEST DISPLAYABLE OFFER FOR A PRODUCT
  const getProductOffer = (product) => {
    const activeOffers = offers.filter(
      (offer) =>
        isOfferCurrentlyActive(offer) &&
        Number(offer.minimumOrderAmount || 0) === 0
    );

    const applicableOffers = activeOffers.filter(
      (offer) => {
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
              category.toLowerCase() ===
              product.category?.toLowerCase()
          );
        }

        return false;
      }
    );

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
        offer.maximumDiscount !== undefined
      ) {
        discount = Math.min(
          discount,
          Number(offer.maximumDiscount)
        );
      }

      discount = Math.min(
        discount,
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

  return (
    <main className="shop-page-final">

      {/* SHOP HERO */}

      <section className="shop-final-hero">

        <span className="shop-final-flower flower-one">
          ❀
        </span>

        <span className="shop-final-flower flower-two">
          ✿
        </span>

        <span className="shop-final-flower flower-three">
          ❁
        </span>

        <div className="shop-final-hero-inner">

          <p className="shop-final-label">
            THE COZY NOOR COLLECTION
          </p>

          <h1>
            Little things,
            <br />
            <em>made beautifully.</em>
          </h1>

          <p className="shop-final-intro">
            Handmade crochet flowers, accessories,
            bags, gifts and thoughtful little creations —
            each one made carefully, one stitch at a time.
          </p>

          <div className="shop-final-divider">
            <span>✦</span>
            HANDMADE IN PUNE
            <span>✦</span>
          </div>

        </div>

      </section>

      {/* SHOP MAIN */}

      <section className="shop-final-products">

        <div className="shop-final-top">

          <div className="shop-final-heading">

            <p className="shop-final-label">
              HANDPICKED FOR YOU
            </p>

            <h2>
              Shop <em>all</em>
            </h2>

            <p>
              Find something lovely for yourself
              or someone special.
            </p>

          </div>

          <div className="shop-final-controls">

            <button className="shop-filter-button">
              ♡ Categories
            </button>

            <select defaultValue="featured">
              <option value="featured">
                Featured
              </option>

              <option value="newest">
                Newest
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>

            </select>

          </div>

        </div>

        {/* SEARCH RESULT */}

        {searchQuery && (
          <div className="shop-search-result">

            <p>
              Search results for{" "}
              <strong>"{searchQuery}"</strong>
            </p>

            <span>
              {filteredProducts.length} product
              {filteredProducts.length !== 1
                ? "s"
                : ""}{" "}
              found
            </span>

            <Link to="/shop">
              Clear Search
            </Link>

          </div>
        )}

        {/* PRODUCT GRID */}

        {filteredProducts.length > 0 ? (

          <div className="shop-final-grid">

            {filteredProducts.map((product) => {

              const productOffer =
                getProductOffer(product);

              const originalPrice =
                Number(product.price || 0);

              const discountedPrice =
                productOffer
                  ? Number(
                      productOffer.discountedPrice
                    )
                  : originalPrice;

              const discountPercentage =
                productOffer &&
                originalPrice > 0
                  ? Math.round(
                      (productOffer.calculatedDiscount /
                        originalPrice) *
                        100
                    )
                  : 0;

              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="shop-final-card"
                >

                  <div className="shop-final-image">

                    <span className="shop-final-tag">
                      {productOffer
                        ? `${discountPercentage}% OFF`
                        : product.tag}
                    </span>

                    <button
                      className="shop-final-heart"
                      onClick={(event) => {
                        event.preventDefault();
                      }}
                      aria-label="Add to wishlist"
                    >
                      ♡
                    </button>

                    {/* PRODUCT IMAGE FROM CLOUDINARY */}

                    <div className="shop-final-art">

                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />
                      ) : (
                        <span>
                          {product.emoji}
                        </span>
                      )}

                    </div>

                    <div className="shop-final-view">
                      View Product{" "}
                      <span>→</span>
                    </div>

                  </div>

                  <div className="shop-final-info">

                    <div>

                      <span className="shop-final-category">
                        {product.category}
                      </span>

                      <h3>
                        {product.name}
                      </h3>

                      {productOffer ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            flexWrap: "wrap",
                            marginTop: "6px",
                          }}
                        >
                          <strong
                            style={{
                              color: "var(--rose-dark, #8c5d65)",
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
                              fontSize: "12px",
                            }}
                          >
                            ₹
                            {originalPrice.toLocaleString(
                              "en-IN"
                            )}
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

                    <span className="shop-final-arrow">
                      →
                    </span>

                  </div>

                </Link>
              );
            })}

          </div>

        ) : (

          <div className="shop-no-results">

            <div className="shop-no-results-icon">
              🧶
            </div>

            <h3>
              No products found
            </h3>

            <p>
              We couldn't find anything matching
              "{searchQuery}".
            </p>

            <Link
              to="/shop"
              className="shop-no-results-button"
            >
              View All Products
            </Link>

          </div>

        )}

      </section>

      {/* HANDMADE BANNER */}

      <section className="shop-final-banner">

        <span className="shop-banner-flower left">
          ❀
        </span>

        <div className="shop-banner-content">

          <span className="shop-banner-icon">
            🧶
          </span>

          <p className="shop-final-label">
            A LITTLE NOTE FROM COZY NOOR
          </p>

          <h2>
            Made especially
            <br />
            <em>for you.</em>
          </h2>

          <p>
            Every order is handmade with patience
            and care. Please allow 10–15 days for
            your creation to be made before dispatch.
          </p>

        </div>

        <span className="shop-banner-flower right">
          ✿
        </span>

      </section>

      {/* CUSTOM ORDER CTA */}

      <section className="shop-final-custom">

        <span className="shop-custom-flower left">
          ❁
        </span>

        <div>

          <p className="shop-final-label">
            CAN'T FIND WHAT YOU'RE LOOKING FOR?
          </p>

          <h2>
            Have something
            <br />
            <em>special in mind?</em>
          </h2>

          <p>
            Choose your colours, design and details.
            Tell us your idea and we'll turn it into
            a handmade crochet creation.
          </p>

          <Link
            to="/custom-order"
            className="shop-final-button"
          >
            Create Custom Order
            <span>→</span>
          </Link>

        </div>

        <span className="shop-custom-flower right">
          🌷
        </span>

      </section>

    </main>
  );
}

export default Shop;
