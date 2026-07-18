import "./About.css";
function About() {
  return (
    <section className="about">
      <div className="about-img">
        <img
          src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80"
          alt="Elite Attire"
        />
      </div>

      <div className="about-content">
        <span className="small-title">ABOUT ELITE ATTIRE</span>

        <h1>
          Crafted For Those
          <br />
          Who Love Luxury
        </h1>

        <div className="gold-line"></div>

        <p>
          At Elite Attire, fashion is more than clothing—it's confidence,
          elegance and timeless style. Every collection is carefully curated
          using premium fabrics and modern craftsmanship to help you stand out
          effortlessly.
        </p>

        <div className="features">
          <div>✓ Premium Quality</div>

          <div>✓ Sustainable Fashion</div>

          <div>✓ Modern Designs</div>
        </div>

        <div className="stats">
          <div>
            <h2>50K+</h2>
            <span>Customers</span>
          </div>

          <div>
            <h2>200+</h2>
            <span>Products</span>
          </div>

          <div>
            <h2>15+</h2>
            <span>Countries</span>
          </div>
        </div>

        <button>Explore Collection →</button>
      </div>
    </section>
  );
}

export default About;