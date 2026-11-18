import type { ReactElement } from "react";

/**
 * Verified Grok Bot invite URL. Leave this empty until one exists.
 * An empty string keeps both buttons on this page’s How to start section.
 */
export const ALBUM_BOT_INVITE_URL = "";

const GET_STARTED_HREF = "#get-started";

type InviteVariant = "solid" | "large";

type InviteLinkProps = {
  variant?: InviteVariant;
};

function inviteHref(): string {
  const trimmed = ALBUM_BOT_INVITE_URL.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return GET_STARTED_HREF;
}

function classNameFor(variant: InviteVariant): string {
  const shared =
    "inline-flex items-center justify-center rounded-full bg-amber font-semibold text-ink transition hover:bg-amber-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber";
  if (variant === "large") {
    return `${shared} px-6 py-3 text-base`;
  }
  return `${shared} px-4 py-3 text-sm`;
}

export function InviteLink(props: InviteLinkProps): ReactElement {
  const variant = props.variant ?? "solid";

  return (
    <a href={inviteHref()} className={classNameFor(variant)}>
      Get started
    </a>
  );
}
