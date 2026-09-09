import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  PenTool,
  Shirt,
  Sparkles,
  Users,
  HeartHandshake,
} from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { featuredQueryOptions } from "@/lib/catalog-query";
function ShopPreview() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const { data, isError } = useQuery({ ...featuredQueryOptions(), enabled: ready });
  return (
    <div className="haven-product-preview">
      {data ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {data.products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="haven-shop-loading">
          <PenTool size={30} />
          <p>
            {isError
              ? "The shop is taking a little longer to load."
              : "Finding your next source of inspiration…"}
          </p>
          <Link to="/products">
            Explore the full shop <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
export function HomeContent() {
  return (
    <>
      <section className="haven-hero" aria-labelledby="home-title">
        <img
          className="haven-hero-image"
          src="/images/stock-woodturning.jpg"
          alt=""
          fetchPriority="high"
          width="1800"
          height="1800"
        />
        <div className="haven-hero-mask" />
        <div className="haven-shell haven-hero-content">
          <div className="haven-hero-copy">
            <p className="haven-eyebrow">
              <span /> Veteran owned · Made for connection
            </p>
            <h1 id="home-title">
              Make something
              <br />
              <em>meaningful.</em>
            </h1>
            <p className="haven-hero-description">
              A project to get lost in. A skill to discover.
              <br className="hidden sm:block" /> A place to feel like yourself.
            </p>
            <p className="haven-hero-small">
              Welcome to My DIY Haven. Good things happen when we make room to create.
            </p>
            <div className="haven-actions">
              <Link to="/products" className="haven-button">
                Explore the shop <ArrowUpRight size={18} />
              </Link>
              <Link to="/about" className="haven-button-outline">
                Meet the heart behind it
              </Link>
            </div>
          </div>
          <div className="haven-hero-seal">
            <img src="/images/my-diy-haven-gold-icon.png" width="325" height="365" alt="" />
            <span>
              Healing Through
              <br />
              Creativity.
            </span>
          </div>
        </div>
        <div className="haven-shell haven-hero-foot">
          <span>For makers. For first-timers. For you.</span>
          <span className="haven-photo-note">The joy of making · illustrative photography</span>
        </div>
      </section>
      <div className="haven-values" aria-label="Our purpose">
        <div className="haven-shell">
          {["Create.", "Connect.", "Heal.", "Belong."].map((word, i) => (
            <span key={word}>
              <small>0{i + 1}</small>
              {word}
            </span>
          ))}
        </div>
      </div>
      <section className="haven-shell haven-section haven-intro">
        <p className="haven-eyebrow">More than a shop. A place to begin.</p>
        <div className="haven-intro-grid">
          <h2>
            Something in your hands.
            <br />
            <em>Something for your spirit.</em>
          </h2>
          <div>
            <p>
              Maybe it starts with a pen blank, a personal gift, or the idea for a T-shirt. Maybe it
              starts with simply wanting to try something new.
            </p>
            <p>
              My DIY Haven brings making and belonging together — through creative goods, custom
              work, and a growing vision for a welcoming community studio.
            </p>
            <Link to="/about" className="haven-text-link">
              Discover our story <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="haven-discover">
        <div className="haven-shell haven-section">
          <div className="haven-section-heading">
            <div>
              <p className="haven-eyebrow">Find your starting point</p>
              <h2>
                A little spark.
                <br />
                Your next creation.
              </h2>
            </div>
            <Link to="/collections" className="haven-text-link">
              All collections <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="haven-path-grid">
            {[
              {
                icon: PenTool,
                n: "01",
                title: "Pens & pen blanks",
                text: "A small object with a story to tell. Explore handcrafted pens and blanks for your next turn at the lathe.",
              },
              {
                icon: Shirt,
                n: "02",
                title: "Apparel & personal expression",
                text: "Wear what matters to you. Discover signature apparel and inspiration for something of your own.",
              },
              {
                icon: Sparkles,
                n: "03",
                title: "Gifts with a little meaning",
                text: "Explore signs, ornaments and creative finds that celebrate a person, a passion or a sense of belonging.",
              },
            ].map((item) => (
              <Link to="/collections" key={item.n} className="haven-path-card">
                <div className="haven-path-card-top">
                  <item.icon size={29} strokeWidth={1.2} />
                  <span>{item.n}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
                <span className="haven-path-card-link">
                  Explore collections <ArrowUpRight size={17} />
                </span>
              </Link>
            ))}
          </div>
          <div className="haven-section-heading haven-featured-heading">
            <div>
              <p className="haven-eyebrow">From the shop</p>
              <h2>Discover the possibilities.</h2>
            </div>
            <Link to="/products" className="haven-text-link">
              Shop all products <ArrowRight size={18} />
            </Link>
          </div>
          <ShopPreview />
        </div>
      </section>
      <section className="haven-shell haven-section haven-larry">
        <div className="haven-larry-image">
          <div className="haven-portrait">
            <img
              src="/images/larry-dillon-headshot.jpg"
              alt="Larry Dillon, founder of My DIY Haven, smiling"
              width="571"
              height="835"
              loading="lazy"
            />
          </div>
          <span className="haven-portrait-caption">
            Larry Dillon
            <br />
            <small>Founder. Veteran. Maker.</small>
          </span>
        </div>
        <div>
          <p className="haven-eyebrow">Meet Larry</p>
          <h2>
            A lifetime of service.
            <br />
            <em>A new way to give back.</em>
          </h2>
          <p>
            An Army medic, a special education teacher, a football coach. Larry Dillon has spent his
            life showing up for others.
          </p>
          <p>
            When woodturning helped him find moments of calm while coping with PTSD, it opened the
            door to a new purpose: helping others find their own connection through creativity.
          </p>
          <p className="haven-story-emphasis">
            It started with a lathe and a pen.
            <br />
            It became a haven.
          </p>
          <Link to="/about" className="haven-text-link">
            Read Larry’s story <ArrowRight size={18} />
          </Link>
        </div>
      </section>
      <section className="haven-studio-teaser">
        <div className="haven-studio-photo">
          <img
            src="/images/stock-candle-making.jpg"
            alt="Hands setting a wick into a candle vessel; illustrative craft photography"
            width="1600"
            height="1067"
            loading="lazy"
          />
          <span>Room for a new kind of gathering.</span>
        </div>
        <div className="haven-studio-copy">
          <p className="haven-eyebrow">Coming soon · Classes & studio</p>
          <h2>
            Try something new.
            <br />
            <em>Find your people.</em>
          </h2>
          <p>
            We’re making room for candle-making and soap-making classes, open studio time, and
            private events. A place to slow down, learn together, and leave with something you made
            yourself.
          </p>
          <ul>
            <li>
              <Sparkles size={18} /> Candle & soap making
            </li>
            <li>
              <Users size={18} /> Open studio & private gatherings
            </li>
            <li>
              <HeartHandshake size={18} /> Veterans, families, first responders & community
            </li>
          </ul>
          <Link to="/studio" className="haven-button">
            See what’s coming <ArrowUpRight size={18} />
          </Link>
          <p className="haven-small-note">
            Dates and reservations will be announced here. Based at Elevator CoWarehousing.
          </p>
        </div>
      </section>
      <section className="haven-shell haven-section haven-belong">
        <img
          src="/images/my-diy-haven-gold-icon.png"
          alt=""
          width="325"
          height="365"
          loading="lazy"
        />
        <p className="haven-eyebrow">Come as you are</p>
        <h2>
          You don’t need to know
          <br />
          what you’ll make.
          <br />
          <em>Just that you belong.</em>
        </h2>
        <p>
          For veterans and their families. For first responders.
          <br />
          For our neighbors. For anyone ready to discover the joy of creating.
        </p>
        <Link to="/studio" className="haven-text-link">
          Find your place at the Haven <ArrowRight size={18} />
        </Link>
      </section>
    </>
  );
}
