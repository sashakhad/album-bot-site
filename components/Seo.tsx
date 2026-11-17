import Head from "next/head";
import type { ReactElement } from "react";
import {
  absoluteUrl,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
} from "../lib/site";

type SeoProps = {
  title?: string;
  description?: string;
  jsonLd?: boolean;
};

type WebSiteSchema = {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  description: string;
  url?: string;
};

function websiteSchema(): WebSiteSchema {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: siteUrl,
    };
  }
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
  };
}

export function Seo(props: SeoProps): ReactElement {
  const title = props.title ?? SITE_TITLE;
  const description = props.description ?? SITE_DESCRIPTION;
  const image = absoluteUrl("/og.png");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const includeJsonLd = props.jsonLd ?? false;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#14110e" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Album Bot. Make a whole album." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="alternate icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      {siteUrl ? <meta property="og:url" content={siteUrl} /> : null}
      {siteUrl ? <link rel="canonical" href={siteUrl} /> : null}
      {includeJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema()),
          }}
        />
      ) : null}
    </Head>
  );
}
