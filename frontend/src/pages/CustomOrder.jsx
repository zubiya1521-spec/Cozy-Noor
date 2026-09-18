import { useState } from "react";

const API_URL = "http://cozy-noor-backend.onrender.com/api";

function CustomOrder() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    instagram: "",
    productType: "",
    description: "",
    quantity: "",
    size: "",
    colours: "",
    material: "",
    designDetails: "",
    requiredDate: "",
    occasion: "",
    budget: "",
    notes: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5 MB.");
      return;
    }

    setUploadingImage(true);

    try {
      const uploadData = new FormData();
      uploadData.append("image", file);

      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        body: uploadData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Image upload failed"
        );
      }

      setReferenceImage(data.imageUrl);

      alert("Reference image uploaded successfully! ❤️");
    } catch (error) {
      console.error("Reference image upload error:", error);
      alert(error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);

      const customOrderData = {
        ...formData,
        quantity: Number(formData.quantity),
        referenceImage: referenceImage,
      };

      const response = await fetch(
        `${API_URL}/custom-orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(customOrderData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Custom order request could not be submitted."
        );
      }

      console.log(
        "Custom order submitted:",
        data
      );

      setSubmitted(true);

      setFormData({
        name: "",
        phone: "",
        email: "",
        instagram: "",
        productType: "",
        description: "",
        quantity: "",
        size: "",
        colours: "",
        material: "",
        designDetails: "",
        requiredDate: "",
        occasion: "",
        budget: "",
        notes: "",
      });

      setReferenceImage("");
    } catch (error) {
      console.error(
        "Custom order submit error:",
        error
      );

      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="custom-order-page">

      {/* HERO */}

      <section className="custom-order-hero">

        <span className="custom-order-flower flower-one">
          ❀
        </span>

        <span className="custom-order-flower flower-two">
          ✿
        </span>

        <div className="custom-order-hero-inner">

          <p className="custom-order-label">
            MADE JUST FOR YOU
          </p>

          <h1>
            You imagine it.
            <br />
            <em>We crochet it.</em>
          </h1>

          <p>
            Have something special in mind?
            Tell us your idea, colours, size and
            little details — we'll bring it to life,
            one stitch at a time.
          </p>

          <div className="custom-order-hero-mark">
            <span>✦</span>
            CUSTOM · PERSONAL · HANDMADE
            <span>✦</span>
          </div>

        </div>

      </section>

      {/* FORM */}

      <section className="custom-order-section">

        <div className="custom-order-heading">

          <p className="custom-order-label">
            CUSTOM ORDER REQUEST
          </p>

          <h2>
            Tell us about
            <br />
            <em>your idea.</em>
          </h2>

          <p>
            Fill in as much detail as possible so we can
            understand exactly what you'd like us to make.
          </p>

        </div>

        <form
          className="custom-order-form"
          onSubmit={handleSubmit}
        >

          {/* 01 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>01</span>

              <div>
                <p>LET'S GET TO KNOW YOU</p>
                <h3>Your details</h3>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field">
                <label>
                  Full Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Phone / WhatsApp Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="form-field">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="form-field">
                <label>
                  Instagram Username
                </label>

                <input
                  type="text"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  placeholder="@yourusername"
                />
              </div>

            </div>
          </div>

          {/* 02 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>02</span>

              <div>
                <p>YOUR IDEA</p>
                <h3>What would you like us to make?</h3>
              </div>
            </div>

            <div className="form-field">

              <label>
                What are you looking for? <span>*</span>
              </label>

              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                required
              >
                <option value="" disabled>
                  Select a product type
                </option>

                <option>Flowers / Bouquet</option>
                <option>Bag / Pouch</option>
                <option>Hair Accessory</option>
                <option>Keychain / Charm</option>
                <option>Amigurumi / Toy</option>
                <option>Home Décor</option>
                <option>Baby / Kids Product</option>
                <option>Gift Set</option>
                <option>Custom / Something Else</option>
              </select>

            </div>

            <div className="form-field">

              <label>
                Describe what you want <span>*</span>
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Tell us about your idea... What should it look like? What would you like it to include?"
                required
              />

            </div>

          </div>

          {/* 03 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>03</span>

              <div>
                <p>THE DETAILS</p>
                <h3>Size, quantity & colours</h3>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Quantity <span>*</span>
                </label>

                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  placeholder="How many pieces?"
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Preferred Size
                </label>

                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="Example: 20 cm, small, medium..."
                />

              </div>

              <div className="form-field">

                <label>
                  Preferred Colour(s) <span>*</span>
                </label>

                <input
                  type="text"
                  name="colours"
                  value={formData.colours}
                  onChange={handleChange}
                  placeholder="Pink, white & lavender..."
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Yarn / Material Preference
                </label>

                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleChange}
                  placeholder="Any preference? Optional"
                />

              </div>

            </div>

            <div className="form-field">

              <label>
                Colour / Design Details
              </label>

              <textarea
                name="designDetails"
                value={formData.designDetails}
                onChange={handleChange}
                rows="4"
                placeholder="Tell us about specific colours, patterns, flowers, characters, initials, names, etc."
              />

            </div>

          </div>

          {/* 04 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>04</span>

              <div>
                <p>SHOW US YOUR INSPIRATION</p>
                <h3>Reference image</h3>
              </div>
            </div>

            <div className="upload-box">

              <div className="upload-icon">
                ✿
              </div>

              <h4>
                Have a reference picture?
              </h4>

              <p>
                Upload an image, sketch or inspiration
                picture so we can understand your idea better.
              </p>

              <label className="upload-button">

                {uploadingImage
                  ? "Uploading..."
                  : referenceImage
                  ? "Image Uploaded ✓"
                  : "Choose Image"}

                <input
                  type="file"
                  name="referenceImage"
                  accept="image/*"
                  hidden
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />

              </label>

              <small>
                JPG, PNG or WEBP · Maximum 5 MB
              </small>

            </div>

          </div>

          {/* 05 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>05</span>

              <div>
                <p>WHEN DO YOU NEED IT?</p>
                <h3>Delivery details</h3>
              </div>
            </div>

            <div className="form-grid">

              <div className="form-field">

                <label>
                  Required By Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="requiredDate"
                  value={formData.requiredDate}
                  onChange={handleChange}
                  required
                />

              </div>

              <div className="form-field">

                <label>
                  Occasion
                </label>

                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleChange}
                >
                  <option value="" disabled>
                    Select an occasion
                  </option>

                  <option>Birthday</option>
                  <option>Wedding</option>
                  <option>Anniversary</option>
                  <option>Valentine's Day</option>
                  <option>Eid</option>
                  <option>Rakhi</option>
                  <option>Diwali</option>
                  <option>Christmas</option>
                  <option>Baby Shower</option>
                  <option>Gift</option>
                  <option>Just Because</option>
                  <option>Other</option>
                </select>

              </div>

            </div>

            <div className="delivery-notice">

              <span>🧶</span>

              <div>
                <strong>
                  Handmade takes a little time.
                </strong>

                <p>
                  Our creations generally take
                  10–15 days to make before dispatch.
                  We'll confirm the timeline with you
                  after reviewing your request.
                </p>
              </div>

            </div>

          </div>

          {/* 06 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>06</span>

              <div>
                <p>LET'S TALK BUDGET</p>
                <h3>What's your budget?</h3>
              </div>
            </div>

            <div className="budget-options">

              {[
                "Under ₹500",
                "₹500 - ₹1000",
                "₹1000 - ₹2000",
                "₹2000 - ₹5000",
                "Above ₹5000",
                "Not sure",
              ].map((budget) => (
                <label key={budget}>

                  <input
                    type="radio"
                    name="budget"
                    value={budget}
                    checked={
                      formData.budget === budget
                    }
                    onChange={handleChange}
                  />

                  <span>
                    {budget === "₹500 - ₹1000"
                      ? "₹500 – ₹1,000"
                      : budget === "₹1000 - ₹2000"
                      ? "₹1,000 – ₹2,000"
                      : budget === "₹2000 - ₹5000"
                      ? "₹2,000 – ₹5,000"
                      : budget}
                  </span>

                </label>
              ))}

            </div>

          </div>

          {/* 07 */}

          <div className="form-card">

            <div className="form-card-heading">
              <span>07</span>

              <div>
                <p>ANYTHING ELSE?</p>
                <h3>Special instructions</h3>
              </div>
            </div>

            <div className="form-field">

              <label>
                Additional Notes
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="5"
                placeholder="Names, initials, packaging preferences, special requests or anything else you'd like us to know..."
              />

            </div>

          </div>

          {/* SUBMIT */}

          <div className="custom-order-submit">

            <div>

              <span>♡</span>

              <p>
                We'll review your request and
                contact you with the price,
                timeline and next steps.
              </p>

            </div>

            <button
              type="submit"
              className="custom-submit-button"
              disabled={loading || uploadingImage}
            >
              {loading
                ? "Sending Request..."
                : "Send Custom Order Request"}

              <span>→</span>
            </button>

          </div>

        </form>

        {/* SUCCESS */}

        {submitted && (
          <div className="custom-success">

            <span>✿</span>

            <h2>
              Request received!
            </h2>

            <p>
              Thank you for sharing your idea with
              Cozy Noor. We'll get in touch with you
              soon to discuss your custom creation.
            </p>

          </div>
        )}

      </section>

    </main>
  );
}

export default CustomOrder;