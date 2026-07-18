import "./Home.css";
import hero1 from "../assets/image.png";
import hero2 from "../assets/image3.png";
import { useNavigate } from "react-router-dom"

const slides = [
  {
    id: 1,
    image: hero1,
    title: "Elevate Your Everyday Style",
    subtitle:
      "Discover the latest trends in men's and women's fashion with premium quality, unbeatable prices, and new arrivals every week.",
    button: "Shop Now",
  },
  {
    id: 2,
    image: hero2,
    title: "New Season, New Collection",
    subtitle:
      "Upgrade your wardrobe with stylish outfits, trendy essentials, and exclusive deals designed for every occasion.",
    button: "Explore Collection",
  },
];

function Home() {
  const navigate = useNavigate();
  return (
    <section className="home-section">
      <div className="hero-slider">
        {slides.map((slide) => (
          <div className="hero-slide" key={slide.id}>
            <img src={slide.image} alt={slide.title} />

            <div className="hero-overlay"></div>

            <div className="hero-content">
              <h1>{slide.title}</h1>
              <p>{slide.subtitle}</p>

              <button onClick={() => {
                navigate("/products")
              }}>{slide.button}</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Home;