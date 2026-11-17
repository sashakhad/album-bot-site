import Link from "next/link";
import type { ReactElement, ReactNode } from "react";
import { InviteLink } from "./InviteLink";
import { Seo } from "./Seo";
import { SiteShell } from "./SiteShell";
import {
  costRows,
  createCredits,
  freeTakesPerDay,
  PRICING_CHECKED_ON,
  SAMPLE_ALBUM_NAME,
  SAMPLE_ALBUM_URL,
  dollars,
  sunoFreeCreditsPerDay,
  sunoFreeMonthly,
  sunoPlatinumMonthly,
  sunoPlatinumYearlyBilled,
  sunoPlatinumYearlyMonthly,
  sunoPremierYearlyBilled,
  sunoPremierYearlyMonthly,
  sunoProYearlyBilled,
  sunoProYearlyMonthly,
  SUNO_PRICING_URL,
  takesPerCreate,
  xPlusMonthly,
  xUltraMonthly,
  X_PRICING_URL,
  type CostRow,
} from "../lib/site";

const textLinkClass =
  "underline decoration-line underline-offset-4 transition hover:text-cream hover:decoration-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber";

type ExternalLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

function ExternalLink(props: ExternalLinkProps): ReactElement {
  const className = props.className ?? textLinkClass;
  return (
    <a href={props.href} className={className} target="_blank" rel="noreferrer">
      {props.children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function LightMark(): ReactElement {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-2.5 w-2.5 rounded-full bg-amber shadow-[0_0_14px_rgba(232,161,90,0.9)]"
    />
  );
}

function Command(props: { children: string }): ReactElement {
  return <code className="font-mono text-amber">{props.children}</code>;
}

type SectionProps = {
  id?: string;
  title: string;
  children: ReactNode;
};

function Section(props: SectionProps): ReactElement {
  return (
    <section
      id={props.id}
      className="scroll-mt-24 border-t border-line py-14 sm:py-16"
    >
      <h2 className="font-serif text-3xl font-semibold tracking-tight text-cream sm:text-4xl">
        {props.title}
      </h2>
      <div className="mt-6 flex flex-col gap-5 text-lg leading-relaxed text-sand">
        {props.children}
      </div>
    </section>
  );
}

function SiteHeader(): ReactElement {
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-3">
        <Link href="/">
          <a className="inline-flex items-center gap-2 font-serif text-lg font-semibold text-cream">
            <LightMark />
            Album Bot
          </a>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6" aria-label="Page">
          <a href="#sample" className="text-sm text-sand hover:text-cream">
            Sample
          </a>
          <InviteLink />
        </nav>
      </div>
    </header>
  );
}

function Hero(): ReactElement {
  return (
    <div className="mx-auto max-w-3xl px-5 pb-16 pt-16 sm:pb-20 sm:pt-24">
      <p className="text-sm font-semibold uppercase tracking-widest text-amber">
        An experiment, and it’s fun
      </p>
      <h1 className="mt-4 max-w-xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-cream sm:text-6xl">
        Make a whole album.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-sand sm:text-xl">
        An album has historically taken hundreds of hours, and thousands to tens
        of thousands of dollars. Album Bot walks you through a full, cohesive
        body of work for a small monthly cost, with your taste in the loop.
      </p>
      <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <InviteLink variant="large" />
        <a href="#sample" className={`text-base text-sand ${textLinkClass}`}>
          Listen to {SAMPLE_ALBUM_NAME}
        </a>
      </div>
    </div>
  );
}

function HowItWorks(): ReactElement {
  return (
    <Section title="How it works">
      <p>The bot opens with a choice.</p>
      <div className="flex flex-col gap-3">
        <p className="border-l-2 border-amber pl-4 italic text-cream">
          “Want to start building an album?”
        </p>
        <p className="border-l-2 border-amber/40 pl-4 italic text-cream">
          “Want to get set up first?”
        </p>
      </div>
      <p>
        <Command>/start</Command> runs a short questionnaire.{" "}
        <Command>/surprise</Command> lets it pick.
      </p>
      <p>
        It writes song prompts, makes Suno takes, and you listen and vote on
        your own album site. Then it finishes the finals.
      </p>
      <p>Setup gets you to Suno’s payment page. You only enter a card.</p>
    </Section>
  );
}

function Paths(): ReactElement {
  return (
    <Section title="Free or paid">
      <div className="grid gap-4 sm:grid-cols-2">
        <article className="h-full rounded-2xl border border-line bg-panel px-5 py-6">
          <h3 className="font-serif text-2xl text-cream">Free</h3>
          <p className="mt-3 text-base leading-relaxed text-sand">
            Suno Free is {dollars(sunoFreeMonthly)}, with{" "}
            {sunoFreeCreditsPerDay} credits a day. Songs are the shorter v6-mini
            kind, about 45–55 seconds, and they’re non-commercial. The bot makes
            them on suno.com, in its own browser.
          </p>
        </article>
        <article className="h-full rounded-2xl border border-line bg-panel px-5 py-6">
          <h3 className="font-serif text-2xl text-cream">Paid</h3>
          <p className="mt-3 text-base leading-relaxed text-sand">
            Suno Pro or Premier, through the Suno connector. Full-length songs,
            and commercial use.
          </p>
        </article>
      </div>
      <p className="text-base text-muted">
        A create spends {createCredits} credits and makes {takesPerCreate}{" "}
        takes. A free day covers {freeTakesPerDay} short takes.
      </p>
    </Section>
  );
}

function CostList(): ReactElement {
  return (
    <dl>
      {costRows.map(function renderCost(row: CostRow): ReactElement {
        return (
          <div
            key={row.id}
            className="flex flex-col gap-1 border-t border-line py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
          >
            <div>
              <dt className="text-cream">{row.name}</dt>
              <dd className="mt-1 text-base text-muted">{row.detail}</dd>
            </div>
            <dd className="flex items-baseline gap-1 font-serif text-3xl text-cream">
              <span>{dollars(row.monthly)}</span>
              <span className="font-sans text-base text-muted">/mo</span>
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function Costs(): ReactElement {
  return (
    <Section id="cost" title="What it costs">
      <p className="text-base text-muted">
        Monthly prices, before tax. GitHub and Vercel stay on the free tiers, so
        these are the whole bill.
      </p>
      <CostList />
      <p className="text-base text-muted">
        {`Suno also has Platinum at ${dollars(
          sunoPlatinumMonthly
        )} a month. X also has Ultra at ${dollars(
          xUltraMonthly
        )} a month, which includes Grok Bot. Plus is ${dollars(
          xPlusMonthly
        )} and does not include it. On a yearly Suno bill, Pro is ${dollars(
          sunoProYearlyMonthly
        )} a month (${dollars(
          sunoProYearlyBilled
        )} a year), Premier is ${dollars(sunoPremierYearlyMonthly)} (${dollars(
          sunoPremierYearlyBilled
        )}), and Platinum is ${dollars(sunoPlatinumYearlyMonthly)} (${dollars(
          sunoPlatinumYearlyBilled
        )}).`}
      </p>
      <p className="text-base text-muted">
        Checked {PRICING_CHECKED_ON} on{" "}
        <ExternalLink href={SUNO_PRICING_URL}>Suno’s pricing</ExternalLink> and{" "}
        <ExternalLink href={X_PRICING_URL}>X’s pricing</ExternalLink>. Prices
        change.
      </p>
    </Section>
  );
}

function Accounts(): ReactElement {
  return (
    <Section title="What you need">
      <ul className="flex flex-col gap-2">
        <li>Grok Bot, which needs X Premium or higher.</li>
        <li>A Suno account.</li>
        <li>GitHub, on the free tier.</li>
        <li>Vercel, on the free tier.</li>
      </ul>
    </Section>
  );
}

function PublicByDefault(): ReactElement {
  return (
    <Section title="Public by default">
      <p>
        Album sites are public. There’s no password and no privacy setup. If you
        want yours private, change the repo or the Vercel settings.
      </p>
    </Section>
  );
}

function Sample(): ReactElement {
  return (
    <Section id="sample" title="A sample">
      <p>Porch Light is a public album. It plays without signing in.</p>
      <ExternalLink
        href={SAMPLE_ALBUM_URL}
        className="block rounded-2xl border border-line bg-panel px-5 py-6 transition hover:border-amber focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber"
      >
        <p className="text-sm font-semibold uppercase tracking-widest text-amber">
          Listen
        </p>
        <p className="mt-2 font-serif text-3xl text-cream">
          {SAMPLE_ALBUM_NAME}
        </p>
        <p className="mt-2 text-base text-sand">Hit play. No sign-in.</p>
      </ExternalLink>
    </Section>
  );
}

function Join(): ReactElement {
  return (
    <Section id="join" title="Join the beta">
      <ol className="flex flex-col gap-4">
        <li className="flex gap-4">
          <span className="font-serif text-amber">1</span>
          <span>Create the bot.</span>
        </li>
        <li className="flex gap-4">
          <span className="font-serif text-amber">2</span>
          <span>Paste or link the Album Bot instructions.</span>
        </li>
        <li className="flex gap-4">
          <span className="font-serif text-amber">3</span>
          <span>The bot handles setup.</span>
        </li>
        <li className="flex gap-4">
          <span className="font-serif text-amber">4</span>
          <span>
            Type <Command>/start</Command>.
          </span>
        </li>
      </ol>
      <div className="mt-2 flex flex-col items-start gap-3">
        <InviteLink variant="large" />
        <p className="text-sm text-muted">The invite link isn’t up yet.</p>
      </div>
    </Section>
  );
}

function SiteFooter(): ReactElement {
  return (
    <footer className="border-t border-line py-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-2 px-5 text-sm text-muted">
        <p>Album Bot. An experiment.</p>
        <p>
          Prices from{" "}
          <ExternalLink href={SUNO_PRICING_URL}>suno.com/pricing</ExternalLink>{" "}
          and <ExternalLink href={X_PRICING_URL}>x.ai/pricing</ExternalLink>,{" "}
          {PRICING_CHECKED_ON}.
        </p>
      </div>
    </footer>
  );
}

export function LandingPage(): ReactElement {
  return (
    <>
      <Seo jsonLd />
      <SiteShell>
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-20 focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="content">
          <Hero />
          <div className="mx-auto max-w-3xl px-5">
            <HowItWorks />
            <Paths />
            <Costs />
            <Accounts />
            <PublicByDefault />
            <Sample />
            <Join />
          </div>
        </main>
        <SiteFooter />
      </SiteShell>
    </>
  );
}
