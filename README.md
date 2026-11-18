# Album Bot

The site for Album Bot. One page, for musicians and curious people: what it is, how a song gets made, what it costs, and how to start.

## Develop

```bash
yarn install
yarn dev
```

`yarn build` builds the static page. It does not need `DATABASE_URL`. The page has no database.

`NEXT_PUBLIC_SITE_URL` is the canonical origin, set in Vercel to the deployed URL. Canonical and Open Graph tags read it. When it is unset, empty, or not an http(s) URL, they fall back to `https://album-bot-site.vercel.app`.

## Invite link

`ALBUM_BOT_INVITE_URL` in `components/InviteLink.tsx` stays empty until a verified Grok Bot invite URL exists. Both buttons go to `#get-started` on this page. Drop a real URL into that constant when one exists. Don’t invent an address.
