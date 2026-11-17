import type { ReactElement } from "react";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document(): ReactElement {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="preload"
          href="/fonts/fraunces-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/source-sans-3-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </Head>
      <body className="bg-ink font-sans text-sand antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
