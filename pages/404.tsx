import Link from "next/link";
import type { ReactElement } from "react";
import { Seo } from "../components/Seo";
import { SiteShell } from "../components/SiteShell";

export default function NotFound(): ReactElement {
  return (
    <>
      <Seo
        title="Page not found — Album Bot"
        description="That page isn’t on Album Bot."
      />
      <SiteShell>
        <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-24">
          <p className="font-serif text-6xl font-semibold text-cream">404</p>
          <h1 className="mt-4 font-serif text-3xl text-cream">
            This page isn’t here.
          </h1>
          <p className="mt-3 max-w-md text-lg text-sand">
            The rest of Album Bot is still on the home page.
          </p>
          <Link href="/">
            <a className="mt-8 inline-flex w-fit rounded-full bg-amber px-5 py-3 text-sm font-semibold text-ink hover:bg-amber-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber">
              Back to Album Bot
            </a>
          </Link>
        </main>
      </SiteShell>
    </>
  );
}
