import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProducts } from "../services/api";

function CategoryProducts() {
  const { category } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("featured");

  const categoryNames = {
    "flowers-and-bouquets": "Flowers & Bouquets",
    "bags-and-pouches": "Bags & Pouches",
    "hair-accessories": "Hair Accessories",
    "keychains-and-charms": "Keychains & Charms",
    amigurumi: "Amigurumi",
    "home-decor": "Home Décor",
    "baby-and-kids": "Baby & Kids",
    "custom-and-personalized": "Custom & Personalized",
    "festive-celebrations": "Festive Celebrations",
    "couples-and-love": "Couples & Love",
    birthday: "Birthday",
    "parents-and-friends": "Parents & Friends",
    "baby-and-kids-occasions": "Baby & Kids Occasions",
    "national-and-patriotic": "National & Patriotic",
  };

  const categoryName =
    categoryNames[category] ||
    category
      .replaceAll("-", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  useEffect(() => {
    setLoading(true);

    getProducts()
      .then((data) => {
        console.log("Category products from MongoDB:", data);

        setProducts(data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Category products error:", error);
        setProducts([]);
        setLoading(false);
      });
  }, [category]);

  /*
    Convert text into a common format.

    Examples:

    Flower & Bouquets
    → flower-and-bouquets

    Flowers & Bouquets
    → flowers-and-bouquets
  */
  const makeSlug = (text) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/&/g, "and")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  /*
    Category matching
  */
  let filteredProducts = products.filter((product) => {
    if (!product.category) {
      return false;
    }

    const productCategory = product.category.trim();

    const productSlug = makeSlug(productCategory);

    /*
      Normal matching
    */
    if (productSlug === category) {
      return true;
    }

    /*
      Special matching for:
      Flower & Bouquets
      Flowers & Bouquets

      Both should open the same collection.
    */
    if (
      category === "flowers-and-bouquets" &&
      (
        productSlug === "flower-and-bouquets" ||
        productSlug === "flowers-and-bouquets"
      )
    ) {
      return true;
    }

    /*
      Compare category names directly
    */
    if (
      productCategory.toLowerCase() ===
      categoryName.toLowerCase()
    ) {
      return true;
    }

    return false;
  });

  /*
    Sorting
  */

  if (sort === "low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        Number(a.price || 0) -
        Number(b.price || 0)
    );
  }

  if (sort === "high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        Number(b.price || 0) -
        Number(a.price || 0)
    );
  }

  if (sort === "newest") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) =>
        new Date(b.createdAt || 0) -
        new Date(a.createdAt || 0)
    );
  }

  return (
    <main className="category-products-final">

      {/* HERO */}

      <section className="category-products-hero">

        <p className="category-products-eyebrow">
          COZY NOOR COLLECTION
        </p>

        <h1>{categoryName}</h1>

        <p>
          Handmade crochet pieces created with love,
          patience and beautiful little details.
        </p>

      </section>


      {/* PRODUCTS */}

      <section className="category-products-main">

        <div className="category-products-top">

          <div>

            <span>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} products`}
            </span>

            <h2>{categoryName}</h2>

          </div>


          <select
            className="category-sort"
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >

            <option value="featured">
              Featured
            </option>

            <option value="low">
              Price: Low to High
            </option>

            <option value="high">
              Price: High to Low
            </option>

            <option value="newest">
              Newest
            </option>

          </select>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="category-empty">

            <span>🧶</span>

            <h3>
              Loading creations...
            </h3>

            <p>
              Please wait while we bring your
              handmade collection.
            </p>

          </div>

        ) : filteredProducts.length > 0 ? (

          <div className="category-products-grid">

            {filteredProducts.map((product) => (

              <Link
                to={`/product/${product._id}`}
                className="category-product-card"
                key={product._id}
              >

                <div className="category-product-image">

                  <span className="category-product-badge">
                    {product.badge ||
                      product.tag ||
                      "Handmade"}
                  </span>


                  {product.images?.[0] ? (

                    <img
                      src={product.images[0]}
                      alt={product.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "12px",
                      }}
                    />

                  ) : (

                    <span className="category-product-emoji">
                      {product.emoji || "🌸"}
                    </span>

                  )}


                  <button
                    type="button"
                    className="category-product-wishlist"
                    onClick={(event) => {
                      event.preventDefault();
                    }}
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                </div>


                <div className="category-product-info">

                  <h3>
                    {product.name}
                  </h3>

                  <p>
                    ₹
                    {Number(
                      product.price || 0
                    ).toLocaleString("en-IN")}
                  </p>

                  <span className="category-product-view">
                    View Product →
                  </span>

                </div>

              </Link>

            ))}

          </div>

        ) : (

          <div className="category-empty">

            <span>✿</span>

            <h3>
              More creations coming soon
            </h3>

            <p>
              We are adding beautiful handmade pieces
              to this collection.
            </p>

            <Link to="/shop">
              Explore All Products →
            </Link>

          </div>

        )}

      </section>


      {/* CUSTOM ORDER */}

      <section className="category-products-custom">

        <div>

          <p className="category-products-eyebrow">
            CAN'T FIND WHAT YOU'RE LOOKING FOR?
          </p>

          <h2>
            Create something
            <br />
            <em>just for you.</em>
          </h2>

          <p>
            Tell us your colour, size, design or
            gifting idea and we'll create a
            personalised crochet piece for you.
          </p>

          <Link
            to="/custom-order"
            className="category-custom-button"
          >
            Request a Custom Order
            <span>→</span>
          </Link>

        </div>

      </section>

    </main>
  );
}

export default CategoryProducts;