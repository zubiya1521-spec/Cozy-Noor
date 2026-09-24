import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "https://cozy-noor-1.onrender.com/api";

const defaultMainCategories = [
  {
    number: "01",
    title: "Flowers & Bouquets",
    description:
      "Handmade flowers and beautiful bouquets that stay forever.",
    emoji: "💐",
    className: "category-rose",
  },
  {
    number: "02",
    title: "Bags & Pouches",
    description:
      "Pretty crochet bags and pouches made for everyday moments.",
    emoji: "👜",
    className: "category-lavender",
  },
  {
    number: "03",
    title: "Hair Accessories",
    description:
      "Bows, gajras, scrunchies, headbands and more.",
    emoji: "🎀",
    className: "category-sage",
  },
  {
    number: "04",
    title: "Keychains & Charms",
    description:
      "Tiny handmade pieces to add a little personality.",
    emoji: "🧸",
    className: "category-peach",
  },
  {
    number: "05",
    title: "Amigurumi",
    description:
      "Cute little crochet characters made with love.",
    emoji: "🐻",
    className: "category-blue",
  },
  {
    number: "06",
    title: "Home Décor",
    description:
      "Handmade crochet details to make your space feel cozy.",
    emoji: "🌷",
    className: "category-cream",
  },
  {
    number: "07",
    title: "Baby & Kids",
    description:
      "Sweet handmade gifts, toys and accessories for little ones.",
    emoji: "🧸",
    className: "category-pink",
  },
  {
    number: "08",
    title: "Custom & Personalized",
    description:
      "Have an idea? Let's turn your imagination into crochet.",
    emoji: "💗",
    className: "category-custom",
  },
];

const defaultOccasions = [
  {
    number: "01",
    title: "Festive Celebrations",
    description:
      "Eid, Rakhi, Diwali, Christmas and festive creations.",
    emoji: "✦",
  },
  {
    number: "02",
    title: "Couples & Love",
    description:
      "Thoughtful creations for Valentine's, anniversaries and weddings.",
    emoji: "♡",
  },
  {
    number: "03",
    title: "Birthday",
    description:
      "Cute gifts, bouquets and personalised birthday creations.",
    emoji: "🎂",
  },
  {
    number: "04",
    title: "Parents & Friends",
    description:
      "Special handmade gifts for the people who matter most.",
    emoji: "🌸",
  },
  {
    number: "05",
    title: "Baby & Kids Occasions",
    description:
      "Baby shower, newborn and special little-one gifts.",
    emoji: "🍼",
  },
  {
    number: "06",
    title: "National & Patriotic",
    description:
      "Handmade creations for Independence Day and Republic Day.",
    emoji: "✧",
  },
];

const makeSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

function Categories() {
  const [databaseCategories, setDatabaseCategories] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/categories`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }

        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setDatabaseCategories(data);
        }
      })
      .catch((error) => {
        console.error("Categories error:", error);
      });
  }, []);

  const existingMainNames = defaultMainCategories.map((category) =>
    category.title.toLowerCase()
  );

  const existingOccasionNames = defaultOccasions.map((occasion) =>
    occasion.title.toLowerCase()
  );

  const newMainCategories = databaseCategories
    .filter(
      (category) =>
        category.active !== false &&
        category.type === "main" &&
        !existingMainNames.includes(category.name.toLowerCase())
    )
    .map((category, index) => ({
      number: String(defaultMainCategories.length + index + 1).padStart(
        2,
        "0"
      ),
      title: category.name,
      description:
        category.description ||
        "Beautiful handmade crochet creations made with love.",
      emoji: category.emoji || "✿",
      image: category.image || category.imageUrl || "",
      className: [
        "category-rose",
        "category-lavender",
        "category-sage",
        "category-peach",
        "category-blue",
        "category-cream",
        "category-pink",
        "category-custom",
      ][index % 8],
    }));

  const newOccasionCategories = databaseCategories
    .filter(
      (category) =>
        category.active !== false &&
        category.type === "occasion" &&
        !existingOccasionNames.includes(category.name.toLowerCase())
    )
    .map((category, index) => ({
      number: String(defaultOccasions.length + index + 1).padStart(
        2,
        "0"
      ),
      title: category.name,
      description:
        category.description ||
        "Thoughtful handmade creations for your special moments.",
      emoji: category.emoji || "✦",
      image: category.image || category.imageUrl || "",
    }));

  const allMainCategories = [
    ...defaultMainCategories,
    ...newMainCategories,
  ];

  const allOccasions = [
    ...defaultOccasions,
    ...newOccasionCategories,
  ];

  const getDatabaseCategory = (title) => {
    return databaseCategories.find(
      (category) =>
        category.name &&
        category.name.toLowerCase() === title.toLowerCase()
    );
  };

  const getCategoryLink = (title) => {
    return `/category/${makeSlug(title)}`;
  };

  return (
    <main className="categories-page-final">

      {/* HERO */}

      <section className="categories-final-hero">

        <span className="categories-flower flower-one">
          ❀
        </span>

        <span className="categories-flower flower-two">
          ✿
        </span>

        <span className="categories-flower flower-three">
          ❁
        </span>

        <div className="categories-hero-inner">

          <p className="categories-label">
            THE COZY NOOR COLLECTION
          </p>

          <h1>
            Find your
            <br />
            <em>little something.</em>
          </h1>

          <p>
            From pretty flowers to everyday accessories,
            thoughtful gifts and custom creations —
            discover something handmade just for you.
          </p>

          <div className="categories-hero-mark">
            <span>✦</span>
            EXPLORE · CHOOSE · MAKE IT YOURS
            <span>✦</span>
          </div>

        </div>

      </section>

      {/* MAIN CATEGORIES */}

      <section className="categories-final-main">

        <div className="categories-final-heading">

          <div>
            <p className="categories-label">
              SHOP BY CATEGORY
            </p>

            <h2>
              Made for
              <br />
              <em>every kind of you.</em>
            </h2>
          </div>

          <p>
            Explore our collections and discover
            handmade pieces designed to bring a
            little more warmth to everyday moments.
          </p>

        </div>

        <div className="categories-final-grid">

          {allMainCategories.map((category) => {

            const databaseCategory =
              getDatabaseCategory(category.title);

            const categoryName =
              databaseCategory?.name || category.title;

            const categoryImage =
              databaseCategory?.image ||
              databaseCategory?.imageUrl ||
              category.image ||
              "";

            return (
              <Link
                key={categoryName}
                to={getCategoryLink(categoryName)}
                className={`categories-final-card ${category.className}`}
              >

                <span className="categories-card-number">
                  {category.number}
                </span>

                <div className="categories-card-art">

                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={categoryName}
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
                      {databaseCategory?.emoji ||
                        category.emoji}
                    </span>
                  )}

                </div>

                <div className="categories-card-content">

                  <h3>
                    {categoryName}
                  </h3>

                  <p>
                    {databaseCategory?.description ||
                      category.description}
                  </p>

                  <span className="categories-card-link">
                    Explore collection
                    <span>→</span>
                  </span>

                </div>

                <span className="categories-card-flower">
                  ✿
                </span>

              </Link>
            );
          })}

        </div>

      </section>

      {/* OCCASIONS */}

      <section className="categories-occasion">

        <div className="categories-occasion-heading">

          <p className="categories-label">
            MADE FOR MOMENTS
          </p>

          <h2>
            Shop by
            <br />
            <em>occasion.</em>
          </h2>

          <p>
            Because every celebration deserves
            something thoughtful and handmade.
          </p>

        </div>

        <div className="occasion-category-grid">

          {allOccasions.map((occasion) => {

            const databaseCategory =
              getDatabaseCategory(occasion.title);

            const categoryName =
              databaseCategory?.name || occasion.title;

            const categoryImage =
              databaseCategory?.image ||
              databaseCategory?.imageUrl ||
              occasion.image ||
              "";

            return (
              <Link
                key={categoryName}
                to={getCategoryLink(categoryName)}
                className="occasion-category-card"
              >

                <span className="occasion-category-number">
                  {occasion.number}
                </span>

                <div className="occasion-category-icon">

                  {categoryImage ? (
                    <img
                      src={categoryImage}
                      alt={categoryName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        borderRadius: "inherit",
                      }}
                    />
                  ) : (
                    databaseCategory?.emoji ||
                    occasion.emoji
                  )}

                </div>

                <h3>
                  {categoryName}
                </h3>

                <p>
                  {databaseCategory?.description ||
                    occasion.description}
                </p>

                <span className="occasion-category-arrow">
                  →
                </span>

              </Link>
            );
          })}

        </div>

      </section>

      {/* CUSTOM CTA */}

      <section className="categories-custom-final">

        <span className="categories-custom-flower left">
          ❁
        </span>

        <span className="categories-custom-flower right">
          🌷
        </span>

        <div className="categories-custom-inner">

          <span className="categories-custom-icon">
            🧶
          </span>

          <p className="categories-label">
            DIDN'T FIND WHAT YOU HAD IN MIND?
          </p>

          <h2>
            Your idea.
            <br />
            <em>Our stitches.</em>
          </h2>

          <p>
            Tell us what you're imagining —
            colours, design, size or anything
            special. We'll create it just for you.
          </p>

          <Link
            to="/custom-order"
            className="categories-custom-button"
          >
            Create Something Custom
            <span>→</span>
          </Link>

        </div>

      </section>

      {/* HANDMADE NOTE */}

      <section className="categories-bottom-note">

        <div>
          <span>✿</span>

          <strong>
            Every piece is handmade to order.
          </strong>

          <p>
            Please allow 10–15 days for your
            Cozy Noor creation to be made
            before dispatch.
          </p>
        </div>

      </section>

    </main>
  );
}

export default Categories;
