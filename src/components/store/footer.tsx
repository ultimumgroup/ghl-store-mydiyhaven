import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
export function Footer() {
  return (
    <footer className="haven-footer">
      <div className="haven-shell">
        <div className="haven-footer-top">
          <div>
            <p className="haven-eyebrow">My DIY Haven</p>
            <h2>
              A little creativity.
              <br />A lot of possibility.
            </h2>
          </div>
          <Link className="haven-button" to="/products">
            Find your next project <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="haven-footer-grid">
          <div>
            <img
              src="/images/my-diy-haven-gold-full.png"
              width="900"
              height="576"
              alt="My DIY Haven — Create. Connect. Heal. Belong."
              className="haven-footer-mark"
              loading="lazy"
            />
            <p>
              Veteran founded. Open-hearted.
              <br />
              Healing Through Creativity.
            </p>
          </div>
          <div>
            <h3>Find your inspiration</h3>
            <Link to="/products">Shop all products</Link>
            <Link to="/collections">Explore collections</Link>
            <Link to="/about">Meet Larry Dillon</Link>
          </div>
          <div>
            <h3>Make room for making</h3>
            <Link to="/studio">Classes & studio</Link>
            <p>
              Candle & soap classes, open studio
              <br />
              and private events — coming soon.
            </p>
            <p>Based at Elevator CoWarehousing.</p>
          </div>
        </div>
        <div className="haven-footer-bottom">
          <p>© {new Date().getFullYear()} My DIY Haven. Create. Connect. Heal. Belong.</p>
          <a
            href="https://ultimumgroup.com/solutions/dev/smart-websites"
            className="haven-ultimum"
            aria-label="Website by Ultimum — Smart Websites"
          >
            <span>Website by</span>
            <img
              src="/images/ultimum-wordmark.svg"
              alt="Ultimum"
              width="100"
              height="24"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
