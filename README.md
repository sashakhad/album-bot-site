# Album Bot

The public site for Album Bot. One page, for musicians and curious people: what it is, how a song gets made, what it costs, and how to join the beta.

## Develop

```bash
yarn install
yarn dev
```

`yarn build` generates the Prisma client and builds the static page. It does not need `DATABASE_URL`. The page never connects to a database. Prisma is still here from the scaffold.

Set `NEXT_PUBLIC_SITE_URL` (for example `https://example.com`) when the domain exists. That turns the Open Graph image and canonical URL into absolute links. The page builds without it.

## Invite link

`INVITE_HREF` in `components/InviteLink.tsx` is the string `TODO` on purpose. Point it at the real invite URL before sending people here. Don’t invent an address.
