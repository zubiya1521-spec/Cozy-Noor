import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  /*
    TEMPORARY CONTACT SETTINGS

    Later these details will come from:
    Admin Panel → Website Settings → MongoDB

    So you will NOT need to edit this page
    when your contact details change.
  */
  const contactSettings = {
    whatsappNumber: "91 7709567501",
    whatsappDisplay: "+91 7709567501",
    instagramUsername: "@the.cozy.noor",
    instagramUrl: "https://instagram.com/the.cozy.noor",
    email: "cozynoor1521@gmail.com",
    location: "Pune, Maharashtra",
    businessHours: "Monday – Saturday | 10:00 AM – 7:00 PM",
  };

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
  event.preventDefault();

  try {
    const response = await fetch(
      "https://cozy-noor-1.onrender.com/api/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to send message"
      );
    }

    setSubmitted(true);

    setFormData({
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    });
  } catch (error) {
    console.error("Contact form error:", error);

    alert(
      error.message ||
        "Something went wrong. Please try again."
    );
  }
};
  const whatsappMessage = encodeURIComponent(
    "Hi Cozy Noor! I have a query regarding your crochet products."
  );

  return (
    <main className="contact-page-final">

      {/* HERO */}
      <section className="contact-final-hero">

        <div className="contact-hero-flower contact-flower-left">
          ✿
        </div>

        <div className="contact-hero-content">

          <p className="contact-eyebrow">
            WE'D LOVE TO HEAR FROM YOU
          </p>

          <h1>
            Let's talk
            <br />
            <em>handmade.</em>
          </h1>

          <p>
            Have a question about an order, want to know more
            about a product, or have a custom idea in mind?
            We're just a message away.
          </p>

        </div>

        <div className="contact-hero-flower contact-flower-right">
          ❀
        </div>

      </section>


      {/* QUICK CONTACT */}
      <section className="contact-quick-section">

        <div className="contact-section-heading">

          <p className="contact-eyebrow">
            GET IN TOUCH
          </p>

          <h2>
            Choose what works
            <br />
            <em>best for you.</em>
          </h2>

        </div>


        <div className="contact-options-grid">

          {/* WHATSAPP */}
          <a
            href={`https://wa.me/${contactSettings.whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="contact-option-card"
          >

            <div className="contact-option-icon">
              💬
            </div>

            <span className="contact-option-label">
              WHATSAPP
            </span>

            <h3>
              Chat with us
            </h3>

            <p>
              Have a quick question? Send us a WhatsApp message
              and we'll get back to you.
            </p>

            <strong>
              {contactSettings.whatsappDisplay} →
            </strong>

          </a>


          {/* INSTAGRAM */}
          <a
            href={contactSettings.instagramUrl}
            target="_blank"
            rel="noreferrer"
            className="contact-option-card"
          >

            <div className="contact-option-icon">
              ◎
            </div>

            <span className="contact-option-label">
              INSTAGRAM
            </span>

            <h3>
              DM us
            </h3>

            <p>
              Follow Cozy Noor, see our latest creations and
              send us a DM anytime.
            </p>

            <strong>
              {contactSettings.instagramUsername} →
            </strong>

          </a>


          {/* EMAIL */}
          <a
            href={`mailto:${contactSettings.email}`}
            className="contact-option-card"
          >

            <div className="contact-option-icon">
              ✉
            </div>

            <span className="contact-option-label">
              EMAIL
            </span>

            <h3>
              Write to us
            </h3>

            <p>
              For detailed queries, collaborations or anything
              else, you can email us.
            </p>

            <strong>
              {contactSettings.email} →
            </strong>

          </a>

        </div>

      </section>


      {/* QUERY FORM */}
      <section className="contact-query-section">

        <div className="contact-query-intro">

          <p className="contact-eyebrow">
            HAVE A QUESTION?
          </p>

          <h2>
            Send us a
            <br />
            <em>message.</em>
          </h2>

          <p>
            Fill in the form and tell us what you need help
            with. We'll get back to you as soon as possible.
          </p>

          <div className="contact-info-list">

            <div className="contact-info-item">
              <span>⌂</span>
              <div>
                <small>LOCATION</small>
                <p>{contactSettings.location}</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span>◷</span>
              <div>
                <small>BUSINESS HOURS</small>
                <p>{contactSettings.businessHours}</p>
              </div>
            </div>

            <div className="contact-info-item">
              <span>♡</span>
              <div>
                <small>HANDMADE NOTICE</small>
                <p>
                  Our products are handmade to order and usually
                  take 10–15 days to make before dispatch.
                </p>
              </div>
            </div>

          </div>

        </div>


        <div className="contact-form-card">

          {submitted ? (

            <div className="contact-success">

              <div className="contact-success-icon">
                ✓
              </div>

              <h3>
                Message received!
              </h3>

              <p>
                Thank you for contacting Cozy Noor.
                We'll get back to you soon.
              </p>

              <button
                type="button"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </button>

            </div>

          ) : (

            <form onSubmit={handleSubmit}>

              <div className="contact-form-grid">

                <div className="contact-field">

                  <label>
                    Your Name *
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


                <div className="contact-field">

                  <label>
                    Phone / WhatsApp *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your number"
                    required
                  />

                </div>


                <div className="contact-field">

                  <label>
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                  />

                </div>


                <div className="contact-field">

                  <label>
                    What is your query about? *
                  </label>

                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  >

                    <option value="">
                      Select a topic
                    </option>

                    <option value="Product">
                      Product enquiry
                    </option>

                    <option value="Order">
                      Existing order
                    </option>

                    <option value="Custom Order">
                      Custom order
                    </option>

                    <option value="Bulk Order">
                      Bulk order
                    </option>

                    <option value="Delivery">
                      Delivery
                    </option>

                    <option value="Payment">
                      Payment
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>


              <div className="contact-field">

                <label>
                  Your Message *
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                  required
                />

              </div>


              <button
                type="submit"
                className="contact-submit-button"
              >
                Send Query
                <span>→</span>
              </button>

              <p className="contact-form-note">
                We usually respond through WhatsApp, Instagram
                or email depending on the contact details you provide.
              </p>

            </form>

          )}

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="contact-final-cta">

        <p className="contact-eyebrow">
          NEED SOMETHING UNIQUE?
        </p>

        <h2>
          Have a crochet idea
          <br />
          <em>of your own?</em>
        </h2>

        <p>
          Tell us about your dream design, colour, size and
          occasion. We'll see how we can create it for you.
        </p>

        <a
          href="/custom-order"
          className="contact-custom-button"
        >
          Start a Custom Order
          <span>→</span>
        </a>

      </section>

    </main>
  );
}

export default Contact;
