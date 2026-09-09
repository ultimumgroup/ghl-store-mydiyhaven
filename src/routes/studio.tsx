import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Flame, Sparkles, DoorOpen, CalendarHeart } from "lucide-react";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Classes & Creative Studio — Coming Soon | My DIY Haven" },
      {
        name: "description",
        content:
          "Candle making, soap making, open studio hours and private events are coming to My DIY Haven inside Elevator CoWarehousing. Discover Larry’s plans for a welcoming creative space.",
      },
      { property: "og:title", content: "A Place to Make Something Yours | My DIY Haven Studio" },
      {
        property: "og:description",
        content:
          "Explore upcoming classes, open studio hours and creative gatherings. Dates and reservations are coming soon.",
      },
    ],
    links: [{ rel: "canonical", href: "https://mydiyhaven.com/studio" }],
  }),
  component: StudioPage,
});

const plans = [
  {
    Icon: Flame,
    title: "Candle making",
    text: "A little light, made by you. Candle-making classes are part of Larry’s plans for hands-on time together.",
  },
  {
    Icon: Sparkles,
    title: "Soap making",
    text: "Explore a different kind of everyday craft. Soap-making classes are on the way, with details to follow.",
  },
  {
    Icon: DoorOpen,
    title: "Open studio",
    text: "Room to work on an idea and connect with other makers. Open studio hours and access details are coming soon.",
  },
  {
    Icon: CalendarHeart,
    title: "Private events",
    text: "Make creating part of your next gathering. Private event options and reservation details are being developed.",
  },
];
const faqs = [
  {
    question: "Can I reserve a class or event now?",
    answer:
      "Not yet. Classes, open studio hours and private events are coming soon. Dates, prices, participation details and reservation options will be posted here when they are ready.",
  },
  {
    question: "Where is My DIY Haven’s studio?",
    answer:
      "Larry’s space is inside Elevator CoWarehousing. Visit details, directions and scheduled hours will be shared alongside the upcoming studio offerings.",
  },
  {
    question: "Who is the studio for?",
    answer:
      "Larry is building a welcoming creative community for veterans, their families, first responders and neighbors. Any age, experience or participation requirements will be included in individual class details before booking opens.",
  },
  {
    question: "What else does Larry create?",
    answer:
      "His work spans handcrafted pens, laser engraving, 3D printing, DTF printing, screen printing, embroidery and more. Future studio offerings will depend on the project; access to every tool or process is not yet announced.",
  },
  {
    question: "Can I shop while the studio plans take shape?",
    answer:
      "Yes. You can explore the current online catalog of pens, pen blanks, personalized products and other goods. Studio reservations will be separate from shopping for products.",
  },
];

function StudioPage() {
  return (
    <>
      <section className="haven-shell haven-section">
        <div className="max-w-4xl">
          <p className="haven-eyebrow">The studio at My DIY Haven</p>
          <span className="mt-6 inline-flex rounded-full border border-primary/25 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Classes & gatherings coming soon
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            A little curiosity.
            <br />A place to create.
            <br />
            <span className="text-primary">Something to call yours.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-muted-foreground">
            Larry is making room for more than finished products. Inside Elevator CoWarehousing, the
            next chapter of My DIY Haven will bring people together around the joy of making.
          </p>
          <a href="#whats-coming" className="haven-button mt-8 inline-flex items-center gap-3">
            See what’s coming <ArrowRight size={17} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section id="whats-coming" className="scroll-mt-28 border-y border-border bg-card">
        <div className="haven-shell haven-section">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="haven-eyebrow">On the workbench</p>
              <h2 className="mt-4 font-display text-4xl sm:text-5xl">
                Good things take shape here.
              </h2>
            </div>
            <p className="max-w-sm leading-relaxed text-muted-foreground">
              These experiences are in the works. Schedules, pricing and reservations have not
              opened yet.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {plans.map(({ Icon, title, text }, index) => (
              <article
                key={title}
                className="rounded-2xl border border-border bg-background p-7 sm:p-10"
              >
                <div className="flex items-center justify-between">
                  <Icon size={30} strokeWidth={1.4} className="text-primary" aria-hidden="true" />
                  <span className="text-xs tracking-[0.15em] text-muted-foreground">
                    0{index + 1} / COMING SOON
                  </span>
                </div>
                <h3 className="mt-8 font-display text-3xl">{title}</h3>
                <p className="mt-4 max-w-lg leading-relaxed text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="haven-shell haven-section grid gap-10 lg:grid-cols-2 lg:gap-24">
        <div>
          <p className="haven-eyebrow">An idea rooted in experience</p>
          <h2 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            The project is the beginning.
            <br />
            The people are the point.
          </h2>
        </div>
        <div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            For Larry, making handcrafted pens became a source of focus and calm. My DIY Haven grew
            from his desire to make space for others to discover their own creative outlet.
          </p>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            That people-first spirit will guide the studio as it grows: opportunities to learn, time
            to connect and the simple satisfaction of making something with your own hands.
          </p>
          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-3 font-semibold text-primary underline-offset-4 hover:underline"
          >
            Meet the maker behind the haven <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </section>
      <section className="border-y border-border bg-card">
        <div className="haven-shell haven-section grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <div>
            <p className="haven-eyebrow">A few useful details</p>
            <h2 className="mt-4 font-display text-4xl">Before you make plans.</h2>
          </div>
          <div className="divide-y divide-border">
            {faqs.map(({ question, answer }) => (
              <details key={question} className="group py-6 first:pt-0">
                <summary className="cursor-pointer text-lg font-medium leading-relaxed marker:text-primary">
                  {question}
                </summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="haven-shell haven-section text-center">
        <p className="haven-eyebrow">Made with purpose</p>
        <h2 className="mt-5 font-display text-4xl sm:text-5xl">
          Until then, find your next inspiration.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Explore Larry’s current collection—from pen-making supplies to pieces with a personal
          story.
        </p>
        <Link to="/products" className="haven-button mt-8 inline-flex items-center gap-3">
          Explore the shop <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
