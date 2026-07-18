import "./Contact.css";
function Contact() {
  return (
    <>
      {/* Hero Banner */}
      <section className="contact-hero">
        <img
          src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1600"
          alt="Contact"
        />
        <div className="overlay">
          <h1>Contact Us</h1>
          <p>
            We'd love to hear from you. Let's create something amazing together.
          </p>
        </div>
      </section>
      {/* Contact Section */}
      <section className="contact">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          <p>
            Have questions about our products or your order? Our team is here to help you.
          </p>
          <div className="info-box">
            <h3>📍 Address</h3>
            <p>Hazratganj, Lucknow, Uttar Pradesh</p>
          </div>
          <div className="info-box">
            <h3>📞 Phone</h3>
            <p>+91 98765 43210</p>
          </div>
          <div className="info-box">
            <h3>✉ Email</h3>
            <p>eliteattire@gmail.com</p>
          </div>
        </div>
        <form>
          <input type="text" placeholder="Your Name" />
          <input type="email" placeholder="Email Address" />
          <textarea rows="6" placeholder="Write your message..."></textarea>
          <button>Send Message</button>
        </form>
      </section>
    </>
  );
}
export default Contact;