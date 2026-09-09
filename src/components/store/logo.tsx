import { Link } from "@tanstack/react-router";
import { BRAND_NAME, LOGO_URL } from "@/lib/brand";

type LogoProps = {
  /** Click target when the logo is used as a link. */
  to?: string;
  /** Tailwind classes for the logo <img>. Height is constrained; width auto. */
  className?: string;
  /** Tailwind classes for the wordmark text. */
  textClassName?: string;
};

/**
 * Brand logo: icon image + "My DIY Haven" wordmark rendered as text.
 * The icon asset is amber/gold, so the wordmark uses the brand amber token
 * to match.
 */
export function Logo({ to, className, textClassName }: LogoProps) {
  const content = (
    <span className="inline-flex items-center gap-2">
      <img
        src={LOGO_URL}
        alt=""
        aria-hidden="true"
        className={className ?? "h-9 w-auto"}
        loading="eager"
      />
      <span className={textClassName ?? "font-display text-lg font-bold text-amber"}>
        {BRAND_NAME}
      </span>
    </span>
  );

  if (to) {
    return (
      <Link to={to} className="inline-flex items-center" aria-label={BRAND_NAME}>
        {content}
      </Link>
    );
  }
  return (
    <span className="inline-flex items-center" aria-label={BRAND_NAME}>
      {content}
    </span>
  );
}
