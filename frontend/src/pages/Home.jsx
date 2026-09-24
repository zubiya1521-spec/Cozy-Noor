import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";

function Home() {
  const [products, setProducts] = useState([]);
  const [databaseCategories, setDatabaseCategories] = useState([]);

  // PRODUCTS
  useEffect(() => {
    getProducts()
      .then((data) => {
        console.log("Home products from MongoDB:", data);
        setProducts(data || []);
      })
      .catch((error) => {
        console.error("Home products error:", error);
        setProducts([]);
      });
  }, []);

  // CATEGORIES DIRECTLY FROM BACKEND
  useEffect(() => {
    fetch("https://cozy-noor-1.onrender.com/api/categories")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Home categories from MongoDB:", data);

        const categoryList = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
          ? data.data
          : [];

        setDatabaseCategories(categoryList);
      })
      .catch((error) => {
        console.error("Home categories error:", error);
        setDatabaseCategories([]);
      });
  }, []);

  // MAIN CATEGORIES FROM DATABASE
  const mainCategories = databaseCategories
    .filter(
      (category) =>
        category.active !== false &&
        (!category.type || category.type === "main")
    )
    .slice(0, 4);

  const categoryClasses = [
    "cat-rose",
    "cat-lavender",
    "cat-sage",
    "cat-peach",
  ];

  const categoryFallbackTexts = {
    "Flowers & Bouquets":
      "Handcrafted blooms that stay beautiful.",
    "Bags & Pouches":
      "Pretty crochet pieces for everyday.",
    "Hair Accessories":
      "Bows, gajras, scrunchies & more.",
    "Keychains & Charms":
      "Tiny handmade pieces with personality.",
  };

  const occasions = [
    {
      title: "Birthdays",
      text: "Make their day a little more special.",
      icon: "🎂",
    },
    {
      title: "Weddings",
      text: "Thoughtful handmade gifts for beautiful moments.",
      icon: "♡",
    },
    {
      title: "Festivals",
      text: "Celebrate with something made by hand.",
      icon: "✦",
    },
    {
      title: "Just Because",
      text: "Sometimes you don't need a reason.",
      icon: "🌸",
    },
  ];

  return (
    <main className="home-page">

      {/* HERO */}

      <section className="hero-new">

        <div className="hero-new-flower flower-a">✿</div>
        <div className="hero-new-flower flower-b">❀</div>
        <div className="hero-new-flower flower-c">❁</div>

        <div className="hero-new-content">

          <p className="hero-label">
            HANDMADE • THOUGHTFUL • BEAUTIFUL
          </p>

          <div className="hero-logo">
            <img
              src="/LOGO.jpeg"
              alt="Cozy Noor Handmade Crochet"
            />
          </div>

          <h1>
            Little things,
            <br />
            <span>made beautifully.</span>
          </h1>

          <p className="hero-new-description">
            Handmade crochet flowers, gifts, accessories
            and little creations — thoughtfully made
            one stitch at a time.
          </p>

          <div className="hero-new-buttons">

            <Link
              to="/shop"
              className="hero-shop-btn"
            >
              Shop Collection
              <span>→</span>
            </Link>

            <Link
              to="/custom-order"
              className="hero-outline-btn"
            >
              Create Something Custom
            </Link>

          </div>

          <div className="hero-trust">
            <span>✦</span>
            Handmade to order
            <span>•</span>
            Pune based
            <span>•</span>
            Made with love
          </div>

        </div>

        <div className="hero-new-visual">

          <div className="hero-orbit orbit-one"></div>
          <div className="hero-orbit orbit-two"></div>

          <div className="hero-bouquet-card">

            <div className="bouquet-flower flower-main">
              🌸
            </div>

            <div className="bouquet-flower flower-side-one">
              🌷
            </div>

            <div className="bouquet-flower flower-side-two">
              🌼
            </div>

            <div className="bouquet-leaf leaf-one">
              🌿
            </div>

            <div className="bouquet-leaf leaf-two">
              🍃
            </div>

            <div className="bouquet-yarn">
              🧶
            </div>

            <div className="bouquet-caption">
              <small>THE COZY NOOR</small>
              <strong>Made by hand</strong>
              <span>with a little extra love ♡</span>
            </div>

          </div>

          <div className="floating-note note-one">
            <span>✿</span>
            Every piece is unique
          </div>

          <div className="floating-note note-two">
            <span>♡</span>
            Handmade in Pune
          </div>

        </div>

      </section>


      {/* INTRO STRIP */}

      <section className="brand-strip">

        <div>
          <span>01</span>
          <strong>Handmade</strong>
          <p>Every stitch made with care.</p>
        </div>

        <div>
          <span>02</span>
          <strong>Made For You</strong>
          <p>Thoughtful pieces & custom details.</p>
        </div>

        <div>
          <span>03</span>
          <strong>Made To Last</strong>
          <p>Memories that stay beautiful.</p>
        </div>

        <div>
          <span>04</span>
          <strong>Made In Pune</strong>
          <p>Small business, big heart.</p>
        </div>

      </section>


      {/* CATEGORIES */}

      <section className="home-categories">

        <div className="home-section-heading">

          <div>

            <p className="small-label">
              EXPLORE THE COLLECTION
            </p>

            <h2>
              Find your
              <br />
              <i>little something.</i>
            </h2>

          </div>

          <Link
            to="/categories"
            className="text-link"
          >
            View all categories →
          </Link>

        </div>

        <div className="beautiful-category-grid">

          {mainCategories.length > 0 ? (

            mainCategories.map((category, index) => {

              const categoryTitle = category.name || "Category";

              const categoryText =
                category.description ||
                categoryFallbackTexts[categoryTitle] ||
                "Beautiful handmade crochet creations.";

              const categoryImage =
                category.image || category.emoji || "✿";

              const categorySlug = categoryTitle
                .toLowerCase()
                .replaceAll(" & ", "-and-")
                .replaceAll(" ", "-");

              return (

                <Link
                  key={category._id || categoryTitle}
                  to={`/category/${categorySlug}`}
                  className={`beautiful-category-card ${
                    categoryClasses[index]
                  }`}
                >

                  <div className="category-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="category-visual">

                    {category.image ? (

                      <img
                        src={category.image}
                        alt={categoryTitle}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "inherit",
                        }}
                      />

                    ) : (

                      <span>
                        {categoryImage}
                      </span>

                    )}

                  </div>

                  <div className="category-content">

                    <h3>
                      {categoryTitle}
                    </h3>

                    <p>
                      {categoryText}
                    </p>

                    <span className="category-view">
                      Explore collection →
                    </span>

                  </div>

                  <div className="category-decoration">
                    ✿
                  </div>

                </Link>

              );
            })

          ) : (

            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <span style={{ fontSize: "35px" }}>
                🧶
              </span>

              <h3>
                Categories coming soon
              </h3>

              <p>
                Categories added from the Admin Panel
                will appear here.
              </p>

            </div>

          )}

        </div>

      </section>


      {/* FEATURED PRODUCTS */}

      <section className="featured-new">

        <div className="flower-line">
          ✿　❀　✿　❁　✿
        </div>

        <div className="home-section-heading centered-heading">

          <p className="small-label">
            HANDPICKED FOR YOU
          </p>

          <h2>
            Our favourite
            <br />
            <i>little creations.</i>
          </h2>

          <p>
            A mix of things we love making —
            from everyday accessories to thoughtful gifts.
          </p>

        </div>

        <div className="premium-product-grid">

          {products.length > 0 ? (

            products.map((product) => (

              <Link
                key={product._id}
                to={`/product/${product._id}`}
                className="premium-product-card"
              >

                <div className="premium-product-image">

                  <span className="product-tag">
                    {product.badge ||
                      product.tag ||
                      "Handmade"}
                  </span>

                  <button
                    type="button"
                    className="product-heart"
                    onClick={(event) =>
                      event.preventDefault()
                    }
                    aria-label="Add to wishlist"
                  >
                    ♡
                  </button>

                  <div className="product-art">

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
                        {product.emoji || "🌸"}
                      </span>

                    )}

                  </div>

                  <div className="quick-view">
                    Quick View →
                  </div>

                </div>

                <div className="premium-product-info">

                  <div>

                    <h3>
                      {product.name}
                    </h3>

                    <p>
                      ₹
                      {Number(
                        product.price || 0
                      ).toLocaleString("en-IN")}
                    </p>

                  </div>

                  <span className="product-arrow">
                    →
                  </span>

                </div>

              </Link>

            ))

          ) : (

            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "50px 20px",
              }}
            >

              <span style={{ fontSize: "35px" }}>
                🧶
              </span>

              <h3>
                Beautiful creations coming soon
              </h3>

              <p>
                Our handmade products will appear here
                once they are added from the Admin Panel.
              </p>

            </div>

          )}

        </div>

        <div className="featured-bottom">

          <Link
            to="/shop"
            className="dark-pill-btn"
          >
            Explore All Products →
          </Link>

        </div>

      </section>


      {/* CUSTOM ORDER */}

      <section className="custom-new">

        <div className="custom-background-flower flower-left">
          ❀
        </div>

        <div className="custom-background-flower flower-right">
          ✿
        </div>

        <div className="custom-inner">

          <div className="custom-small-art">
            🌷
          </div>

          <p className="small-label">
            SOMETHING SPECIAL IN MIND?
          </p>

          <h2>
            You imagine it.
            <br />
            <i>We crochet it.</i>
          </h2>

          <p>
            Choose your colours, style, size and little details.
            Tell us what you're imagining and we'll create
            something especially for you.
          </p>

          <Link
            to="/custom-order"
            className="custom-button"
          >
            Start A Custom Order
            <span>→</span>
          </Link>

        </div>

      </section>


      {/* OCCASIONS */}

      <section className="occasion-section">

        <div className="occasion-heading">

          <p className="small-label">
            MADE FOR MOMENTS
          </p>

          <h2>
            A little handmade
            <br />
            <i>love for every occasion.</i>
          </h2>

          <p>
            Because the sweetest gifts are the ones
            that feel personal.
          </p>

        </div>

        <div className="occasion-grid">

          {occasions.map((occasion, index) => (

            <Link
              to="/categories"
              className="occasion-card"
              key={occasion.title}
            >

              <span className="occasion-number">
                0{index + 1}
              </span>

              <div className="occasion-icon">
                {occasion.icon}
              </div>

              <h3>
                {occasion.title}
              </h3>

              <p>
                {occasion.text}
              </p>

              <span className="occasion-arrow">
                →
              </span>

            </Link>

          ))}

        </div>

      </section>


      {/* WHY COZY NOOR */}

      <section className="why-new">

        <div className="why-visual">

          <div className="why-circle">

            <span className="why-flower-big">
              🌸
            </span>

            <span className="why-flower-small">
              🌿
            </span>

            <div className="why-label">
              <small>COZY NOOR</small>
              <strong>HANDMADE</strong>
            </div>

          </div>

        </div>

        <div className="why-content">

          <p className="small-label">
            THE COZY NOOR WAY
          </p>

          <h2>
            Handmade has
            <br />
            <i>a feeling.</i>
          </h2>

          <p className="why-main-text">
            Every Cozy Noor creation starts with yarn,
            imagination and lots of patience. We don't
            mass-produce — each piece is carefully made
            by hand, especially for you.
          </p>

          <div className="why-points">

            <div>

              <span>✿</span>

              <div>

                <strong>Made by hand</strong>

                <p>
                  Carefully crocheted, stitch by stitch.
                </p>

              </div>

            </div>

            <div>

              <span>♡</span>

              <div>

                <strong>Made with intention</strong>

                <p>
                  Thoughtful details for meaningful gifts.
                </p>

              </div>

            </div>

            <div>

              <span>✦</span>

              <div>

                <strong>Made especially for you</strong>

                <p>
                  Custom colours, designs and requests.
                </p>

              </div>

            </div>

          </div>

          <Link
            to="/about"
            className="text-link"
          >
            Discover our story →
          </Link>

        </div>

      </section>


      {/* MAKING TIME */}

      <section className="making-banner">

        <div className="making-flower">
          ❁
        </div>

        <div>

          <span className="making-icon">
            🧶
          </span>

          <strong>
            Every order is handmade especially for you.
          </strong>

          <p>
            Please allow 10–15 days for us to lovingly
            make your order before dispatch.
          </p>

        </div>

        <span className="making-flower right">
          ✿
        </span>

      </section>


      {/* REVIEWS */}

      <section className="love-section">

        <div className="home-section-heading centered-heading">

          <p className="small-label">
            CUSTOMER LOVE
          </p>

          <h2>
            Little words from
            <br />
            <i>happy hearts.</i>
          </h2>

        </div>

        <div className="love-grid">

          <div className="love-card">

            <div className="love-stars">
              ★★★★★
            </div>

            <p>
              “Absolutely beautiful! It looked even
              better than I expected. You can really
              see the love in the work.”
            </p>

            <span>
              — Happy Customer
            </span>

          </div>

          <div className="love-card featured-love">

            <div className="love-stars">
              ★★★★★
            </div>

            <p>
              “The crochet work is so neat and the
              packaging was adorable. Such a beautiful
              handmade gift!”
            </p>

            <span>
              — Happy Customer
            </span>

          </div>

          <div className="love-card">

            <div className="love-stars">
              ★★★★★
            </div>

            <p>
              “Such a thoughtful little creation.
              Loved every detail and the quality
              was amazing.”
            </p>

            <span>
              — Happy Customer
            </span>

          </div>

        </div>

      </section>


      {/* INSTAGRAM */}

      <section className="instagram-new">

        <div className="instagram-floral">
          ✿　❀　🌸　❁　🌷　✿
        </div>

        <p className="small-label">
          FOLLOW ALONG
        </p>

        <h2>
          @the.cozy.noor
        </h2>

        <p>
          Behind the stitches, pretty little details
          and everyday Cozy Noor moments.
        </p>

        <a
          href="https://www.instagram.com/the.cozy.noor/"
          target="_blank"
          rel="noopener noreferrer"
          className="instagram-button"
        >
          Follow on Instagram
          <span>↗</span>
        </a>

        <div className="instagram-bottom">
          handmade with love · pune · crochet
        </div>

      </section>

    </main>
  );
}

export default Home;
