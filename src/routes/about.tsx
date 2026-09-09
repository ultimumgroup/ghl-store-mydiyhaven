import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Meet Larry Dillon | The Story of My DIY Haven" },
      {
        name: "description",
        content:
          "Meet Larry Dillon, Army veteran, educator and founder of My DIY Haven. Discover the personal story behind a welcoming place to create, connect and belong.",
      },
      { property: "og:title", content: "Meet Larry Dillon | My DIY Haven" },
      {
        property: "og:description",
        content: "A lifetime of service. A new way to bring people together through making.",
      },
      { property: "og:image", content: "https://mydiyhaven.com/images/larry-dillon-headshot.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://mydiyhaven.com/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="haven-shell haven-section grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
        <div>
          <p className="haven-eyebrow">Our founder · Our purpose</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            Meet Larry.
            <br />
            <span className="text-primary">Find your haven.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A veteran, a teacher, a coach. And a maker who found a new way to keep serving others.
          </p>
          <p className="mt-5 max-w-xl leading-relaxed text-muted-foreground">
            Larry Dillon founded My DIY Haven around a simple belief: making something with your own
            hands can open the door to connection, purpose and a place to belong.
          </p>
          <a
            href="#larrys-story"
            className="haven-button-outline mt-8 inline-flex items-center gap-3"
          >
            Read his story <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
        <figure className="mx-auto w-full max-w-[420px]">
          <div className="aspect-square overflow-hidden rounded-full border-[10px] border-background shadow-xl ring-1 ring-border">
            <img
              src="/images/larry-dillon-headshot.jpg"
              alt="Larry Dillon, founder of My DIY Haven, smiling"
              width="571"
              height="835"
              className="h-full w-full object-cover"
              style={{ objectPosition: "50% 60%" }}
              fetchPriority="high"
            />
          </div>
          <figcaption className="mt-6 text-center">
            <span className="block font-display text-2xl">Larry Dillon</span>
            <span className="mt-1 block text-sm tracking-wide text-muted-foreground">
              Founder · U.S. Army veteran · Maker
            </span>
          </figcaption>
        </figure>
      </section>

      <section id="larrys-story" className="scroll-mt-28 border-y border-border bg-card">
        <div className="haven-shell haven-section grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-24">
          <div>
            <p className="haven-eyebrow">The story behind the haven</p>
            <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              A lifetime of service.
              <br />A different kind of calling.
            </h2>
          </div>
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Larry is a disabled U.S. Army veteran. He served as an Army medic during the Operation
              Desert Storm era, including an assignment in South Korea. After the military, he
              continued serving others as a special education teacher and, later, a head high school
              football coach.
            </p>
            <p>
              While learning to cope with PTSD, Larry began woodturning and making handcrafted pens.
              The concentration and rhythm of working at the lathe felt calming. For a while,
              everything else could fade into the background as he focused on the piece taking shape
              in his hands.
            </p>
            <p>
              That personal experience planted the seed for My DIY Haven. His outlet happened to be
              a lathe and a pen. Someone else’s might be painting, laser engraving, 3D printing,
              making a T-shirt—or something they have yet to discover.
            </p>
            <p>
              Today, that idea guides the shop and the community Larry is building: a welcoming
              place for veterans, their families, first responders and neighbors to create, learn
              and connect.
            </p>
          </div>
        </div>
      </section>

      <section className="haven-shell haven-section">
        <div className="mx-auto max-w-3xl text-center">
          <p className="haven-eyebrow">People come first</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            The most meaningful thing we make is room for each other.
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Tools make possibilities. People give them purpose. There is room here to try something
            new, share what you know and enjoy the satisfaction of making.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              Icon: Sparkles,
              title: "Create at your own pace",
              text: "Start with curiosity. A pen, a print or a first project can be the beginning of something meaningful.",
            },
            {
              Icon: Users,
              title: "Connect through making",
              text: "Veterans, families, first responders and the wider community are part of the haven Larry is building.",
            },
            {
              Icon: Heart,
              title: "Make space to belong",
              text: "You don’t have to explain why you’re drawn to creating. Bring yourself, your ideas and a willingness to explore.",
            },
          ].map(({ Icon, title, text }) => (
            <article key={title} className="rounded-2xl border border-border bg-card p-8">
              <Icon className="text-primary" size={27} strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-6 font-display text-2xl">{title}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="haven-shell haven-section text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] opacity-80">
            Healing Through Creativity
          </p>
          <p className="mx-auto mt-5 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            Create. Connect.
            <br />
            Heal. Belong.
          </p>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed opacity-85">
            Explore what Larry makes today, and see what’s coming next to the studio inside Elevator
            CoWarehousing.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="haven-button bg-background text-foreground hover:bg-background/90"
            >
              Explore the shop <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link to="/studio" className="haven-button-outline border-current text-inherit">
              Discover the studio
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
