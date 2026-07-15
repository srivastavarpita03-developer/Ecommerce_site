import "./Home.css";
import hero from "../assets/image.png";
import hero2 from "../assets/image3.png";
function Home() {
  return (
    <section className="home-section">
      <div className="hero-image">
        <img src={hero} alt="" />
        <img src={hero2} />
      </div>
    </section>
  );
}

export default Home;
