import { Link } from "react-router-dom";

function About() {
  return (
    <main className="about-page-final">

      {/* HERO */}
      <section className="about-final-hero">
        <div className="about-hero-decoration about-deco-left">✿</div>
        <div className="about-hero-decoration about-deco-right">❀</div>

        <p className="about-eyebrow">THE STORY BEHIND COZY NOOR</p>

        <h1>
          Made with love,
          <br />
          <em>one stitch at a time.</em>
        </h1>

        <p className="about-hero-text">
          Welcome to Cozy Noor — a little corner where yarn,
          creativity and love come together to create something
          truly special.
        </p>
      </section>

      {/* STORY */}
      <section className="about-story-section">
        <div className="about-story-image">
          <div className="about-flower-art">
            <span>🌷</span>
            <span>🌸</span>
            <span>🌼</span>
            <span>🌿</span>
          </div>
        </div>

        <div className="about-story-content">
          <p className="about-eyebrow">OUR STORY</p>

          <h2>
            More than crochet,
            <br />
            <em>it's a little piece of us.</em>
          </h2>

          <p>
            Cozy Noor started with a simple love for crochet and
            handmade creations. What began with yarn, a hook and
            countless little ideas slowly grew into something
            much more meaningful.
          </p>

          <p>
            Every piece we create is carefully handmade with
            patience and attention to detail. From tiny flowers
            and cute keychains to bags, bouquets and personalised
            gifts, each creation is made to feel personal and
            special.
          </p>

          <p>
            We believe handmade things carry a feeling that
            something mass-produced simply cannot. That's why
            every Cozy Noor order is made with care — especially
            for you.
          </p>

          <div className="about-signature">
            <span>With love,</span>
            <strong>Cozy Noor ♡</strong>
          </div>
        </div>
      </section>

      {/* WHAT WE BELIEVE */}
      <section className="about-values-section">

        <div className="about-section-heading">
          <p className="about-eyebrow">WHAT WE BELIEVE IN</p>

          <h2>
            Little details make
            <br />
            <em>big memories.</em>
          </h2>

          <p>
            Our creations are made to be gifted, cherished,
            remembered and loved.
          </p>
        </div>

        <div className="about-values-grid">

          <div className="about-value-card">
            <div className="about-value-icon">♡</div>
            <h3>Made With Love</h3>
            <p>
              Every stitch is made by hand with patience,
              care and lots of love.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-icon">✿</div>
            <h3>Thoughtfully Handmade</h3>
            <p>
              We pay attention to the little details that
              make every piece feel special.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-icon">❀</div>
            <h3>Made For You</h3>
            <p>
              From colours to designs, custom creations can
              be made according to your ideas.
            </p>
          </div>

          <div className="about-value-card">
            <div className="about-value-icon">✧</div>
            <h3>Made To Be Remembered</h3>
            <p>
              Our pieces are created for birthdays, celebrations,
              gifting and everyday little joys.
            </p>
          </div>

        </div>
      </section>

      {/* HANDMADE PROCESS */}
      <section className="about-process-section">

        <div className="about-process-intro">
          <p className="about-eyebrow">THE COZY NOOR WAY</p>

          <h2>
            From an idea
            <br />
            <em>to your hands.</em>
          </h2>
        </div>

        <div className="about-process-grid">

          <div className="about-process-item">
            <span>01</span>
            <h3>You choose</h3>
            <p>
              Pick something from our collection or share
              your own custom idea with us.
            </p>
          </div>

          <div className="about-process-item">
            <span>02</span>
            <h3>We create</h3>
            <p>
              Your piece is carefully crocheted by hand,
              keeping every detail in mind.
            </p>
          </div>

          <div className="about-process-item">
            <span>03</span>
            <h3>We pack</h3>
            <p>
              Once your order is ready, we carefully prepare
              it for its journey to you.
            </p>
          </div>

          <div className="about-process-item">
            <span>04</span>
            <h3>You enjoy</h3>
            <p>
              Your handmade Cozy Noor creation reaches you,
              ready to be loved or gifted.
            </p>
          </div>

        </div>
      </section>

      {/* MAKING NOTICE */}
      <section className="about-making-banner">

        <div className="about-making-flower">❀</div>

        <div>
          <p className="about-eyebrow">HANDMADE WITH PATIENCE</p>

          <h2>
            Good things
            <br />
            <em>take time.</em>
          </h2>

          <p>
            Every Cozy Noor order is handmade to order.
            Please allow approximately <strong>10–15 days</strong>
            for us to lovingly create your piece before dispatch.
          </p>
        </div>

        <div className="about-making-flower">✿</div>

      </section>

      {/* CUSTOM CTA */}
      <section className="about-custom-section">

        <p className="about-eyebrow">HAVE AN IDEA?</p>

        <h2>
          Dream it.
          <br />
          <em>We'll crochet it.</em>
        </h2>

        <p>
          Have a specific colour, size, design or gift idea
          in mind? Tell us what you're imagining and we'll
          see how we can bring it to life.
        </p>

        <Link to="/custom-order" className="about-custom-button">
          Create a Custom Order
          <span>→</span>
        </Link>

      </section>

    </main>
  );
}

export default About;